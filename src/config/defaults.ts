import type { GitShipConfig } from './schema.js';

export const defaultConfig: GitShipConfig = {
  linear: {
    transport: 'graphql',
    mcpEndpoint: 'https://mcp.linear.app/sse',
  },
  ai: {
    provider: 'openai',
    model: 'gpt-4o',
  },
  review: {
    enabled: true,
    tool: 'coderabbit',
  },
  commits: {
    conventional: true,
    allowedTypes: ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'ci', 'build', 'perf'],
    includeIssueRef: true,
  },
  branch: {
    teamPrefixes: ['ENG', 'DES'],
  },
};
