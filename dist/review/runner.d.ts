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
export declare function runReview(adapter: ReviewAdapter, baseBranch: string, cwd?: string): Promise<ReviewResult>;
export declare function hasCriticalFindings(result: ReviewResult): boolean;
export declare function hasWarnings(result: ReviewResult): boolean;
//# sourceMappingURL=runner.d.ts.map