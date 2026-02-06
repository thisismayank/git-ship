import type { ReviewAdapter, ReviewResult, ReviewFinding } from './runner.js';
import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
import { createMCPReviewClient, type MCPReviewClient } from './mcp-client.js';
import type { GitShipConfig } from '../config/schema.js';

export class DevinAdapter implements ReviewAdapter {
  name = 'Devin';
  transport: 'mcp' | 'cli';

  private config: GitShipConfig;
  private mcpClient: MCPReviewClient | null = null;

  constructor(config: GitShipConfig) {
    this.config = config;
    this.transport = config.review.transport;

    // Initialize MCP client if transport is MCP and API key is available
    if (this.transport === 'mcp' && process.env.DEVIN_API_KEY) {
      this.mcpClient = createMCPReviewClient({
        endpoint: config.review.endpoints.devin,
        apiKey: process.env.DEVIN_API_KEY,
        toolName: 'review_code',
        serviceName: 'Devin',
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

    return isCommandAvailable('devin');
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
        ['devin-review'],
        { cwd, timeout: 180_000 },
      );

      return this.parseOutput(stdout);
    } catch (error) {
      throw new ReviewError(
        'devin',
        `Devin review failed: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  private parseOutput(output: string): ReviewResult {
    const findings: ReviewFinding[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Devin outputs findings in structured format
      const findingMatch = line.match(/(error|warning|info):\s*(.+?)\s*@\s*(.+?):(\d+)/i);
      if (findingMatch) {
        const severity =
          findingMatch[1].toLowerCase() === 'error' ? 'critical' :
          findingMatch[1].toLowerCase() === 'warning' ? 'warning' : 'info';
        findings.push({
          file: findingMatch[3],
          line: parseInt(findingMatch[4], 10),
          severity,
          message: findingMatch[2],
        });
      }
    }

    const hasCritical = findings.some((f) => f.severity === 'critical');
    return {
      passed: !hasCritical,
      summary: findings.length === 0 ? 'No issues found' : `Found ${findings.length} issue(s)`,
      findings,
    };
  }
}
