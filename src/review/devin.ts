import type { ReviewAdapter, ReviewResult, ReviewFinding } from './runner.js';
import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';

export class DevinAdapter implements ReviewAdapter {
  name = 'Devin';

  async isAvailable(): Promise<boolean> {
    return isCommandAvailable('devin');
  }

  async runReview(_baseBranch: string, cwd?: string): Promise<ReviewResult> {
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
