import { z } from 'zod';

export const issueTrackerProviders = ['linear', 'jira', 'asana', 'plain', 'none'] as const;
export type IssueTrackerProvider = typeof issueTrackerProviders[number];

export const configSchema = z.object({
  // Issue tracker provider selection
  issueTracker: z.object({
    provider: z.enum(issueTrackerProviders).default('none'),
  }).default({}),

  // Linear-specific settings
  linear: z.object({
    transport: z.enum(['graphql', 'mcp']).default('graphql'),
    mcpEndpoint: z.string().url().default('https://mcp.linear.app/sse'),
  }).default({}),

  // Jira-specific settings (experimental)
  jira: z.object({
    baseUrl: z.string().url().optional(), // e.g., https://yourcompany.atlassian.net
    projectKey: z.string().optional(),     // e.g., ENG, PROJ
  }).default({}),

  // Asana-specific settings (experimental)
  asana: z.object({
    workspaceId: z.string().optional(),
  }).default({}),

  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'gemini']).default('openai'),
    model: z.string().default('gpt-4o'),
  }).default({}),

  review: z.object({
    enabled: z.boolean().default(true),
    tool: z.enum(['coderabbit', 'devin', 'codex', 'graphite']).default('coderabbit'),
    transport: z.enum(['mcp', 'cli']).default('mcp'),
    endpoints: z.object({
      devin: z.string().url().default('https://mcp.devin.ai/sse'),
      coderabbit: z.string().url().default('https://mcp.coderabbit.ai/sse'),
      codex: z.string().url().default('http://localhost:3000/sse'),
    }).default({}),
  }).default({}),

  commits: z.object({
    conventional: z.boolean().default(true),
    allowedTypes: z
      .array(z.string())
      .default(['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'ci', 'build', 'perf']),
    includeIssueRef: z.boolean().default(true),
    maxMessageLength: z.number().min(20).max(200).default(72),
    maxBodyLineLength: z.number().min(20).max(200).default(72),
  }).default({}),

  ignorePatterns: z.array(z.string()).default([
    'node_modules/**',
    '.env*',
    'dist/**',
    '.DS_Store',
  ]),

  branch: z.object({
    teamPrefixes: z.array(z.string()).default(['ENG', 'DES']),
  }).default({}),
});

export type GitShipConfig = z.infer<typeof configSchema>;

// Global config schema - subset for user-level settings
export const globalConfigSchema = z.object({
  issueTracker: z.object({
    provider: z.enum(issueTrackerProviders),
  }).partial(),

  ai: z.object({
    provider: z.enum(['openai', 'anthropic', 'gemini']),
    model: z.string(),
  }).partial(),

  linear: z.object({
    transport: z.enum(['graphql', 'mcp']),
    mcpEndpoint: z.string().url(),
  }).partial(),

  jira: z.object({
    baseUrl: z.string().url(),
    projectKey: z.string(),
  }).partial(),

  asana: z.object({
    workspaceId: z.string(),
  }).partial(),

  branch: z.object({
    teamPrefixes: z.array(z.string()),
  }).partial(),

  review: z.object({
    enabled: z.boolean(),
    tool: z.enum(['coderabbit', 'devin', 'codex', 'graphite']),
    transport: z.enum(['mcp', 'cli']),
    endpoints: z.object({
      devin: z.string().url(),
      coderabbit: z.string().url(),
      codex: z.string().url(),
    }).partial(),
  }).partial(),

  commits: z.object({
    maxMessageLength: z.number().min(20).max(200),
  }).partial(),
}).partial();

export type GlobalConfigInput = z.infer<typeof globalConfigSchema>;
