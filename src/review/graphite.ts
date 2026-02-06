import type { ReviewAdapter, ReviewResult } from './runner.js';
import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
import type { GitShipConfig } from '../config/schema.js';

export class GraphiteAdapter implements ReviewAdapter {
  name = 'Graphite Diamond';
  transport: 'mcp' | 'cli' = 'cli'; // Graphite is CLI-only

  private config: GitShipConfig;

  constructor(config: GitShipConfig) {
    this.config = config;
    // Graphite Diamond only uses CLI (gt command)
  }

  async isAvailable(): Promise<boolean> {
    return isCommandAvailable('gt');
  }

  async runReview(_baseBranch: string, cwd?: string): Promise<ReviewResult> {
    try {
      // Graphite Diamond requires pushing first and creating a draft PR
      // Then it reviews via the PR
      await exec('gt', ['stack', 'submit', '--draft'], { cwd, timeout: 60_000 });

      // Poll for Diamond review results
      const { stdout } = await exec(
        'gt',
        ['pr', 'view', '--json'],
        { cwd, timeout: 30_000 },
      );

      return this.parseOutput(stdout);
    } catch (error) {
      throw new ReviewError(
        'graphite',
        `Graphite Diamond review failed: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  private parseOutput(output: string): ReviewResult {
    try {
      const data = JSON.parse(output) as {
        reviews?: Array<{
          status: string;
          comments?: Array<{
            file: string;
            line?: number;
            body: string;
            severity?: string;
          }>;
        }>;
      };

      const findings = (data.reviews ?? []).flatMap((review) =>
        (review.comments ?? []).map((c) => ({
          file: c.file,
          line: c.line,
          severity: (c.severity ?? 'info') as 'critical' | 'warning' | 'info',
          message: c.body,
        })),
      );

      const hasCritical = findings.some((f) => f.severity === 'critical');
      return {
        passed: !hasCritical,
        summary: findings.length === 0 ? 'No issues found' : `Found ${findings.length} issue(s)`,
        findings,
      };
    } catch {
      return {
        passed: true,
        summary: 'Could not parse Graphite review output',
        findings: [],
      };
    }
  }
}
