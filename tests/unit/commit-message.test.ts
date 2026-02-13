import { describe, it, expect } from 'vitest';
import { formatCommitMessage } from '../../src/analysis/commit-message.js';
import type { CommitGroup } from '../../src/analysis/grouper.js';

const defaultOptions = {
  conventional: true,
  includeIssueRef: true,
  issueId: 'ENG-123',
  allowedTypes: ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'ci', 'build', 'perf'],
  maxHeaderLength: 72,
  maxBodyLineLength: 72,
};

function makeGroup(overrides: Partial<CommitGroup> = {}): CommitGroup {
  return {
    files: ['src/index.ts'],
    type: 'feat',
    scope: 'auth',
    summary: 'Add OAuth2 login flow',
    ...overrides,
  };
}

describe('formatCommitMessage', () => {
  it('formats conventional commit with scope and issue ref', () => {
    const msg = formatCommitMessage(makeGroup(), defaultOptions);
    expect(msg).toBe('feat(auth): add OAuth2 login flow\n\nRefs: ENG-123');
  });

  it('lowercases first letter of summary', () => {
    const msg = formatCommitMessage(makeGroup({ summary: 'Fix the bug' }), defaultOptions);
    expect(msg).toContain('fix the bug');
  });

  it('removes trailing period from summary', () => {
    const msg = formatCommitMessage(makeGroup({ summary: 'Fix the bug.' }), defaultOptions);
    expect(msg).toContain('fix the bug');
    expect(msg).not.toContain('.');
  });

  it('truncates long summaries', () => {
    const longSummary = 'a'.repeat(100);
    const msg = formatCommitMessage(makeGroup({ summary: longSummary }), defaultOptions);
    expect(msg.split('\n')[0].length).toBeLessThanOrEqual(100);
  });

  it('omits issue ref when includeIssueRef is false', () => {
    const msg = formatCommitMessage(makeGroup(), { ...defaultOptions, includeIssueRef: false });
    expect(msg).toBe('feat(auth): add OAuth2 login flow');
  });

  it('omits issue ref when issueId is null', () => {
    const msg = formatCommitMessage(makeGroup(), { ...defaultOptions, issueId: null });
    expect(msg).toBe('feat(auth): add OAuth2 login flow');
  });

  it('falls back to chore for unknown types', () => {
    const msg = formatCommitMessage(makeGroup({ type: 'unknown' }), defaultOptions);
    expect(msg).toMatch(/^chore/);
  });

  it('formats non-conventional commit', () => {
    const msg = formatCommitMessage(makeGroup(), {
      ...defaultOptions,
      conventional: false,
    });
    expect(msg).toBe('Add OAuth2 login flow (ENG-123)');
  });

  it('sanitizes scope with special characters', () => {
    const msg = formatCommitMessage(makeGroup({ scope: 'src/controllers' }), defaultOptions);
    expect(msg).toContain('feat(src-controllers)');
  });

  it('wraps long body lines to maxBodyLineLength', () => {
    const longBody = 'Increase the Node.js heap limit in the Dockerfile to 8192 MB to prevent out-of-memory errors during the Vite production build.';
    const msg = formatCommitMessage(makeGroup({ body: longBody }), defaultOptions);
    const lines = msg.split('\n');
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(72);
    }
  });

  it('wraps long addresses lines', () => {
    const longAddresses = "Addresses 'Option A: Increase Node.js heap limit (Quick fix)' from ELM-1326 which is a very long requirement description";
    const msg = formatCommitMessage(makeGroup({ addresses: longAddresses }), defaultOptions);
    const lines = msg.split('\n');
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(72);
    }
  });
});
