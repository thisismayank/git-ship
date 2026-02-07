import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PRAdapter, PRContext, PRResult } from './types.js';

export class GitHubAdapter implements PRAdapter {
  readonly name = 'GitHub';

  async isAvailable(): Promise<boolean> {
    try {
      // Check if gh CLI is installed and authenticated
      execSync('gh auth status', { stdio: 'pipe' });
      // Check if we're in a GitHub repo
      const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      return remote.includes('github.com');
    } catch {
      return false;
    }
  }

  async getDefaultBaseBranch(): Promise<string> {
    try {
      // Try to get the default branch from GitHub
      const result = execSync('gh repo view --json defaultBranchRef --jq .defaultBranchRef.name', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      return result || 'main';
    } catch {
      // Fallback to checking local branches
      try {
        execSync('git rev-parse --verify main', { stdio: 'pipe' });
        return 'main';
      } catch {
        try {
          execSync('git rev-parse --verify master', { stdio: 'pipe' });
          return 'master';
        } catch {
          return 'main';
        }
      }
    }
  }

  async getRepoUrl(): Promise<string | null> {
    try {
      const url = execSync('gh repo view --json url --jq .url', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      return url || null;
    } catch {
      return null;
    }
  }

  async createPR(context: PRContext): Promise<PRResult> {
    // Write body to temp file to avoid shell escaping issues
    const bodyFile = join(tmpdir(), `gitship-pr-body-${Date.now()}.md`);

    try {
      writeFileSync(bodyFile, context.body, 'utf-8');

      const args = [
        'pr', 'create',
        '--title', context.title,
        '--body-file', bodyFile,
        '--base', context.baseBranch,
        '--head', context.headBranch,
      ];

      if (context.isDraft) {
        args.push('--draft');
      }

      // Create the PR using spawnSync for proper argument handling
      const result = spawnSync('gh', args, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Clean up temp file
      try {
        unlinkSync(bodyFile);
      } catch {
        // Ignore cleanup errors
      }

      if (result.status !== 0) {
        const errorOutput = result.stderr || result.stdout || 'Unknown error';
        throw new Error(errorOutput);
      }

      // gh pr create outputs the PR URL
      const url = result.stdout.trim();
      const prNumberMatch = url.match(/\/pull\/(\d+)$/);

      return {
        success: true,
        url,
        number: prNumberMatch ? parseInt(prNumberMatch[1], 10) : undefined,
      };
    } catch (error) {
      // Clean up temp file on error
      try {
        unlinkSync(bodyFile);
      } catch {
        // Ignore cleanup errors
      }

      const message = error instanceof Error ? error.message : 'Unknown error';

      // Check for common errors
      if (message.includes('already exists')) {
        return {
          success: false,
          error: 'A pull request already exists for this branch',
        };
      }

      if (message.includes('not authenticated')) {
        return {
          success: false,
          error: 'GitHub CLI not authenticated. Run: gh auth login',
        };
      }

      return {
        success: false,
        error: message,
      };
    }
  }
}

export function createGitHubAdapter(): PRAdapter {
  return new GitHubAdapter();
}
