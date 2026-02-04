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
  try {
    // Reset staging area first to ensure clean state
    await git.reset(['HEAD']).catch(() => {
      // Ignore errors (e.g., if no commits exist yet)
    });

    // Stage specified files
    await git.add(input.files);

    // Commit
    const result = await git.commit(input.message);

    return {
      hash: result.commit || 'unknown',
      message: input.message,
      filesCommitted: input.files,
    };
  } catch (error) {
    throw new GitError(`Failed to commit: ${(error as Error).message}`, {
      suggestion: 'Check that the files exist and are valid.',
      cause: error,
    });
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
