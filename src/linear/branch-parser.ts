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
export function parseBranch(branchName: string, teamPrefixes: string[] = []): ParsedBranch {
  // Build regex: match known team prefixes or any 2-5 letter prefix
  const prefixPattern =
    teamPrefixes.length > 0
      ? `(${teamPrefixes.join('|')}|[A-Za-z]{2,5})`
      : '([A-Za-z]{2,5})';

  const regex = new RegExp(`(?:^|/)${prefixPattern}-(\\d+)(?:-|$)`, 'i');
  const match = regex.exec(branchName);

  if (match) {
    const prefix = match[1].toUpperCase();
    const number = parseInt(match[2], 10);
    const issueId = `${prefix}-${number}`;

    // Extract the rest of the branch name after the issue ID
    const issueIdIndex = branchName.toLowerCase().indexOf(`${prefix.toLowerCase()}-${number}`);
    const afterIssueId = branchName.slice(issueIdIndex + issueId.length);
    const rest = afterIssueId.replace(/^-/, '').replace(/-/g, ' ').trim();

    return { issueId, prefix, number, rest };
  }

  return { issueId: null, prefix: null, number: null, rest: branchName };
}
