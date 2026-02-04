import type { SimpleGit } from 'simple-git';
export interface DiffHunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    content: string;
}
export interface FileDiff {
    path: string;
    status: string;
    additions: number;
    deletions: number;
    hunks: DiffHunk[];
    binary: boolean;
}
export declare function getFileDiffs(git: SimpleGit, files: string[]): Promise<FileDiff[]>;
export declare function truncateDiff(diff: FileDiff, maxChars?: number): string;
//# sourceMappingURL=diff.d.ts.map