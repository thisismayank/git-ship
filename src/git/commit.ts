import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SimpleGit } from 'simple-git';
import { GitError } from '../utils/errors.js';

export interface CommitInput {
  files: string[];
  message: string;
}

export interface CommitResult {
  hash: string;
  message: string;
  filesCommitted: string[];
}

export async function stageAndCommit(
  git: SimpleGit,
  input: CommitInput,
): Promise<CommitResult> {
  // Write message to a temp file so git reads it with -F.
  // This avoids newline-handling issues that can occur when
  // simple-git passes multi-line messages via the -m flag.
  const msgFile = join(tmpdir(), `gitship-commit-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);

  try {
    // Reset staging area first to ensure clean state
    await git.reset(['HEAD']).catch(() => {
      // Ignore errors (e.g., if no commits exist yet)
    });

    // Stage specified files
    await git.add(input.files);

    // Write the message to a temp file and commit with -F
    writeFileSync(msgFile, input.message, 'utf-8');
    await git.raw(['commit', '-F', msgFile]);

    // Retrieve the commit hash
    const hash = (await git.raw(['rev-parse', '--short', 'HEAD'])).trim();

    return {
      hash: hash || 'unknown',
      message: input.message,
      filesCommitted: input.files,
    };
  } catch (error) {
    throw new GitError(`Failed to commit: ${(error as Error).message}`, {
      suggestion: 'Check that the files exist and are valid.',
      cause: error,
    });
  } finally {
    try { unlinkSync(msgFile); } catch { /* ignore cleanup errors */ }
  }
}

export async function stageAndCommitMultiple(
  git: SimpleGit,
  commits: CommitInput[],
): Promise<CommitResult[]> {
  const results: CommitResult[] = [];

  for (const commitInput of commits) {
    const result = await stageAndCommit(git, commitInput);
    results.push(result);
  }

  return results;
}
