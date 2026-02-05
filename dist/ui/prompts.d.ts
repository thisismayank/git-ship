import type { CommitGroup } from '../analysis/grouper.js';
export declare function promptIssueId(branchName: string): Promise<string | null>;
export type CommitPlanAction = 'accept' | 'edit' | 'regroup' | 'cancel';
export declare function promptCommitPlanAction(): Promise<CommitPlanAction>;
export declare function promptEditCommitMessage(group: CommitGroup): Promise<string>;
export type ReviewAction = 'push' | 'fix' | 'cancel';
export declare function promptReviewAction(hasCritical: boolean): Promise<ReviewAction>;
export declare function promptConfirmPush(branchName: string): Promise<boolean>;
export declare function promptSelectReviewTool(): Promise<string>;
export declare function promptMaxMessageLength(): Promise<number>;
//# sourceMappingURL=prompts.d.ts.map