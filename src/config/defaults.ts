import type { GitShipConfig } from './schema.js';

export const defaultConfig: GitShipConfig = {
  issueTracker: {
    provider: 'none',
  },
  linear: {
    transport: 'graphql',
    mcpEndpoint: 'https://mcp.linear.app/sse',
  },
  jira: {},
  asana: {},
  ai: {
    provider: 'openai',
    model: 'gpt-4o',
  },
  review: {
    enabled: true,
    tool: 'coderabbit',
    transport: 'mcp',
    endpoints: {
      devin: 'https://mcp.devin.ai/sse',
      coderabbit: 'https://mcp.coderabbit.ai/sse',
      codex: 'http://localhost:3000/sse',
    },
  },
  commits: {
    conventional: true,
    allowedTypes: ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'ci', 'build', 'perf'],
    includeIssueRef: true,
    maxMessageLength: 72,
    maxBodyLineLength: 72,
  },
  ignorePatterns: ['node_modules/**', '.env*', 'dist/**', '.DS_Store', '.gitshiprc.json'],
  branch: {
    teamPrefixes: ['ENG', 'DES'],
  },
};
