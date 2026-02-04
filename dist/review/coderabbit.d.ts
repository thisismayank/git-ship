import type { ReviewAdapter, ReviewResult } from './runner.js';
export declare class CodeRabbitAdapter implements ReviewAdapter {
    name: string;
    isAvailable(): Promise<boolean>;
    runReview(baseBranch: string, cwd?: string): Promise<ReviewResult>;
    private parseOutput;
}
//# sourceMappingURL=coderabbit.d.ts.map