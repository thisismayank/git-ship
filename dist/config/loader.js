import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cosmiconfig } from 'cosmiconfig';
import { configSchema } from './schema.js';
import { defaultConfig } from './defaults.js';
const explorer = cosmiconfig('gitship');
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (sourceVal !== undefined &&
            typeof sourceVal === 'object' &&
            sourceVal !== null &&
            !Array.isArray(sourceVal) &&
            typeof targetVal === 'object' &&
            targetVal !== null &&
            !Array.isArray(targetVal)) {
            result[key] = deepMerge(targetVal, sourceVal);
        }
        else if (sourceVal !== undefined) {
            result[key] = sourceVal;
        }
    }
    return result;
}
function applyEnvOverrides(config) {
    const result = structuredClone(config);
    if (process.env.GITSHIP_LINEAR_TRANSPORT) {
        const t = process.env.GITSHIP_LINEAR_TRANSPORT;
        if (t === 'graphql' || t === 'mcp')
            result.linear.transport = t;
    }
    if (process.env.GITSHIP_AI_PROVIDER) {
        const p = process.env.GITSHIP_AI_PROVIDER;
        if (p === 'openai' || p === 'anthropic' || p === 'gemini')
            result.ai.provider = p;
    }
    if (process.env.GITSHIP_AI_MODEL) {
        result.ai.model = process.env.GITSHIP_AI_MODEL;
    }
    if (process.env.GITSHIP_REVIEW_TOOL) {
        const t = process.env.GITSHIP_REVIEW_TOOL;
        if (['coderabbit', 'devin', 'codex', 'graphite'].includes(t)) {
            result.review.tool = t;
        }
    }
    if (process.env.GITSHIP_REVIEW_ENABLED !== undefined) {
        result.review.enabled = process.env.GITSHIP_REVIEW_ENABLED !== 'false';
    }
    if (process.env.GITSHIP_COMMIT_MAX_LENGTH) {
        const n = parseInt(process.env.GITSHIP_COMMIT_MAX_LENGTH, 10);
        if (!isNaN(n) && n >= 20 && n <= 200) {
            result.commits.maxMessageLength = n;
        }
    }
    return result;
}
export async function loadConfig(cwd) {
    let fileConfig = {};
    try {
        const result = cwd ? await explorer.search(cwd) : await explorer.search();
        if (result && !result.isEmpty) {
            fileConfig = result.config;
        }
    }
    catch {
        // Config file not found or invalid — use defaults
    }
    const merged = deepMerge(defaultConfig, fileConfig);
    const validated = configSchema.parse(merged);
    return applyEnvOverrides(validated);
}
const CONFIG_FILE = '.gitshiprc.json';
export async function hasProjectConfig(cwd = process.cwd()) {
    try {
        await readFile(join(cwd, CONFIG_FILE), 'utf-8');
        return true;
    }
    catch {
        return false;
    }
}
export async function writeProjectConfig(partial, cwd = process.cwd()) {
    const filePath = join(cwd, CONFIG_FILE);
    let existing = {};
    try {
        const raw = await readFile(filePath, 'utf-8');
        existing = JSON.parse(raw);
    }
    catch {
        // File doesn't exist yet — start fresh
    }
    const merged = deepMerge(existing, partial);
    await writeFile(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
}
//# sourceMappingURL=loader.js.map