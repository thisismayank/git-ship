import type { CommitGroup } from './grouper.js';
export interface CommitMessageOptions {
    conventional: boolean;
    includeIssueRef: boolean;
    issueId: string | null;
    allowedTypes: string[];
}
export declare function formatCommitMessage(group: CommitGroup, options: CommitMessageOptions): string;
export declare function formatAllCommitMessages(groups: CommitGroup[], options: CommitMessageOptions): Array<{
    files: string[];
    message: string;
}>;
//# sourceMappingURL=commit-message.d.ts.map