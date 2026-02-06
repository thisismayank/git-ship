import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

export interface GlobalConfig {
  ai: {
    provider: 'openai' | 'anthropic' | 'gemini';
    model: string;
  };
  linear: {
    transport: 'graphql' | 'mcp';
    mcpEndpoint: string;
  };
  branch: {
    teamPrefixes: string[];
  };
  review: {
    enabled: boolean;
    tool: 'coderabbit' | 'devin' | 'codex' | 'graphite';
    transport: 'mcp' | 'cli';
    endpoints: {
      devin: string;
      coderabbit: string;
      codex: string;
    };
  };
  commits: {
    maxMessageLength: number;
  };
}

const CONFIG_DIR = join(homedir(), '.config', 'gitship');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function getGlobalConfigPath(): string {
  return CONFIG_FILE;
}

export async function hasGlobalConfig(): Promise<boolean> {
  try {
    await readFile(CONFIG_FILE, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function loadGlobalConfig(): Promise<Partial<GlobalConfig> | null> {
  try {
    const raw = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as Partial<GlobalConfig>;
  } catch {
    return null;
  }
}

export async function writeGlobalConfig(config: Partial<GlobalConfig>): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });

  let existing: Partial<GlobalConfig> = {};
  try {
    const raw = await readFile(CONFIG_FILE, 'utf-8');
    existing = JSON.parse(raw) as Partial<GlobalConfig>;
  } catch {
    // File doesn't exist yet
  }

  const merged = deepMergeGlobal(existing, config);
  await writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
}

function deepMergeGlobal<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
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
      result[key] = deepMergeGlobal(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      ) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }
  return result;
}

export type ShellType = 'zsh' | 'bash' | 'fish' | 'unknown';

export function getShellType(): ShellType {
  const shell = process.env.SHELL ?? '';
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('bash')) return 'bash';
  if (shell.includes('fish')) return 'fish';
  return 'unknown';
}

export function getShellProfilePath(): string | null {
  const home = homedir();
  const shell = getShellType();

  switch (shell) {
    case 'zsh':
      return join(home, '.zshrc');
    case 'bash':
      // Prefer .bashrc, but use .bash_profile if on macOS
      return process.platform === 'darwin'
        ? join(home, '.bash_profile')
        : join(home, '.bashrc');
    case 'fish':
      return join(home, '.config', 'fish', 'config.fish');
    default:
      return null;
  }
}

export async function addApiKeyToShellProfile(
  keyName: string,
  keyValue: string,
): Promise<{ success: boolean; profilePath: string | null; shell: ShellType }> {
  const shell = getShellType();
  const profilePath = getShellProfilePath();

  if (!profilePath) {
    return { success: false, profilePath: null, shell };
  }

  let content = '';
  try {
    content = await readFile(profilePath, 'utf-8');
  } catch {
    // File doesn't exist, we'll create it
  }

  // Check if the key is already set
  const exportPattern = new RegExp(`^export ${keyName}=`, 'm');
  if (exportPattern.test(content)) {
    // Key already exists, update it
    const updatedContent = content.replace(
      new RegExp(`^export ${keyName}=.*$`, 'm'),
      getExportLine(shell, keyName, keyValue),
    );
    await writeFile(profilePath, updatedContent, 'utf-8');
  } else {
    // Add new export
    const exportLine = getExportLine(shell, keyName, keyValue);
    const newContent = content.endsWith('\n')
      ? content + exportLine + '\n'
      : content + '\n' + exportLine + '\n';
    await writeFile(profilePath, newContent, 'utf-8');
  }

  return { success: true, profilePath, shell };
}

function getExportLine(shell: ShellType, keyName: string, keyValue: string): string {
  if (shell === 'fish') {
    return `set -gx ${keyName} "${keyValue}"`;
  }
  return `export ${keyName}="${keyValue}"`;
}

export function getSourceCommand(shell: ShellType, profilePath: string): string {
  if (shell === 'fish') {
    return `source ${profilePath}`;
  }
  return `source ${profilePath}`;
}
