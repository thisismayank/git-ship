import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";

const CONFIG_DIR = join(homedir(), ".config", "gitship");
const LAST_VERSION_FILE = join(CONFIG_DIR, "last-seen-version");

interface ReleaseHighlight {
  emoji: string;
  title: string;
  description: string;
}

interface ReleaseNotes {
  version: string;
  tagline: string;
  highlights: ReleaseHighlight[];
}

// Release notes for each version - add new versions here
const RELEASE_NOTES: Record<string, ReleaseNotes> = {
  "1.2.1": {
    version: "1.3.1",
    tagline: "Smarter Prompts for Large Changesets",
    highlights: [
      {
        emoji: "🚀",
        title: "Optimized AI Prompt",
        description:
          "Compressed diff summaries replace full hunks — large repos (14+ files) no longer truncate",
      },
      {
        emoji: "💬",
        title: "Better Error Messages",
        description:
          "AI failures now explain what went wrong and suggest a fix specific to the problem",
      },
      {
        emoji: "🔇",
        title: "Lockfile Noise Removed",
        description:
          "package-lock.json, yarn.lock, and pnpm-lock.yaml diffs are no longer sent to the AI",
      },
    ],
  },
  "1.2.0": {
    version: "1.3.0",
    tagline: "Pull Request Creation & Multi-Tracker Support",
    highlights: [
      {
        emoji: "🔗",
        title: "Pull Request Creation",
        description:
          "Auto-create PRs with AI-generated descriptions after push, or use `gs pr` anytime",
      },
      {
        emoji: "🎫",
        title: "Multiple Issue Trackers",
        description:
          "Support for Jira, Asana, Plain Text, and None - not just Linear",
      },
      {
        emoji: "🤖",
        title: "Better AI Failure Handling",
        description: "Clear error messages with Retry/Continue/Cancel options",
      },
      {
        emoji: "⚙️",
        title: "Config Commands",
        description:
          "New `gs config` command to view and update settings easily",
      },
    ],
  },
};

export async function getLastSeenVersion(): Promise<string | null> {
  try {
    const version = await readFile(LAST_VERSION_FILE, "utf-8");
    return version.trim();
  } catch {
    return null;
  }
}

export async function setLastSeenVersion(version: string): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(LAST_VERSION_FILE, version, "utf-8");
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

export function getWhatsNewForVersion(version: string): ReleaseNotes | null {
  return RELEASE_NOTES[version] || null;
}

export function getWhatsNewSinceVersion(
  lastVersion: string | null,
  currentVersion: string,
): ReleaseNotes[] {
  if (!lastVersion) {
    // First time user - show current version notes
    const notes = RELEASE_NOTES[currentVersion];
    return notes ? [notes] : [];
  }

  // Get all versions newer than lastVersion
  const newReleases: ReleaseNotes[] = [];
  for (const [version, notes] of Object.entries(RELEASE_NOTES)) {
    if (
      compareVersions(version, lastVersion) > 0 &&
      compareVersions(version, currentVersion) <= 0
    ) {
      newReleases.push(notes);
    }
  }

  // Sort by version (newest first)
  return newReleases.sort((a, b) => compareVersions(b.version, a.version));
}

export function displayWhatsNew(releases: ReleaseNotes[]): void {
  if (releases.length === 0) return;

  console.log("\n" + chalk.bold.cyan("━━━ What's New ━━━") + "\n");

  for (const release of releases) {
    console.log(
      chalk.bold(`v${release.version}`) + chalk.dim(` - ${release.tagline}`),
    );
    console.log();

    for (const highlight of release.highlights) {
      console.log(`  ${highlight.emoji} ${chalk.bold(highlight.title)}`);
      console.log(`     ${chalk.dim(highlight.description)}`);
    }
    console.log();
  }

  console.log(
    chalk.dim(
      "Full changelog: https://github.com/thisismayank/git-ship/releases",
    ),
  );
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━") + "\n");
}

export function getUpdateTeaser(latestVersion: string): string | null {
  const notes = RELEASE_NOTES[latestVersion];
  if (!notes) return null;

  // Return a brief teaser for the update prompt
  const features = notes.highlights
    .slice(0, 2)
    .map((h) => h.title)
    .join(", ");
  return `New in v${latestVersion}: ${features}`;
}
