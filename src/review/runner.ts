export interface ReviewFinding {
  file: string;
  line?: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface ReviewResult {
  passed: boolean;
  summary: string;
  findings: ReviewFinding[];
}

export interface ReviewAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  runReview(baseBranch: string, cwd?: string): Promise<ReviewResult>;
}

export async function runReview(
  adapter: ReviewAdapter,
  baseBranch: string,
  cwd?: string,
): Promise<ReviewResult> {
  const available = await adapter.isAvailable();
  if (!available) {
    return {
      passed: true,
      summary: `${adapter.name} is not installed. Skipping review.`,
      findings: [],
    };
  }

  return adapter.runReview(baseBranch, cwd);
}

export function hasCriticalFindings(result: ReviewResult): boolean {
  return result.findings.some((f) => f.severity === 'critical');
}

export function hasWarnings(result: ReviewResult): boolean {
  return result.findings.some((f) => f.severity === 'warning');
}
