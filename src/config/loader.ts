import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cosmiconfig } from 'cosmiconfig';
import { configSchema, type GitShipConfig } from './schema.js';
import { defaultConfig } from './defaults.js';
import { loadGlobalConfig } from './global.js';

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
  if (process.env.GITSHIP_REVIEW_TRANSPORT) {
    const t = process.env.GITSHIP_REVIEW_TRANSPORT;
    if (t === 'mcp' || t === 'cli') result.review.transport = t;
  }
  if (process.env.GITSHIP_DEVIN_ENDPOINT) {
    result.review.endpoints.devin = process.env.GITSHIP_DEVIN_ENDPOINT;
  }
  if (process.env.GITSHIP_CODERABBIT_ENDPOINT) {
    result.review.endpoints.coderabbit = process.env.GITSHIP_CODERABBIT_ENDPOINT;
  }
  if (process.env.GITSHIP_CODEX_ENDPOINT) {
    result.review.endpoints.codex = process.env.GITSHIP_CODEX_ENDPOINT;
  }
  if (process.env.GITSHIP_COMMIT_MAX_LENGTH) {
    const n = parseInt(process.env.GITSHIP_COMMIT_MAX_LENGTH, 10);
    if (!isNaN(n) && n >= 20 && n <= 200) {
      result.commits.maxMessageLength = n;
    }
  }

  return result;
}

export async function loadConfig(cwd?: string): Promise<GitShipConfig> {
  // Precedence: CLI args → env vars → local → global → defaults
  // (CLI args and env vars are applied later in applyEnvOverrides)

  // Load global config
  const globalConfig = await loadGlobalConfig() ?? {};

  // Load local/project config
  let localConfig: Partial<GitShipConfig> = {};
  try {
    const result = cwd ? await explorer.search(cwd) : await explorer.search();
    if (result && !result.isEmpty) {
      localConfig = result.config as Partial<GitShipConfig>;
    }
  } catch {
    // Config file not found or invalid — use defaults
  }

  // Merge: defaults → global → local
  const withGlobal = deepMerge(
    defaultConfig as Record<string, unknown>,
    globalConfig as Record<string, unknown>,
  );
  const merged = deepMerge(
    withGlobal as Record<string, unknown>,
    localConfig as Record<string, unknown>,
  );

  const validated = configSchema.parse(merged);
  return applyEnvOverrides(validated);
}

const CONFIG_FILE = '.gitshiprc.json';

export async function hasProjectConfig(cwd: string = process.cwd()): Promise<boolean> {
  try {
    await readFile(join(cwd, CONFIG_FILE), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function writeProjectConfig(
  partial: Record<string, unknown>,
  cwd: string = process.cwd(),
): Promise<void> {
  const filePath = join(cwd, CONFIG_FILE);
  let existing: Record<string, unknown> = {};

  try {
    const raw = await readFile(filePath, 'utf-8');
    existing = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // File doesn't exist yet — start fresh
  }

  const merged = deepMerge(existing, partial);
  await writeFile(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
}
