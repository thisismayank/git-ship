import type { IssueTrackerProvider } from '../config/schema.js';

/**
 * Generic issue context that can come from any issue tracker.
 * This is the unified format used by the AI prompt builder.
 */
export interface IssueContext {
  /** Source provider (linear, jira, asana, plain) */
  source: IssueTrackerProvider;
  /** Issue identifier (e.g., "ENG-123", "PROJ-456") */
  identifier: string;
  /** Issue title */
  title: string;
  /** Issue description or requirements text */
  description: string | null;
  /** Labels/tags associated with the issue */
  labels: string[];
  /** URL to the issue (if available) */
  url: string | null;
}

/**
 * Plain text context entered manually by the user.
 * Used when no issue tracker is configured or user wants to provide custom context.
 */
export interface PlainTextContext extends IssueContext {
  source: 'plain';
  identifier: 'manual';
  title: 'Manual Requirements';
  url: null;
}

/**
 * Generic interface for issue tracker clients.
 * All providers (Linear, Jira, Asana) implement this interface.
 */
export interface IssueTrackerClient {
  /** Provider name for display purposes */
  readonly name: string;
  /** Fetch issue details by identifier */
  getIssue(issueId: string): Promise<IssueContext | null>;
}

/**
 * Create a plain text context from user-provided requirements.
 */
export function createPlainTextContext(requirements: string): PlainTextContext {
  return {
    source: 'plain',
    identifier: 'manual',
    title: 'Manual Requirements',
    description: requirements,
    labels: [],
    url: null,
  };
}
