import type { ReviewAdapter, ReviewResult } from './runner.js';
export declare class DevinAdapter implements ReviewAdapter {
    name: string;
    isAvailable(): Promise<boolean>;
    runReview(_baseBranch: string, cwd?: string): Promise<ReviewResult>;
    private parseOutput;
}
//# sourceMappingURL=devin.d.ts.map