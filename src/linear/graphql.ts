import { LinearClient as LinearSDK } from '@linear/sdk';
import type { LinearClient, LinearIssue } from './types.js';
import { LinearError } from '../utils/errors.js';

export function createGraphQLClient(apiKey: string): LinearClient {
  const sdk = new LinearSDK({ apiKey });

  return {
    async getIssue(issueId: string): Promise<LinearIssue | null> {
      try {
        // Linear SDK uses the identifier (e.g., "ENG-123") to search
        const issues = await sdk.issueSearch({ query: issueId, first: 1 });
        const nodes = issues.nodes;

        if (nodes.length === 0) return null;

        const issue = nodes[0];
        const state = await issue.state;
        const labels = await issue.labels();

        return {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description ?? null,
          state: state?.name ?? 'Unknown',
          labels: labels.nodes.map((l) => l.name),
          priority: issue.priority,
          url: issue.url,
        };
      } catch (error) {
        throw new LinearError(`Failed to fetch issue ${issueId}`, { cause: error });
      }
    },
  };
}
