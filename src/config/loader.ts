import { cosmiconfig } from 'cosmiconfig';
import { configSchema, type GitShipConfig } from './schema.js';
import { defaultConfig } from './defaults.js';

const explorer = cosmiconfig('gitship');

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal !== undefined &&
      typeof sourceVal === 'object' &&
      sourceVal !== null &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }
  return result;
}

function applyEnvOverrides(config: GitShipConfig): GitShipConfig {
  const result = structuredClone(config);

  if (process.env.GITSHIP_LINEAR_TRANSPORT) {
    const t = process.env.GITSHIP_LINEAR_TRANSPORT;
    if (t === 'graphql' || t === 'mcp') result.linear.transport = t;
  }
  if (process.env.GITSHIP_AI_PROVIDER) {
    const p = process.env.GITSHIP_AI_PROVIDER;
    if (p === 'openai' || p === 'anthropic' || p === 'gemini') result.ai.provider = p;
  }
  if (process.env.GITSHIP_AI_MODEL) {
    result.ai.model = process.env.GITSHIP_AI_MODEL;
  }
  if (process.env.GITSHIP_REVIEW_TOOL) {
    const t = process.env.GITSHIP_REVIEW_TOOL;
    if (['coderabbit', 'devin', 'codex', 'graphite'].includes(t)) {
      result.review.tool = t as GitShipConfig['review']['tool'];
    }
  }
  if (process.env.GITSHIP_REVIEW_ENABLED !== undefined) {
    result.review.enabled = process.env.GITSHIP_REVIEW_ENABLED !== 'false';
  }

  return result;
}

export async function loadConfig(cwd?: string): Promise<GitShipConfig> {
  let fileConfig: Partial<GitShipConfig> = {};

  try {
    const result = cwd ? await explorer.search(cwd) : await explorer.search();
    if (result && !result.isEmpty) {
      fileConfig = result.config as Partial<GitShipConfig>;
    }
  } catch {
    // Config file not found or invalid — use defaults
  }

  const merged = deepMerge(defaultConfig as Record<string, unknown>, fileConfig as Record<string, unknown>);
  const validated = configSchema.parse(merged);
  return applyEnvOverrides(validated);
}
