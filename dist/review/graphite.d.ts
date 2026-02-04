import type { ReviewAdapter, ReviewResult } from './runner.js';
export declare class GraphiteAdapter implements ReviewAdapter {
    name: string;
    isAvailable(): Promise<boolean>;
    runReview(baseBranch: string, cwd?: string): Promise<ReviewResult>;
    private parseOutput;
}
//# sourceMappingURL=graphite.d.ts.map