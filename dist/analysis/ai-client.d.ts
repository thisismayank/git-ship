import type { GitShipConfig } from '../config/schema.js';
import type { FileDiff } from '../git/diff.js';
import type { LinearIssue } from '../linear/types.js';
export interface AIGroupResult {
    files: string[];
    type: string;
    scope: string;
    summary: string;
    rationale: string;
}
export declare function analyzeWithAI(config: GitShipConfig, diffs: FileDiff[], heuristicGroups: Array<{
    category: string;
    files: string[];
}>, issue: LinearIssue | null): Promise<AIGroupResult[] | null>;
//# sourceMappingURL=ai-client.d.ts.map