import { z } from 'zod';
export const configSchema = z.object({
    linear: z.object({
        transport: z.enum(['graphql', 'mcp']).default('graphql'),
        mcpEndpoint: z.string().url().default('https://mcp.linear.app/sse'),
    }).default({}),
    ai: z.object({
        provider: z.enum(['openai', 'anthropic']).default('openai'),
        model: z.string().default('gpt-4o'),
    }).default({}),
    review: z.object({
        enabled: z.boolean().default(true),
        tool: z.enum(['coderabbit', 'devin', 'codex', 'graphite']).default('coderabbit'),
    }).default({}),
    commits: z.object({
        conventional: z.boolean().default(true),
        allowedTypes: z
            .array(z.string())
            .default(['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'ci', 'build', 'perf']),
        includeIssueRef: z.boolean().default(true),
    }).default({}),
    branch: z.object({
        teamPrefixes: z.array(z.string()).default(['ENG', 'DES']),
    }).default({}),
});
//# sourceMappingURL=schema.js.map