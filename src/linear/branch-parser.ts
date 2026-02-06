export interface ParsedBranch {
  issueId: string | null;
  prefix: string | null;
  number: number | null;
  rest: string;
  /** Confidence level: 'high' if prefix matches known team prefixes, 'medium' otherwise */
  confidence: 'high' | 'medium' | 'low';
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
 *   - feat/oxford-optimisation-elm-123 (issue ID anywhere in branch)
 *   - feature-abc-123-description (issue ID in middle)
 */
export function parseBranch(branchName: string, teamPrefixes: string[] = []): ParsedBranch {
  const normalizedPrefixes = teamPrefixes.map((p) => p.toUpperCase());

  // Strategy 1: Try to match known team prefixes first (high confidence)
  if (normalizedPrefixes.length > 0) {
    const knownPrefixPattern = `(${normalizedPrefixes.join('|')})-(\\d+)`;
    const knownRegex = new RegExp(knownPrefixPattern, 'i');
    const knownMatch = knownRegex.exec(branchName);

    if (knownMatch) {
      const prefix = knownMatch[1].toUpperCase();
      const number = parseInt(knownMatch[2], 10);
      const issueId = `${prefix}-${number}`;
      const rest = extractRest(branchName, issueId);

      return { issueId, prefix, number, rest, confidence: 'high' };
    }
  }

  // Strategy 2: Match any 2-5 letter prefix followed by hyphen and digits
  // Can appear anywhere in the branch name (after /, -, _, or at start)
  const genericPattern = /(?:^|[/\-_])([A-Za-z]{2,5})-(\d+)(?:[/\-_]|$)/;
  const genericMatch = genericPattern.exec(branchName);

  if (genericMatch) {
    const prefix = genericMatch[1].toUpperCase();
    const number = parseInt(genericMatch[2], 10);
    const issueId = `${prefix}-${number}`;
    const rest = extractRest(branchName, issueId);

    return { issueId, prefix, number, rest, confidence: 'medium' };
  }

  // Strategy 3: Try to find issue pattern at the end of branch name
  // Handles: feat/oxford-optimisation-elm-123
  const endPattern = /([A-Za-z]{2,5})-(\d+)$/i;
  const endMatch = endPattern.exec(branchName);

  if (endMatch) {
    const prefix = endMatch[1].toUpperCase();
    const number = parseInt(endMatch[2], 10);
    const issueId = `${prefix}-${number}`;
    const rest = extractRest(branchName, issueId);

    return { issueId, prefix, number, rest, confidence: 'medium' };
  }

  return { issueId: null, prefix: null, number: null, rest: branchName, confidence: 'low' };
}

function extractRest(branchName: string, issueId: string): string {
  const issueIdIndex = branchName.toLowerCase().indexOf(issueId.toLowerCase());
  if (issueIdIndex === -1) return branchName;

  // Get text before and after the issue ID
  const before = branchName.slice(0, issueIdIndex);
  const after = branchName.slice(issueIdIndex + issueId.length);

  // Clean up: remove first path segment (feat/, fix/, mayank/, etc.) and trailing separators
  const cleanBefore = before
    .replace(/^[^/]*\//, '')   // Remove first path segment (branch type/username)
    .replace(/[/\-_]+$/, '')   // Remove trailing separators
    .replace(/[-_]/g, ' ')     // Convert remaining separators to spaces
    .trim();

  const cleanAfter = after.replace(/^[/\-_]+/, '').replace(/[-_]/g, ' ').trim();

  return [cleanBefore, cleanAfter].filter(Boolean).join(' ').trim();
}
