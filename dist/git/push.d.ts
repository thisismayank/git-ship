import type { SimpleGit } from 'simple-git';
export interface PushResult {
    branch: string;
    remote: string;
    success: boolean;
}
export declare function pushToRemote(git: SimpleGit, branch: string, options?: {
    setUpstream?: boolean;
    remote?: string;
}): Promise<PushResult>;
//# sourceMappingURL=push.d.ts.map