import type { GitShipConfig } from '../config/schema.js';
import type { LinearClient } from './types.js';
import { createGraphQLClient } from './graphql.js';
import { createMCPClient } from './mcp.js';

export type { LinearClient, LinearIssue } from './types.js';

export function createLinearClient(config: GitShipConfig): LinearClient | null {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return null;

  if (config.linear.transport === 'mcp') {
    return createMCPClient(config.linear.mcpEndpoint, apiKey);
  }

  return createGraphQLClient(apiKey);
}
