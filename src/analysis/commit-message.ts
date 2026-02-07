import type { CommitGroup } from './grouper.js';

export interface CommitMessageOptions {
  conventional: boolean;
  includeIssueRef: boolean;
  issueId: string | null;
  allowedTypes: string[];
  /** Maximum length for the commit header (first line) */
  maxHeaderLength: number;
}

export function formatCommitMessage(
  group: CommitGroup,
  options: CommitMessageOptions,
): string {
  const { conventional, includeIssueRef, issueId, allowedTypes, maxHeaderLength } = options;

  if (!conventional) {
    const ref = includeIssueRef && issueId ? ` (${issueId})` : '';
    const header = `${group.summary}${ref}`;
    const body = group.body ? `\n\n${group.body}` : '';
    return `${header}${body}`;
  }

  // Validate type
  const type = allowedTypes.includes(group.type) ? group.type : 'chore';
  const scope = group.scope ? `(${sanitizeScope(group.scope)})` : '';

  // Calculate available length for summary (header = type + scope + ": " + summary)
  const prefixLength = type.length + scope.length + 2; // 2 for ": "
  const availableSummaryLength = maxHeaderLength - prefixLength;
  const summary = sanitizeSummary(group.summary, Math.max(20, availableSummaryLength));

  // Build the header (first line)
  const header = `${type}${scope}: ${summary}`;

  // Build the body (detailed explanation)
  const bodyParts: string[] = [];

  if (group.body) {
    bodyParts.push(group.body);
  }

  // Build the footer (requirement tracking and refs)
  const footerParts: string[] = [];

  if (group.addresses) {
    footerParts.push(`Addresses: ${group.addresses}`);
  }

  if (includeIssueRef && issueId) {
    footerParts.push(`Refs: ${issueId}`);
  }

  // Combine body and footer with proper spacing
  const sections: string[] = [];
  if (bodyParts.length > 0) {
    sections.push(bodyParts.join('\n\n'));
  }
  if (footerParts.length > 0) {
    sections.push(footerParts.join('\n'));
  }

  const messageBody = sections.length > 0 ? `\n\n${sections.join('\n\n')}` : '';

  return `${header}${messageBody}`;
}

export function formatAllCommitMessages(
  groups: CommitGroup[],
  options: CommitMessageOptions,
): Array<{ files: string[]; message: string }> {
  return groups.map((group) => ({
    files: group.files,
    message: formatCommitMessage(group, options),
  }));
}

function sanitizeScope(scope: string): string {
  return scope
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/\//g, '-')
    .slice(0, 30);
}

function sanitizeSummary(summary: string, maxLength: number): string {
  // Ensure lowercase first letter
  let s = summary.trim();
  if (s.length === 0) return 'update';
  s = s.charAt(0).toLowerCase() + s.slice(1);
  // Remove trailing period
  if (s.endsWith('.')) s = s.slice(0, -1);
  // Limit length
  if (s.length > maxLength) s = s.slice(0, maxLength - 3) + '...';
  return s;
}
