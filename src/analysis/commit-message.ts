import type { CommitGroup } from './grouper.js';

export interface CommitMessageOptions {
  conventional: boolean;
  includeIssueRef: boolean;
  issueId: string | null;
  allowedTypes: string[];
  /** Maximum length for the commit header (first line) */
  maxHeaderLength: number;
  /** Maximum length for body lines (default: 72) */
  maxBodyLineLength?: number;
}

export function formatCommitMessage(
  group: CommitGroup,
  options: CommitMessageOptions,
): string {
  const { conventional, includeIssueRef, issueId, allowedTypes, maxHeaderLength } = options;
  const bodyLineLength = options.maxBodyLineLength ?? 72;

  if (!conventional) {
    const ref = includeIssueRef && issueId ? ` (${issueId})` : '';
    const header = `${group.summary}${ref}`;
    const body = group.body ? `\n\n${wrapText(group.body, bodyLineLength)}` : '';
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
    bodyParts.push(wrapText(group.body, bodyLineLength));
  }

  // Build the footer (requirement tracking and refs)
  const footerParts: string[] = [];

  if (group.addresses) {
    footerParts.push(wrapText(`Addresses: ${group.addresses}`, bodyLineLength));
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

  // Final safety wrap: re-wrap the entire body to catch any edge cases
  const assembledBody = sections.join('\n\n');
  const messageBody = assembledBody ? `\n\n${wrapText(assembledBody, bodyLineLength)}` : '';

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

/**
 * Word-wrap a single line to `maxLen` characters, preserving leading
 * whitespace (e.g. bullet-point indentation like "- ").
 */
function wrapLine(line: string, maxLen: number): string {
  if (line.length <= maxLen) return line;

  const leadingMatch = line.match(/^(\s*[-*]\s?|\s+)/);
  const indent = leadingMatch ? leadingMatch[0] : '';
  const continuationIndent = indent || '  ';

  const words = line.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const prefix = current.length === 0
      ? (lines.length === 0 ? '' : continuationIndent)
      : ' ';
    if (current.length + prefix.length + word.length > maxLen && current.length > 0) {
      lines.push(current);
      current = continuationIndent + word;
    } else {
      current += prefix + word;
    }
  }
  if (current.length > 0) lines.push(current);

  return lines.join('\n');
}

/**
 * Word-wrap all lines in a block of text so no line exceeds `maxLen` chars.
 */
function wrapText(text: string, maxLen: number = 72): string {
  return text.split('\n').map((line) => wrapLine(line, maxLen)).join('\n');
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
