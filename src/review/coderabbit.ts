import type { ReviewAdapter, ReviewResult, ReviewFinding } from './runner.js';
import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
import { createMCPReviewClient, type MCPReviewClient } from './mcp-client.js';
import type { GitShipConfig } from '../config/schema.js';

export class CodeRabbitAdapter implements ReviewAdapter {
  name = 'CodeRabbit';
  transport: 'mcp' | 'cli';

  private config: GitShipConfig;
  private mcpClient: MCPReviewClient | null = null;

  constructor(config: GitShipConfig) {
    this.config = config;
    this.transport = config.review.transport;

    // Initialize MCP client if transport is MCP and API key is available
    if (this.transport === 'mcp' && process.env.CODERABBIT_API_KEY) {
      this.mcpClient = createMCPReviewClient({
        endpoint: config.review.endpoints.coderabbit,
        apiKey: process.env.CODERABBIT_API_KEY,
        toolName: 'review_code',
        serviceName: 'CodeRabbit',
      });
    }
  }

  async isAvailable(): Promise<boolean> {
    // Check MCP first if configured
    if (this.transport === 'mcp' && this.mcpClient) {
      const mcpAvailable = await this.mcpClient.isConnected();
      if (mcpAvailable) return true;
      // Fall back to CLI check
    }

    return isCommandAvailable('coderabbit');
  }

  async runReview(baseBranch: string, cwd?: string): Promise<ReviewResult> {
    // Try MCP first if configured and available
    if (this.transport === 'mcp' && this.mcpClient) {
      try {
        const mcpAvailable = await this.mcpClient.isConnected();
        if (mcpAvailable) {
          return await this.mcpClient.runReview(baseBranch, cwd);
        }
      } catch {
        // Fall through to CLI
      }
    }

    // Fall back to CLI
    return this.runCLIReview(baseBranch, cwd);
  }

  private async runCLIReview(_baseBranch: string, cwd?: string): Promise<ReviewResult> {
    try {
      const { stdout } = await exec(
        'npx',
        ['coderabbit', 'review', '--plain', '--type', 'uncommitted'],
        { cwd, timeout: 120_000 },
      );

      return this.parseOutput(stdout);
    } catch (error) {
      throw new ReviewError(
        'coderabbit',
        `CodeRabbit review failed: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  private parseOutput(output: string): ReviewResult {
    const findings: ReviewFinding[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Parse common review output patterns
      const criticalMatch = line.match(/\[critical\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i);
      const warningMatch = line.match(/\[warning\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i);
      const infoMatch = line.match(/\[info\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i);

      if (criticalMatch) {
        findings.push({
          file: criticalMatch[1],
          line: criticalMatch[2] ? parseInt(criticalMatch[2], 10) : undefined,
          severity: 'critical',
          message: criticalMatch[3],
        });
      } else if (warningMatch) {
        findings.push({
          file: warningMatch[1],
          line: warningMatch[2] ? parseInt(warningMatch[2], 10) : undefined,
          severity: 'warning',
          message: warningMatch[3],
        });
      } else if (infoMatch) {
        findings.push({
          file: infoMatch[1],
          line: infoMatch[2] ? parseInt(infoMatch[2], 10) : undefined,
          severity: 'info',
          message: infoMatch[3],
        });
      }
    }

    const hasCritical = findings.some((f) => f.severity === 'critical');
    return {
      passed: !hasCritical && findings.filter((f) => f.severity === 'warning').length === 0,
      summary: findings.length === 0
        ? 'No issues found'
        : `Found ${findings.length} issue(s)`,
      findings,
    };
  }
}
