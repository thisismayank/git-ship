import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { SimpleGit } from 'simple-git';
import { GitError } from '../utils/errors.js';

const execFileAsync = promisify(execFile);

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
}

export interface FileDiff {
  path: string;
  status: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
  binary: boolean;
}

function parseHunks(diffText: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  const hunkHeaderRegex = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/;
  const lines = diffText.split('\n');

  let currentHunk: DiffHunk | null = null;
  const hunkLines: string[] = [];

  for (const line of lines) {
    const match = hunkHeaderRegex.exec(line);
    if (match) {
      if (currentHunk) {
        currentHunk.content = hunkLines.join('\n');
        hunks.push(currentHunk);
        hunkLines.length = 0;
      }
      currentHunk = {
        oldStart: parseInt(match[1], 10),
        oldLines: parseInt(match[2] ?? '1', 10),
        newStart: parseInt(match[3], 10),
        newLines: parseInt(match[4] ?? '1', 10),
        content: '',
      };
      hunkLines.push(line);
    } else if (currentHunk) {
      hunkLines.push(line);
    }
  }

  if (currentHunk) {
    currentHunk.content = hunkLines.join('\n');
    hunks.push(currentHunk);
  }

  return hunks;
}

/**
 * Run `git diff --no-index /dev/null <file>` and capture stdout even when
 * exit code is 1 (which means "files differ" — expected for new files).
 */
async function diffNoIndex(file: string, cwd?: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      'git', ['diff', '--no-index', '--', '/dev/null', file],
      { cwd, maxBuffer: 10 * 1024 * 1024 },
    );
    return stdout;
  } catch (err: unknown) {
    // exit code 1 = files differ, stdout still contains the diff
    const e = err as { code?: number; stdout?: string };
    if (e.code === 1 && e.stdout) return e.stdout;
    return '';
  }
}

/**
 * Build a synthetic diff from file contents when git diff isn't available.
 */
async function syntheticDiff(file: string, cwd?: string): Promise<{ text: string; lines: number }> {
  try {
    const filePath = cwd ? `${cwd}/${file}` : file;
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const body = lines.map((l) => `+${l}`).join('\n');
    const text = `@@ -0,0 +1,${lines.length} @@\n${body}`;
    return { text, lines: lines.length };
  } catch {
    return { text: '', lines: 0 };
  }
}

export async function getFileDiffs(git: SimpleGit, files: string[]): Promise<FileDiff[]> {
  try {
    const diffs: FileDiff[] = [];

    // Check if HEAD exists (no commits yet = first commit scenario)
    let hasHead = true;
    try {
      await git.revparse(['HEAD']);
    } catch {
      hasHead = false;
    }

    // Get diff for tracked files (staged + unstaged)
    // Use empty tree hash when HEAD doesn't exist (first commit)
    const emptyTree = '4b825dc642cb6eb9a060e54bf899d69f82067100';
    const diffRef = hasHead ? 'HEAD' : emptyTree;
    let diffSummary;
    try {
      diffSummary = await git.diffSummary([diffRef]);
    } catch {
      diffSummary = { files: [] };
    }

    for (const file of files) {
      const summaryEntry = diffSummary.files.find(
        (f) => f.file === file || (f as { file: string }).file === file,
      );

      let diffText = '';
      try {
        // Try diff against ref (covers staged + unstaged against last commit or empty tree)
        diffText = await git.diff([diffRef, '--', file]);
      } catch {
        // For untracked files (common on first commit), git diff against a
        // ref won't work. Use --no-index via child_process so we can capture
        // stdout even when exit code is 1 (files differ).
        diffText = await diffNoIndex(file);
      }

      // If we still have no diff text, build a synthetic one from file contents
      if (!diffText) {
        const synthetic = await syntheticDiff(file);
        diffText = synthetic.text;
      }

      const binary = diffText.includes('Binary files');
      const hunks = binary ? [] : parseHunks(diffText);
      const additions = hunks.reduce((sum, h) =>
        sum + h.content.split('\n').filter((l) => l.startsWith('+')).length, 0);

      diffs.push({
        path: file,
        status: summaryEntry ? (summaryEntry.binary ? 'binary' : 'modified') : 'added',
        additions: summaryEntry && !summaryEntry.binary ? summaryEntry.insertions : additions,
        deletions: summaryEntry && !summaryEntry.binary ? summaryEntry.deletions : 0,
        hunks,
        binary,
      });
    }

    return diffs;
  } catch (error) {
    throw new GitError('Failed to get file diffs', { cause: error });
  }
}

export function truncateDiff(diff: FileDiff, maxChars: number = 2000): string {
  const full = diff.hunks.map((h) => h.content).join('\n');
  if (full.length <= maxChars) return full;
  return full.slice(0, maxChars) + '\n... (truncated)';
}
