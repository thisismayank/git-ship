import { LinearClient as LinearSDK } from '@linear/sdk';
import type { LinearClient, LinearIssue } from './types.js';
import { LinearError } from '../utils/errors.js';

export function createGraphQLClient(apiKey: string): LinearClient {
  const sdk = new LinearSDK({ apiKey });

  return {
    async getIssue(issueId: string): Promise<LinearIssue | null> {
      try {
        // Use issue() directly with the identifier (e.g., "ENG-123")
        const issue = await sdk.issue(issueId);

        if (!issue) return null;

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
        // If issue not found, the SDK throws an error
        const errorMessage = (error as Error).message || '';
        if (errorMessage.includes('not found') || errorMessage.includes('Entity not found')) {
          return null;
        }
        throw new LinearError(`Failed to fetch issue ${issueId}`, { cause: error });
      }
    },
  };
}
