import type { SimpleGit } from 'simple-git';
import { GitError } from '../utils/errors.js';

export interface PushResult {
  branch: string;
  remote: string;
  success: boolean;
}

export async function pushToRemote(
  git: SimpleGit,
  branch: string,
  options?: { setUpstream?: boolean; remote?: string },
): Promise<PushResult> {
  const remote = options?.remote ?? 'origin';

  try {
    const args = [remote, branch];
    if (options?.setUpstream) {
      args.unshift('-u');
    }

    await git.push(args);

    return { branch, remote, success: true };
  } catch (error) {
    const message = (error as Error).message;

    if (message.includes('rejected') || message.includes('non-fast-forward')) {
      throw new GitError(`Push rejected for branch "${branch}"`, {
        suggestion: 'Try `git pull --rebase` first. If this is the first push and the remote has an initial commit (e.g. README), use `git pull origin <branch> --allow-unrelated-histories` then retry.',
        cause: error,
      });
    }

    if (message.includes('no upstream')) {
      // Retry with set-upstream
      try {
        await git.push(['-u', remote, branch]);
        return { branch, remote, success: true };
      } catch (retryError) {
        throw new GitError(`Failed to push with upstream set`, { cause: retryError });
      }
    }

    throw new GitError(`Failed to push to ${remote}/${branch}`, {
      suggestion: 'Check your remote configuration and network connection.',
      cause: error,
    });
  }
}
