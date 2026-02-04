import { simpleGit } from 'simple-git';
import { GitError } from '../utils/errors.js';
function mapFileStatus(statusResult) {
    const files = [];
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
export function createGit(cwd) {
    return simpleGit(cwd);
}
export async function getStatus(git) {
    try {
        const status = await git.status();
        const branchSummary = await git.branchLocal();
        return {
            branch: branchSummary.current,
            tracking: status.tracking || null,
            changedFiles: mapFileStatus(status),
            isClean: status.isClean(),
        };
    }
    catch (error) {
        throw new GitError('Failed to get git status', {
            suggestion: 'Make sure you are in a git repository.',
            cause: error,
        });
    }
}
export async function getCurrentBranch(git) {
    try {
        const branch = await git.branchLocal();
        return branch.current;
    }
    catch (error) {
        throw new GitError('Failed to get current branch', { cause: error });
    }
}
//# sourceMappingURL=status.js.map