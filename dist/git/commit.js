import { GitError } from '../utils/errors.js';
export async function stageAndCommit(git, input) {
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
    }
    catch (error) {
        throw new GitError(`Failed to commit: ${error.message}`, {
            suggestion: 'Check that the files exist and are valid.',
            cause: error,
        });
    }
}
export async function stageAndCommitMultiple(git, commits) {
    const results = [];
    for (const commitInput of commits) {
        const result = await stageAndCommit(git, commitInput);
        results.push(result);
    }
    return results;
}
//# sourceMappingURL=commit.js.map