import type { CommitGroup } from '../analysis/grouper.js';
import type { ReviewResult } from '../review/runner.js';
import type { LinearIssue } from '../linear/types.js';
export declare function displayIssueContext(issue: LinearIssue): void;
export declare function displayCommitPlan(groups: CommitGroup[], issueId?: string): void;
export declare function displayReviewResults(result: ReviewResult): void;
export declare function displayChangedFiles(files: {
    path: string;
    status: string;
}[]): void;
//# sourceMappingURL=display.d.ts.map