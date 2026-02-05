export const defaultConfig = {
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
        maxMessageLength: 72,
    },
    ignorePatterns: ['node_modules/**', '.env*', 'dist/**', '.DS_Store'],
    branch: {
        teamPrefixes: ['ENG', 'DES'],
    },
};
//# sourceMappingURL=defaults.js.map