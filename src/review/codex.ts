import type { ReviewAdapter, ReviewResult, ReviewFinding } from './runner.js';
import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';

export class CodexAdapter implements ReviewAdapter {
  name = 'Codex';

  async isAvailable(): Promise<boolean> {
    return isCommandAvailable('codex');
  }

  async runReview(baseBranch: string, cwd?: string): Promise<ReviewResult> {
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
