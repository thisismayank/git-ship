import { describe, it, expect } from 'vitest';
import { parseBranch } from '../../src/linear/branch-parser.js';

describe('parseBranch', () => {
  it('parses standard branch with prefix and number', () => {
    const result = parseBranch('feat/ENG-123-add-oauth-login');
    expect(result.issueId).toBe('ENG-123');
    expect(result.prefix).toBe('ENG');
    expect(result.number).toBe(123);
    expect(result.rest).toBe('add oauth login');
  });

  it('parses branch without leading path', () => {
    const result = parseBranch('ENG-456-fix-bug');
    expect(result.issueId).toBe('ENG-456');
    expect(result.prefix).toBe('ENG');
    expect(result.number).toBe(456);
  });

  it('parses branch with username prefix', () => {
    const result = parseBranch('mayank/ENG-789-task');
    expect(result.issueId).toBe('ENG-789');
    expect(result.prefix).toBe('ENG');
    expect(result.number).toBe(789);
  });

  it('parses case-insensitive prefix', () => {
    const result = parseBranch('fix/eng-42');
    expect(result.issueId).toBe('ENG-42');
    expect(result.prefix).toBe('ENG');
    expect(result.number).toBe(42);
  });

  it('parses DES prefix with team prefixes config', () => {
    const result = parseBranch('feature/DES-100-design-update', ['ENG', 'DES']);
    expect(result.issueId).toBe('DES-100');
    expect(result.prefix).toBe('DES');
    expect(result.number).toBe(100);
  });

  it('returns null for branches without issue ID', () => {
    const result = parseBranch('main');
    expect(result.issueId).toBeNull();
    expect(result.prefix).toBeNull();
    expect(result.number).toBeNull();
  });

  it('returns null for branches with no matching pattern', () => {
    const result = parseBranch('feature/add-new-thing');
    expect(result.issueId).toBeNull();
  });

  it('handles branches with just the issue ID', () => {
    const result = parseBranch('ENG-1');
    expect(result.issueId).toBe('ENG-1');
    expect(result.number).toBe(1);
  });

  it('parses branch with nested path', () => {
    const result = parseBranch('fix/elm-1161-ref-trace-improve-facility');
    expect(result.issueId).toBe('ELM-1161');
    expect(result.prefix).toBe('ELM');
    expect(result.number).toBe(1161);
  });
});
