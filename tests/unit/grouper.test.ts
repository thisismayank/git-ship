import { describe, it, expect } from 'vitest';
import { heuristicGroup, mergeAIGroups } from '../../src/analysis/grouper.js';

describe('heuristicGroup', () => {
  it('groups test files together', () => {
    const files = ['src/utils/helper.test.ts', 'tests/integration/flow.test.ts'];
    const groups = heuristicGroup(files);
    const testGroup = groups.find((g) => g.category === 'test');
    expect(testGroup).toBeDefined();
    expect(testGroup!.files).toContain('src/utils/helper.test.ts');
    expect(testGroup!.files).toContain('tests/integration/flow.test.ts');
  });

  it('groups docs files together', () => {
    const files = ['docs/README.md', 'CHANGELOG.md'];
    const groups = heuristicGroup(files);
    const docsGroup = groups.find((g) => g.category === 'docs');
    expect(docsGroup).toBeDefined();
    expect(docsGroup!.files).toHaveLength(2);
  });

  it('groups CI/infra files together', () => {
    const files = ['.github/workflows/ci.yml', 'Dockerfile'];
    const groups = heuristicGroup(files);
    const ciGroup = groups.find((g) => g.category === 'ci-infra');
    expect(ciGroup).toBeDefined();
    expect(ciGroup!.files).toHaveLength(2);
  });

  it('groups deps files together', () => {
    const files = ['package.json', 'package-lock.json'];
    const groups = heuristicGroup(files);
    const depsGroup = groups.find((g) => g.category === 'deps');
    expect(depsGroup).toBeDefined();
    expect(depsGroup!.files).toHaveLength(2);
  });

  it('groups migration files', () => {
    const files = ['migrations/001_create_users.js'];
    const groups = heuristicGroup(files);
    const migrationGroup = groups.find((g) => g.category === 'migration');
    expect(migrationGroup).toBeDefined();
  });

  it('groups source files by directory', () => {
    const files = ['src/controllers/auth.ts', 'src/controllers/user.ts', 'src/models/user.ts'];
    const groups = heuristicGroup(files);
    const controllerGroup = groups.find((g) => g.category === 'src:src/controllers');
    const modelGroup = groups.find((g) => g.category === 'src:src/models');
    expect(controllerGroup).toBeDefined();
    expect(controllerGroup!.files).toHaveLength(2);
    expect(modelGroup).toBeDefined();
    expect(modelGroup!.files).toHaveLength(1);
  });

  it('handles mixed file types', () => {
    const files = [
      'src/index.ts',
      'src/index.test.ts',
      'package.json',
      'README.md',
      '.github/workflows/ci.yml',
    ];
    const groups = heuristicGroup(files);
    expect(groups.length).toBeGreaterThanOrEqual(4);
  });
});

describe('mergeAIGroups', () => {
  const heuristic = [
    { category: 'src:src/controllers', files: ['src/controllers/auth.ts'] },
    { category: 'test', files: ['tests/auth.test.ts'] },
  ];
  const allFiles = ['src/controllers/auth.ts', 'tests/auth.test.ts'];

  it('uses AI groups when provided', () => {
    const aiResult = [
      {
        files: ['src/controllers/auth.ts', 'tests/auth.test.ts'],
        type: 'feat',
        scope: 'auth',
        summary: 'add authentication',
        rationale: 'Related auth changes',
      },
    ];
    const groups = mergeAIGroups(heuristic, aiResult, allFiles);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe('feat');
    expect(groups[0].scope).toBe('auth');
  });

  it('creates catch-all group for files missed by AI', () => {
    const aiResult = [
      {
        files: ['src/controllers/auth.ts'],
        type: 'feat',
        scope: 'auth',
        summary: 'add auth endpoint',
        rationale: 'Auth logic',
      },
    ];
    const groups = mergeAIGroups(heuristic, aiResult, allFiles);
    expect(groups).toHaveLength(2);
    const catchAll = groups.find((g) => g.scope === 'misc');
    expect(catchAll).toBeDefined();
    expect(catchAll!.files).toContain('tests/auth.test.ts');
  });

  it('falls back to heuristic groups when AI returns null', () => {
    const groups = mergeAIGroups(heuristic, null, allFiles);
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  it('orders groups correctly (feat before test)', () => {
    const aiResult = [
      { files: ['tests/auth.test.ts'], type: 'test', scope: 'auth', summary: 'add tests', rationale: '' },
      { files: ['src/controllers/auth.ts'], type: 'feat', scope: 'auth', summary: 'add auth', rationale: '' },
    ];
    const groups = mergeAIGroups(heuristic, aiResult, allFiles);
    expect(groups[0].type).toBe('feat');
    expect(groups[1].type).toBe('test');
  });
});
