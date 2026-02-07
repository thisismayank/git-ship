import type { GitShipConfig } from '../config/schema.js';
import type { IssueTrackerClient, IssueContext } from './types.js';
import { createLinearClient, type LinearIssue } from '../linear/index.js';

/**
 * Adapter that wraps the existing Linear client to conform to the generic IssueTrackerClient interface.
 */
class LinearAdapter implements IssueTrackerClient {
  readonly name = 'Linear';
  private linearClient: ReturnType<typeof createLinearClient>;

  constructor(config: GitShipConfig) {
    this.linearClient = createLinearClient(config);
  }

  async getIssue(issueId: string): Promise<IssueContext | null> {
    if (!this.linearClient) return null;

    const linearIssue = await this.linearClient.getIssue(issueId);
    if (!linearIssue) return null;

    return this.convertToIssueContext(linearIssue);
  }

  private convertToIssueContext(issue: LinearIssue): IssueContext {
    return {
      source: 'linear',
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      labels: issue.labels,
      url: issue.url,
    };
  }
}

export function createLinearAdapter(config: GitShipConfig): IssueTrackerClient | null {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return null;

  return new LinearAdapter(config);
}
