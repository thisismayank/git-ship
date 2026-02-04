import type { SimpleGit } from 'simple-git';
import { GitError } from '../utils/errors.js';

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

export async function getFileDiffs(git: SimpleGit, files: string[]): Promise<FileDiff[]> {
  try {
    const diffs: FileDiff[] = [];

    // Get diff for tracked files (staged + unstaged)
    const diffSummary = await git.diffSummary(['HEAD']);

    for (const file of files) {
      const summaryEntry = diffSummary.files.find(
        (f) => f.file === file || (f as { file: string }).file === file,
      );

      let diffText = '';
      try {
        // Try HEAD diff first (covers staged + unstaged against last commit)
        diffText = await git.diff(['HEAD', '--', file]);
      } catch {
        try {
          // For new untracked files, use diff with /dev/null
          diffText = await git.diff(['--no-index', '/dev/null', file]);
        } catch {
          // diff --no-index returns exit code 1 when files differ, but still outputs diff
          // simple-git treats non-zero exit as error, so we catch and try raw
        }
      }

      const binary = diffText.includes('Binary files');
      const hunks = binary ? [] : parseHunks(diffText);

      diffs.push({
        path: file,
        status: summaryEntry ? (summaryEntry.binary ? 'binary' : 'modified') : 'added',
        additions: summaryEntry && !summaryEntry.binary ? summaryEntry.insertions : 0,
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
