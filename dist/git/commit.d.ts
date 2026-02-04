import type { SimpleGit } from 'simple-git';
export interface CommitInput {
    files: string[];
    message: string;
}
export interface CommitResult {
    hash: string;
    message: string;
    filesCommitted: string[];
}
export declare function stageAndCommit(git: SimpleGit, input: CommitInput): Promise<CommitResult>;
export declare function stageAndCommitMultiple(git: SimpleGit, commits: CommitInput[]): Promise<CommitResult[]>;
//# sourceMappingURL=commit.d.ts.map