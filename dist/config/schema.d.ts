import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    linear: z.ZodDefault<z.ZodObject<{
        transport: z.ZodDefault<z.ZodEnum<["graphql", "mcp"]>>;
        mcpEndpoint: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        transport: "graphql" | "mcp";
        mcpEndpoint: string;
    }, {
        transport?: "graphql" | "mcp" | undefined;
        mcpEndpoint?: string | undefined;
    }>>;
    ai: z.ZodDefault<z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["openai", "anthropic", "gemini"]>>;
        model: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "openai" | "anthropic" | "gemini";
        model: string;
    }, {
        provider?: "openai" | "anthropic" | "gemini" | undefined;
        model?: string | undefined;
    }>>;
    review: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        tool: z.ZodDefault<z.ZodEnum<["coderabbit", "devin", "codex", "graphite"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        tool: "coderabbit" | "devin" | "codex" | "graphite";
    }, {
        enabled?: boolean | undefined;
        tool?: "coderabbit" | "devin" | "codex" | "graphite" | undefined;
    }>>;
    commits: z.ZodDefault<z.ZodObject<{
        conventional: z.ZodDefault<z.ZodBoolean>;
        allowedTypes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        includeIssueRef: z.ZodDefault<z.ZodBoolean>;
        maxMessageLength: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        conventional: boolean;
        allowedTypes: string[];
        includeIssueRef: boolean;
        maxMessageLength: number;
    }, {
        conventional?: boolean | undefined;
        allowedTypes?: string[] | undefined;
        includeIssueRef?: boolean | undefined;
        maxMessageLength?: number | undefined;
    }>>;
    ignorePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    branch: z.ZodDefault<z.ZodObject<{
        teamPrefixes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        teamPrefixes: string[];
    }, {
        teamPrefixes?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    linear: {
        transport: "graphql" | "mcp";
        mcpEndpoint: string;
    };
    ai: {
        provider: "openai" | "anthropic" | "gemini";
        model: string;
    };
    review: {
        enabled: boolean;
        tool: "coderabbit" | "devin" | "codex" | "graphite";
    };
    commits: {
        conventional: boolean;
        allowedTypes: string[];
        includeIssueRef: boolean;
        maxMessageLength: number;
    };
    ignorePatterns: string[];
    branch: {
        teamPrefixes: string[];
    };
}, {
    linear?: {
        transport?: "graphql" | "mcp" | undefined;
        mcpEndpoint?: string | undefined;
    } | undefined;
    ai?: {
        provider?: "openai" | "anthropic" | "gemini" | undefined;
        model?: string | undefined;
    } | undefined;
    review?: {
        enabled?: boolean | undefined;
        tool?: "coderabbit" | "devin" | "codex" | "graphite" | undefined;
    } | undefined;
    commits?: {
        conventional?: boolean | undefined;
        allowedTypes?: string[] | undefined;
        includeIssueRef?: boolean | undefined;
        maxMessageLength?: number | undefined;
    } | undefined;
    ignorePatterns?: string[] | undefined;
    branch?: {
        teamPrefixes?: string[] | undefined;
    } | undefined;
}>;
export type GitShipConfig = z.infer<typeof configSchema>;
//# sourceMappingURL=schema.d.ts.map