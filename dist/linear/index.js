import { createGraphQLClient } from './graphql.js';
import { createMCPClient } from './mcp.js';
export function createLinearClient(config) {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey)
        return null;
    if (config.linear.transport === 'mcp') {
        return createMCPClient(config.linear.mcpEndpoint, apiKey);
    }
    return createGraphQLClient(apiKey);
}
//# sourceMappingURL=index.js.map