import type { ReviewAdapter, ReviewResult, ReviewFinding } from './runner.js';
import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
import { createMCPReviewClient, type MCPReviewClient } from './mcp-client.js';
import type { GitShipConfig } from '../config/schema.js';

export class CodexAdapter implements ReviewAdapter {
  name = 'Codex';
  transport: 'mcp' | 'cli';

  private config: GitShipConfig;
  private mcpClient: MCPReviewClient | null = null;

  constructor(config: GitShipConfig) {
    this.config = config;
    this.transport = config.review.transport;

    // Codex uses local MCP server (user runs `codex mcp`) with OPENAI_API_KEY
    if (this.transport === 'mcp' && process.env.OPENAI_API_KEY) {
      this.mcpClient = createMCPReviewClient({
        endpoint: config.review.endpoints.codex,
        apiKey: process.env.OPENAI_API_KEY,
        toolName: 'review_code',
        serviceName: 'Codex',
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

    return isCommandAvailable('codex');
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

  private async runCLIReview(baseBranch: string, cwd?: string): Promise<ReviewResult> {
    try {
      const prompt = [
        'Review the following git diff for bugs, security issues, and code quality problems.',
        'Output findings in the format: [severity] file:line - message',
        'Severity levels: critical, warning, info',
        `Compare against branch: ${baseBranch}`,
      ].join('\n');

      const { stdout } = await exec(
        'codex',
        ['exec', prompt],
        { cwd, timeout: 180_000 },
      );

      return this.parseOutput(stdout);
    } catch (error) {
      throw new ReviewError(
        'codex',
        `Codex review failed: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  private parseOutput(output: string): ReviewResult {
    const findings: ReviewFinding[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      const match = line.match(/\[(critical|warning|info)\]\s*(.+?):(\d+)\s*[-–]\s*(.*)/i);
      if (match) {
        findings.push({
          file: match[2],
          line: parseInt(match[3], 10),
          severity: match[1].toLowerCase() as 'critical' | 'warning' | 'info',
          message: match[4],
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
