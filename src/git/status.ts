import { simpleGit, type SimpleGit, type StatusResult } from 'simple-git';
import { GitError } from '../utils/errors.js';

export interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  from?: string; // original path for renames
}

export interface GitStatus {
  branch: string;
  tracking: string | null;
  changedFiles: ChangedFile[];
  isClean: boolean;
}

function mapFileStatus(
  statusResult: StatusResult,
): ChangedFile[] {
  const files: ChangedFile[] = [];

  for (const f of statusResult.created) {
    files.push({ path: f, status: 'added' });
  }
  for (const f of statusResult.modified) {
    files.push({ path: f, status: 'modified' });
  }
  for (const f of statusResult.deleted) {
    files.push({ path: f, status: 'deleted' });
  }
  for (const f of statusResult.renamed) {
    files.push({ path: f.to, status: 'renamed', from: f.from });
  }
  // Include files that are not yet tracked
  for (const f of statusResult.not_added) {
    if (!files.some((ef) => ef.path === f)) {
      files.push({ path: f, status: 'added' });
    }
  }

  return files;
}

export function createGit(cwd?: string): SimpleGit {
  return simpleGit(cwd);
}

export async function isGitRepository(git: SimpleGit): Promise<boolean> {
  try {
    await git.revparse(['--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

export async function getStatus(git: SimpleGit): Promise<GitStatus> {
  try {
    const status = await git.status();
    const branchSummary = await git.branchLocal();

    // On repos with no commits, branchLocal().current can be empty.
    // Fall back to symbolic-ref which works even before the first commit.
    let branch = branchSummary.current;
    if (!branch) {
      try {
        const ref = await git.raw(['symbolic-ref', '--short', 'HEAD']);
        branch = ref.trim();
      } catch {
        branch = 'main';
      }
    }

    return {
      branch,
      tracking: status.tracking || null,
      changedFiles: mapFileStatus(status),
      isClean: status.isClean(),
    };
  } catch (error) {
    throw new GitError('Failed to get git status', {
      suggestion: 'Make sure you are in a git repository.',
      cause: error,
    });
  }
}

export async function getCurrentBranch(git: SimpleGit): Promise<string> {
  try {
    const branch = await git.branchLocal();
    return branch.current;
  } catch (error) {
    throw new GitError('Failed to get current branch', { cause: error });
  }
}
