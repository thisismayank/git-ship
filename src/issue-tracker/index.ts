import type { GitShipConfig } from '../config/schema.js';
import type { IssueTrackerClient, IssueContext } from './types.js';
import { createLinearAdapter } from './linear-adapter.js';
import { createJiraClient } from './jira.js';
import { createAsanaClient } from './asana.js';

export type { IssueContext, IssueTrackerClient, PlainTextContext } from './types.js';
export { createPlainTextContext } from './types.js';

/**
 * Create an issue tracker client based on the configured provider.
 * Returns null if:
 * - Provider is 'none' or 'plain' (no external issue tracker)
 * - Required API key/config is missing
 */
export function createIssueTrackerClient(config: GitShipConfig): IssueTrackerClient | null {
  const provider = config.issueTracker.provider;

  switch (provider) {
    case 'linear':
      return createLinearAdapter(config);

    case 'jira':
      return createJiraClient(config);

    case 'asana':
      return createAsanaClient(config);

    case 'plain':
    case 'none':
    default:
      return null;
  }
}

/**
 * Check if the configured provider requires fetching external issue data.
 */
export function requiresIssueFetch(config: GitShipConfig): boolean {
  const provider = config.issueTracker.provider;
  return provider === 'linear' || provider === 'jira' || provider === 'asana';
}

/**
 * Check if the configured provider uses plain text requirements.
 */
export function usesPlainTextContext(config: GitShipConfig): boolean {
  return config.issueTracker.provider === 'plain';
}
