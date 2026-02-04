export interface ParsedBranch {
    issueId: string | null;
    prefix: string | null;
    number: number | null;
    rest: string;
}
/**
 * Extracts a Linear issue ID from a branch name.
 *
 * Supports patterns like:
 *   - feat/ENG-123-some-description
 *   - ENG-123-some-description
 *   - fix/eng-456
 *   - mayank/ENG-789-task
 *   - feature/DES-42-design-update
 */
export declare function parseBranch(branchName: string, teamPrefixes?: string[]): ParsedBranch;
//# sourceMappingURL=branch-parser.d.ts.map