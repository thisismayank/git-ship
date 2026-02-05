import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import chalk from 'chalk';
import boxen from 'boxen';

const CACHE_DIR = join(homedir(), '.gitship');
const CACHE_FILE = join(CACHE_DIR, 'update-check.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 3000;
const REGISTRY_URL = 'https://registry.npmjs.org/git-ship/latest';

interface UpdateCache {
  lastCheck: number;
  latestVersion: string;
}

async function readCache(): Promise<UpdateCache | null> {
  try {
    const raw = await readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(raw) as UpdateCache;
  } catch {
    return null;
  }
}

async function writeCache(data: UpdateCache): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(data), 'utf-8');
  } catch {
    // silent
  }
}

function isNewer(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const l = latestParts[i] ?? 0;
    const c = currentParts[i] ?? 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  try {
    const cache = await readCache();

    if (cache && Date.now() - cache.lastCheck < CACHE_TTL_MS) {
      return isNewer(cache.latestVersion, currentVersion) ? cache.latestVersion : null;
    }

    const response = await fetch(REGISTRY_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { version?: string };
    const latestVersion = data.version;
    if (!latestVersion) return null;

    await writeCache({ lastCheck: Date.now(), latestVersion });

    return isNewer(latestVersion, currentVersion) ? latestVersion : null;
  } catch {
    return null;
  }
}

export function displayUpdateNotification(current: string, latest: string): void {
  const message =
    `Update available! ${chalk.dim(current)} → ${chalk.green(latest)}\n` +
    `Run ${chalk.cyan('npm i -g git-ship')} to update`;

  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderColor: 'yellow',
      borderStyle: 'round',
      textAlignment: 'center',
    }),
  );
}
