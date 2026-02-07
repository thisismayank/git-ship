import type { GitShipConfig } from '../config/schema.js';
import type { IssueTrackerClient, IssueContext } from './types.js';
import { logger } from '../utils/logger.js';

interface AsanaTask {
  gid: string;
  name: string;
  notes: string;
  tags: Array<{ name: string }>;
  permalink_url: string;
}

interface AsanaResponse {
  data: AsanaTask;
}

/**
 * Asana client using REST API.
 *
 * EXPERIMENTAL: This integration is in beta and may not work with all Asana configurations.
 *
 * Required environment variable:
 * - ASANA_ACCESS_TOKEN: Personal Access Token (create at https://app.asana.com/0/my-apps)
 *
 * Note: Asana uses task GIDs (global IDs) as identifiers. The branch parser will need
 * to be extended to handle Asana task formats if used.
 */
class AsanaClient implements IssueTrackerClient {
  readonly name = 'Asana (Experimental)';
  private readonly baseUrl = 'https://app.asana.com/api/1.0';

  constructor(private accessToken: string) {}

  async getIssue(taskId: string): Promise<IssueContext | null> {
    try {
      // Asana tasks can be identified by GID or by a custom field
      // For simplicity, we expect the task GID directly
      const url = `${this.baseUrl}/tasks/${taskId}?opt_fields=gid,name,notes,tags.name,permalink_url`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Asana API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as AsanaResponse;
      return this.convertToIssueContext(result.data);
    } catch (error) {
      logger.debug(`Asana fetch failed: ${(error as Error).message}`);
      return null;
    }
  }

  private convertToIssueContext(task: AsanaTask): IssueContext {
    return {
      source: 'asana',
      identifier: task.gid,
      title: task.name,
      description: task.notes || null,
      labels: task.tags?.map((tag) => tag.name) ?? [],
      url: task.permalink_url,
    };
  }
}

export function createAsanaClient(_config: GitShipConfig): IssueTrackerClient | null {
  const accessToken = process.env.ASANA_ACCESS_TOKEN;

  if (!accessToken) {
    logger.debug('ASANA_ACCESS_TOKEN not set');
    return null;
  }

  return new AsanaClient(accessToken);
}
