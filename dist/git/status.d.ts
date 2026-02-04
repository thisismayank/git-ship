import { type SimpleGit } from 'simple-git';
export interface ChangedFile {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    from?: string;
}
export interface GitStatus {
    branch: string;
    tracking: string | null;
    changedFiles: ChangedFile[];
    isClean: boolean;
}
export declare function createGit(cwd?: string): SimpleGit;
export declare function getStatus(git: SimpleGit): Promise<GitStatus>;
export declare function getCurrentBranch(git: SimpleGit): Promise<string>;
//# sourceMappingURL=status.d.ts.map