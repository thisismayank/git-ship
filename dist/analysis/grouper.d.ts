import type { AIGroupResult } from './ai-client.js';
export interface CommitGroup {
    files: string[];
    type: string;
    scope: string;
    summary: string;
    rationale?: string;
}
interface HeuristicGroup {
    category: string;
    files: string[];
}
export declare function heuristicGroup(files: string[]): HeuristicGroup[];
export declare function mergeAIGroups(heuristic: HeuristicGroup[], aiResult: AIGroupResult[] | null, allFiles: string[]): CommitGroup[];
export {};
//# sourceMappingURL=grouper.d.ts.map