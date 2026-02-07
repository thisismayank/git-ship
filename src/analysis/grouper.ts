import type { FileDiff } from '../git/diff.js';
import type { LinearIssue } from '../linear/types.js';
import type { AIGroupResult } from './ai-client.js';

export interface CommitGroup {
  files: string[];
  type: string;
  scope: string;
  /** Short summary for commit header (subject line) */
  summary: string;
  /** Detailed explanation for commit body */
  body?: string;
  /** Which part of the requirement/issue this commit addresses */
  addresses?: string;
  rationale?: string;
}

interface HeuristicGroup {
  category: string;
  files: string[];
}

const PATH_RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$/, category: 'test' },
  { pattern: /^tests?\//, category: 'test' },
  { pattern: /^__tests__\//, category: 'test' },
  { pattern: /^docs?\//, category: 'docs' },
  { pattern: /\.md$/i, category: 'docs' },
  { pattern: /^\.github\//, category: 'ci-infra' },
  { pattern: /^Dockerfile/, category: 'ci-infra' },
  { pattern: /^docker-compose/, category: 'ci-infra' },
  { pattern: /^\.gitlab-ci/, category: 'ci-infra' },
  { pattern: /^Jenkinsfile/, category: 'ci-infra' },
  { pattern: /package-lock\.json$/, category: 'deps' },
  { pattern: /yarn\.lock$/, category: 'deps' },
  { pattern: /pnpm-lock\.yaml$/, category: 'deps' },
  { pattern: /^package\.json$/, category: 'deps' },
  { pattern: /^migrations?\//, category: 'migration' },
];

function getDirectoryGroup(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length <= 1) return 'root';
  // Use first two levels for grouping, e.g., "src/controllers"
  return parts.slice(0, Math.min(2, parts.length - 1)).join('/');
}

export function heuristicGroup(files: string[]): HeuristicGroup[] {
  const groups = new Map<string, string[]>();

  for (const file of files) {
    let matched = false;
    for (const rule of PATH_RULES) {
      if (rule.pattern.test(file)) {
        const existing = groups.get(rule.category) ?? [];
        existing.push(file);
        groups.set(rule.category, existing);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const dirGroup = getDirectoryGroup(file);
      const key = `src:${dirGroup}`;
      const existing = groups.get(key) ?? [];
      existing.push(file);
      groups.set(key, existing);
    }
  }

  return Array.from(groups.entries()).map(([category, files]) => ({
    category,
    files,
  }));
}

export function mergeAIGroups(
  heuristic: HeuristicGroup[],
  aiResult: AIGroupResult[] | null,
  allFiles: string[],
): CommitGroup[] {
  // If AI returned valid results, use them
  if (aiResult && aiResult.length > 0) {
    const coveredFiles = new Set(aiResult.flatMap((g) => g.files));
    const groups: CommitGroup[] = aiResult.map((g) => ({
      files: g.files,
      type: g.type,
      scope: g.scope,
      summary: g.summary,
      body: g.body,
      addresses: g.addresses,
      rationale: g.rationale,
    }));

    // Add catch-all for any files AI missed
    const missed = allFiles.filter((f) => !coveredFiles.has(f));
    if (missed.length > 0) {
      groups.push({
        files: missed,
        type: 'chore',
        scope: 'misc',
        summary: 'miscellaneous changes',
        rationale: 'Files not covered by AI grouping',
      });
    }

    return orderGroups(groups);
  }

  // Fallback: convert heuristic groups to commit groups
  return orderGroups(
    heuristic.map((g) => ({
      files: g.files,
      type: categoryToType(g.category),
      scope: categoryToScope(g.category),
      summary: `${categoryToType(g.category)} changes in ${categoryToScope(g.category)}`,
    })),
  );
}

function categoryToType(category: string): string {
  if (category === 'test') return 'test';
  if (category === 'docs') return 'docs';
  if (category === 'ci-infra') return 'ci';
  if (category === 'deps') return 'build';
  if (category === 'migration') return 'feat';
  return 'feat';
}

function categoryToScope(category: string): string {
  if (category.startsWith('src:')) return category.slice(4);
  return category;
}

const TYPE_ORDER: Record<string, number> = {
  migration: 0,
  feat: 1,
  fix: 2,
  refactor: 3,
  perf: 4,
  style: 5,
  test: 6,
  docs: 7,
  build: 8,
  ci: 9,
  chore: 10,
};

function orderGroups(groups: CommitGroup[]): CommitGroup[] {
  return [...groups].sort(
    (a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99),
  );
}
