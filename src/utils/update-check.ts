import chalk from 'chalk';
import boxen from 'boxen';

const FETCH_TIMEOUT_MS = 2000;
const REGISTRY_URL = 'https://registry.npmjs.org/git-ship/latest';

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

async function fetchLatestVersion(currentVersion: string): Promise<string | null> {
  try {
    const response = await fetch(REGISTRY_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { version?: string };
    const latestVersion = data.version;
    if (!latestVersion) return null;

    return isNewer(latestVersion, currentVersion) ? latestVersion : null;
  } catch {
    return null;
  }
}

export interface UpdateChecker {
  /** Wait up to `ms` for the result, returns null if not ready */
  wait(ms: number): Promise<string | null>;
  /** Get current result without waiting (null if not resolved or no update) */
  getResult(): string | null;
  /** Check if the fetch has completed */
  isResolved(): boolean;
}

/**
 * Creates a non-blocking update checker.
 * Starts fetching immediately, provides methods to check result later.
 */
export function createUpdateChecker(currentVersion: string): UpdateChecker {
  let result: string | null = null;
  let resolved = false;

  // Start fetch immediately
  const promise = fetchLatestVersion(currentVersion)
    .then((r) => {
      result = r;
      resolved = true;
      return r;
    })
    .catch(() => {
      resolved = true;
      return null;
    });

  return {
    async wait(ms: number): Promise<string | null> {
      if (resolved) return result;

      await Promise.race([
        promise,
        new Promise((r) => setTimeout(r, ms)),
      ]);

      return result;
    },

    getResult(): string | null {
      return result;
    },

    isResolved(): boolean {
      return resolved;
    },
  };
}

// Keep for backwards compatibility
export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  return fetchLatestVersion(currentVersion);
}

export function displayUpdateBanner(current: string, latest: string): void {
  const message = `Update available! ${chalk.dim(current)} → ${chalk.green(latest)}`;

  console.log(
    boxen(message, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderColor: 'yellow',
      borderStyle: 'round',
      textAlignment: 'center',
    }),
  );
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
