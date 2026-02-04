import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { LinearClient, LinearIssue } from './types.js';
import { LinearError } from '../utils/errors.js';

export function createMCPClient(endpoint: string, apiKey: string): LinearClient {
  let client: Client | null = null;

  async function getClient(): Promise<Client> {
    if (client) return client;

    client = new Client(
      { name: 'git-ship', version: '0.1.0' },
      { capabilities: {} },
    );

    const url = new URL(endpoint);
    url.searchParams.set('apiKey', apiKey);

    const transport = new SSEClientTransport(url);
    await client.connect(transport);

    return client;
  }

  return {
    async getIssue(issueId: string): Promise<LinearIssue | null> {
      try {
        const c = await getClient();

        const result = await c.callTool({
          name: 'get_issue',
          arguments: { issueId },
        });

        if (!result.content || (result.content as Array<{ type: string; text?: string }>).length === 0) {
          return null;
        }

        const textContent = (result.content as Array<{ type: string; text?: string }>).find(
          (c) => c.type === 'text',
        );
        if (!textContent?.text) return null;

        const data = JSON.parse(textContent.text) as {
          id: string;
          identifier: string;
          title: string;
          description?: string;
          state?: { name: string };
          labels?: { nodes: Array<{ name: string }> };
          priority: number;
          url: string;
        };

        return {
          id: data.id,
          identifier: data.identifier,
          title: data.title,
          description: data.description ?? null,
          state: data.state?.name ?? 'Unknown',
          labels: data.labels?.nodes?.map((l) => l.name) ?? [],
          priority: data.priority,
          url: data.url,
        };
      } catch (error) {
        throw new LinearError(`MCP: Failed to fetch issue ${issueId}`, { cause: error });
      }
    },
  };
}
