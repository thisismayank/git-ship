import { describe, it, expect } from 'vitest';
import { parseBranch } from '../../src/linear/branch-parser.js';
import { heuristicGroup, mergeAIGroups } from '../../src/analysis/grouper.js';
import { formatAllCommitMessages } from '../../src/analysis/commit-message.js';

describe('full flow integration', () => {
  it('parses branch, groups files, and formats commit messages', () => {
    // Step 1: Parse branch
    const branch = parseBranch('feat/ENG-42-add-user-auth', ['ENG']);
    expect(branch.issueId).toBe('ENG-42');

    // Step 2: Group files
    const files = [
      'src/controllers/auth.ts',
      'src/middleware/auth.ts',
      'src/models/user.ts',
      'tests/auth.test.ts',
      'package.json',
      'README.md',
    ];

    const preGroups = heuristicGroup(files);
    expect(preGroups.length).toBeGreaterThan(1);

    // Step 3: Merge (using heuristic fallback since no AI)
    const groups = mergeAIGroups(preGroups, null, files);
    expect(groups.length).toBeGreaterThan(1);

    // Verify all files are covered
    const allGroupedFiles = groups.flatMap((g) => g.files);
    for (const file of files) {
      expect(allGroupedFiles).toContain(file);
    }

    // Step 4: Format commit messages
    const commits = formatAllCommitMessages(groups, {
      conventional: true,
      includeIssueRef: true,
      issueId: branch.issueId,
      allowedTypes: ['feat', 'fix', 'chore', 'docs', 'test', 'build'],
    });

    expect(commits.length).toBe(groups.length);
    for (const commit of commits) {
      expect(commit.message).toBeTruthy();
      expect(commit.files.length).toBeGreaterThan(0);
    }
  });
});
