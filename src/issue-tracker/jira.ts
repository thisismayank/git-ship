import type { GitShipConfig } from '../config/schema.js';
import type { IssueTrackerClient, IssueContext } from './types.js';
import { logger } from '../utils/logger.js';

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description: string | null;
    labels: Array<{ name: string } | string>;
    status: { name: string };
  };
}

/**
 * Jira client using REST API v3.
 *
 * EXPERIMENTAL: This integration is in beta and may not work with all Jira configurations.
 *
 * Required environment variables:
 * - JIRA_API_TOKEN: API token (create at https://id.atlassian.com/manage-profile/security/api-tokens)
 * - JIRA_EMAIL: Email associated with the API token
 *
 * Required config:
 * - jira.baseUrl: Your Jira instance URL (e.g., https://yourcompany.atlassian.net)
 */
class JiraClient implements IssueTrackerClient {
  readonly name = 'Jira (Experimental)';

  constructor(
    private baseUrl: string,
    private email: string,
    private apiToken: string,
  ) {}

  async getIssue(issueId: string): Promise<IssueContext | null> {
    try {
      const url = `${this.baseUrl}/rest/api/3/issue/${issueId}`;
      const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`);
      }

      const issue = await response.json() as JiraIssue;
      return this.convertToIssueContext(issue);
    } catch (error) {
      logger.debug(`Jira fetch failed: ${(error as Error).message}`);
      return null;
    }
  }

  private convertToIssueContext(issue: JiraIssue): IssueContext {
    // Handle labels which can be strings or objects depending on Jira version
    const labels = issue.fields.labels.map((label) =>
      typeof label === 'string' ? label : label.name
    );

    // Parse description - Jira uses Atlassian Document Format (ADF)
    const description = this.parseDescription(issue.fields.description);

    return {
      source: 'jira',
      identifier: issue.key,
      title: issue.fields.summary,
      description,
      labels,
      url: `${this.baseUrl}/browse/${issue.key}`,
    };
  }

  private parseDescription(description: string | null): string | null {
    if (!description) return null;

    // If it's a string, return as-is (older Jira versions)
    if (typeof description === 'string') return description;

    // For ADF format, try to extract plain text
    try {
      const adf = description as unknown as { content?: Array<{ content?: Array<{ text?: string }> }> };
      if (adf.content) {
        return adf.content
          .flatMap((block) => block.content?.map((item) => item.text) ?? [])
          .filter(Boolean)
          .join('\n');
      }
    } catch {
      // Fall back to stringifying if parsing fails
    }

    return JSON.stringify(description);
  }
}

export function createJiraClient(config: GitShipConfig): IssueTrackerClient | null {
  const apiToken = process.env.JIRA_API_TOKEN;
  const email = process.env.JIRA_EMAIL;
  const baseUrl = config.jira.baseUrl;

  if (!apiToken || !email) {
    logger.debug('JIRA_API_TOKEN or JIRA_EMAIL not set');
    return null;
  }

  if (!baseUrl) {
    logger.debug('Jira base URL not configured');
    return null;
  }

  return new JiraClient(baseUrl, email, apiToken);
}
