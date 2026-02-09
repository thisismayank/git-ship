import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GitShipConfig } from '../config/schema.js';
import type { FileDiff } from '../git/diff.js';
import type { IssueContext } from '../issue-tracker/types.js';
import { truncateDiff } from '../git/diff.js';
import { AIError } from '../utils/errors.js';

export interface AIGroupResult {
  files: string[];
  type: string;
  scope: string;
  /** Short summary for commit header (subject line) */
  summary: string;
  /** Detailed explanation for commit body (optional) */
  body?: string;
  /** Which part of the requirement/issue this commit addresses (optional) */
  addresses?: string;
  rationale: string;
}

function buildIssueContextSection(issue: IssueContext | null): string {
  if (!issue) return '';

  const sourceLabels: Record<string, string> = {
    linear: 'Linear Issue',
    jira: 'Jira Issue',
    asana: 'Asana Task',
    plain: 'Requirements',
    none: 'Context',
  };

  const label = sourceLabels[issue.source] || 'Issue Context';

  if (issue.source === 'plain') {
    // Plain text requirements - just show the description
    return `
## ${label}
${issue.description ?? 'N/A'}
`;
  }

  // External issue tracker - show full context
  const lines = [
    `## ${label}: ${issue.identifier} - ${issue.title}`,
  ];

  if (issue.description) {
    lines.push(`Description: ${issue.description}`);
  }

  if (issue.labels.length > 0) {
    lines.push(`Labels: ${issue.labels.join(', ')}`);
  }

  return '\n' + lines.join('\n') + '\n';
}

const LOCKFILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);
const CLEAR_CATEGORIES = new Set(['deps', 'docs', 'test', 'ci-infra', 'migration']);

/**
 * Extract a compact summary of what changed in a diff — symbols, imports,
 * exports — so the AI can group files without needing full diff hunks.
 */
function summarizeDiff(diff: FileDiff): string {
  const lines: string[] = [];
  const addedImports: string[] = [];
  const removedImports: string[] = [];
  const addedSymbols: string[] = [];
  const removedSymbols: string[] = [];

  for (const hunk of diff.hunks) {
    for (const line of hunk.content.split('\n')) {
      // Import / require changes
      if (/^\+\s*(import\s|.*require\()/.test(line)) {
        addedImports.push(line.slice(1).trim());
      } else if (/^-\s*(import\s|.*require\()/.test(line)) {
        removedImports.push(line.slice(1).trim());
      }
      // Function / class / export declarations
      else if (/^\+\s*(export\s|function\s|class\s|const\s+\w+\s*=|async\s+function)/.test(line)) {
        const match = line.match(/(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/);
        if (match) addedSymbols.push(match[1]);
      } else if (/^-\s*(export\s|function\s|class\s|const\s+\w+\s*=|async\s+function)/.test(line)) {
        const match = line.match(/(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/);
        if (match) removedSymbols.push(match[1]);
      }
    }
  }

  if (addedImports.length) lines.push(`  +imports: ${addedImports.join('; ')}`);
  if (removedImports.length) lines.push(`  -imports: ${removedImports.join('; ')}`);
  if (addedSymbols.length) lines.push(`  +symbols: ${addedSymbols.join(', ')}`);
  if (removedSymbols.length) lines.push(`  -symbols: ${removedSymbols.join(', ')}`);

  return lines.length ? lines.join('\n') : '  (no notable symbol changes)';
}

/**
 * Build the compressed diff section for the AI prompt.
 * - Lockfiles: filename only (no diff content)
 * - Clearly-categorized files (deps, docs, test, ci-infra, migration): summary only
 * - Source files (ambiguous): summary + short diff excerpt
 *
 * @param excerptChars Max chars for each source-file diff excerpt (0 = summaries only)
 */
function buildDiffSection(
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  excerptChars: number = 500,
): string {
  // Build a map of file → category for quick lookup
  const fileCategory = new Map<string, string>();
  for (const g of heuristicGroups) {
    for (const f of g.files) {
      fileCategory.set(f, g.category);
    }
  }

  const sections: string[] = [];

  for (const d of diffs) {
    const basename = d.path.split('/').pop() ?? d.path;
    const category = fileCategory.get(d.path) ?? '';

    // Lockfiles: filename only, no diff content
    if (LOCKFILES.has(basename)) {
      sections.push(`=== ${d.path} === (lockfile, grouped with manifest)`);
      continue;
    }

    // Clearly-categorized files: summary only
    if (CLEAR_CATEGORIES.has(category)) {
      sections.push(`=== ${d.path} ===\n${summarizeDiff(d)}`);
      continue;
    }

    // Source / ambiguous files: summary + optional diff excerpt
    const summary = summarizeDiff(d);
    if (excerptChars > 0) {
      const excerpt = truncateDiff(d, excerptChars);
      sections.push(`=== ${d.path} ===\n${summary}\n--- diff excerpt ---\n${excerpt}`);
    } else {
      sections.push(`=== ${d.path} ===\n${summary}`);
    }
  }

  return sections.join('\n\n');
}

function buildPrompt(
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: IssueContext | null,
  maxMessageLength: number = 72,
  excerptCharsOverride?: number,
  forceCompact: boolean = false,
): string {
  // Adaptive excerpt sizing: budget ~4000 chars total across all files
  const excerptChars = excerptCharsOverride ?? Math.max(150, Math.floor(4000 / diffs.length));

  const fileList = diffs
    .map((d) => `- ${d.path} (${d.status}, +${d.additions}/-${d.deletions})`)
    .join('\n');

  const diffSection = buildDiffSection(diffs, heuristicGroups, excerptChars);

  const heuristicInfo = heuristicGroups
    .map((g) => `${g.category}: ${g.files.join(', ')}`)
    .join('\n');

  const issueContext = buildIssueContextSection(issue);

  const isLargeChangeset = forceCompact || diffs.length > 8;

  const workedExamples = isLargeChangeset ? '' : `
## Worked Examples

**Example 1 — Coupled feature files → single commit**
\`src/api/routes/payments.ts\` adds a new endpoint that calls \`createCharge()\`.
\`src/services/payments.ts\` exports \`createCharge()\`.
→ Group together. Reverting only the route would leave dead code; reverting only the service would break the route. These are small enough to review as one unit.

**Example 2 — Independent refactor + unrelated feature → separate commits**
\`src/utils/format-date.ts\` refactors date formatting (no new exports consumed by other diffs).
\`src/api/routes/users.ts\` adds a profile endpoint.
→ Separate. Each change compiles and runs without the other, and a reviewer benefits from seeing them independently.

**Example 3 — Feature files + tests**
\`src/routes/orders.ts\`, \`src/controllers/orders.ts\`, \`src/services/orders.ts\` — all tightly coupled for a new "cancel order" feature.
\`src/tests/orders.test.ts\` — tests that exercise the feature.
→ Group feature files together. Include the tests in the same commit — a reviewer understanding the feature benefits from seeing the tests alongside the implementation, and tests alone don't break production if reverted.

**Example 4 — Large feature that can be layered**
\`src/models/subscription.ts\` adds a Subscription model with no external callers yet.
\`src/services/billing.ts\` imports Subscription and adds billing logic.
\`src/routes/billing.ts\` imports the billing service and exposes endpoints.
→ Three commits if each layer compiles alone (model → service → route). A reviewer sees the data model first, then the logic, then the API surface. If the service can't compile without the route (circular dependency), group them.
`;

  const bodyRules = isLargeChangeset ? '' : `
### Body (detailed explanation)
- The body provides context about WHAT changed and WHY
- Include the body for any non-trivial changes
- Explain the motivation, approach, or any important details
- Keep each line under 72 characters for readability
- Use bullet points for multiple changes
- Skip the body only for trivial changes (typo fixes, formatting, etc.)

### Addresses (requirement mapping)
- If issue/requirements context is provided above, specify which part of the requirement this commit addresses
- Be specific: quote or paraphrase the exact requirement being fulfilled
- If the commit partially fulfills a requirement, say so (e.g., "Partially addresses: ...")
- If no requirements context is provided, omit this field
- This helps reviewers understand how the code maps to the original request`;

  const compactInstruction = isLargeChangeset
    ? '\nKeep output compact: omit body, addresses, and rationale fields to stay within token limits.\n'
    : '';

  const outputExample = isLargeChangeset
    ? `[
  {
    "files": ["path/to/file1", "path/to/file2"],
    "type": "feat",
    "scope": "auth",
    "summary": "add OAuth2 login flow"
  }
]`
    : `[
  {
    "files": ["path/to/file1", "path/to/file2"],
    "type": "feat",
    "scope": "auth",
    "summary": "add OAuth2 login flow",
    "body": "Implement Google OAuth2 authentication:\\n- Add OAuth2 callback handler\\n- Store tokens securely in session\\n- Add logout endpoint to revoke tokens",
    "addresses": "Implements 'Users should be able to log in with their Google account' from requirements",
    "rationale": "route imports createSession from service; reverting either alone would break the build"
  }
]`;

  return `You are a commit grouping engine that balances two goals: **small, reviewable commits** and **safe revertability**. Your job is to split staged file changes into the smallest commits a reviewer can understand in isolation, while ensuring no single revert breaks the build or runtime.
${issueContext}
## Two Principles

### 1. The Revert Test (safety floor)
"If this commit were reverted tomorrow, would the remaining codebase still compile, pass lint, and run correctly?" If reverting would leave a dangling import, a missing function call, or a broken reference, the files **must** be in the same commit.

### 2. The Review Test (quality goal)
"Can a reviewer understand this commit without reading other commits in the set?" Prefer smaller, focused commits. When a group passes the Revert Test but covers multiple distinct concerns (e.g. a refactor AND a feature), split it further so each commit tells one clear story.

When these two goals conflict, the Revert Test wins — never produce a commit that would break the build. But whenever files CAN be separated safely, they SHOULD be.

## Decision Rules

**Group together when:**
- File A's diff imports, calls, or references something introduced or changed in file B's diff.
- Removing either file's changes alone would cause a build error, a broken route, or a runtime crash.
- The changes are two sides of the same contract (e.g. an interface definition and its implementation).

**Separate when:**
- A change is a standalone improvement (rename, format, lint fix) that works with or without the other changes.
- Infrastructure / config changes (CI, lockfiles, tsconfig) don't depend on feature code in this diff.
- A generic utility was refactored and also happens to be used by a new feature — if the refactor works on its own, it gets its own commit.
- A large feature can be split into layers (e.g. data layer, then API layer) where earlier layers compile on their own — prefer the split for reviewability.
${workedExamples}
## Special Cases
- **Tests & specs**: Group with the feature they test — reviewers benefit from seeing implementation and tests together. Only separate tests into their own commit when they cover existing (unchanged) code.
- **Documentation / README**: Always a separate commit.
- **Lockfiles** (package-lock.json, yarn.lock, pnpm-lock.yaml): Group with the package.json change that caused them.
- **Migrations**: Group with the model/schema change they correspond to.

## Changed Files
${fileList}

## Heuristic Pre-Groups (use as a starting hint, override freely)
${heuristicInfo}

## Diffs (compressed — summaries of changed symbols & imports; short excerpts for ambiguous files)
${diffSection}

## Commit Message Rules

### Header (summary)
- The header is the first line of the commit message
- Keep the header under ${maxMessageLength} characters (this is a hard limit)
- Use imperative mood (e.g. "add", "fix", "update" — NOT "added", "adding", "fixes")
- Start with a lowercase letter
- Do NOT end with a period
- Follow conventional commits format: type(scope): summary
- Use conventional commit types: feat, fix, chore, docs, style, refactor, test, ci, build, perf
${bodyRules}
## Output Format
${compactInstruction}
Every file must appear in exactly one group. Respond with ONLY a JSON array (no markdown fencing, no commentary):
${outputExample}`;
}

interface ParseResult {
  groups: AIGroupResult[];
  partial: boolean;
}

function mapItem(item: unknown): AIGroupResult {
  const obj = item as Record<string, unknown>;
  return {
    files: (obj.files as string[]) ?? [],
    type: (obj.type as string) ?? 'chore',
    scope: (obj.scope as string) ?? 'misc',
    summary: (obj.summary as string) ?? 'changes',
    body: (obj.body as string) ?? undefined,
    addresses: (obj.addresses as string) ?? undefined,
    rationale: (obj.rationale as string) ?? '',
  };
}

function parseAIResponse(text: string): ParseResult | null {
  try {
    // Try to extract a complete JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as unknown[];
      if (!Array.isArray(parsed)) return null;
      return { groups: parsed.map(mapItem), partial: false };
    }

    // Fallback: response was truncated (no closing `]`).
    // Find the opening bracket, then walk backward to find the last
    // complete JSON object and close the array ourselves.
    const openBracket = text.indexOf('[');
    if (openBracket === -1) return null;

    const fragment = text.slice(openBracket);

    // Walk backward from end to find the last `}` that closes a full object
    for (let i = fragment.length - 1; i >= 0; i--) {
      if (fragment[i] === '}') {
        const candidate = fragment.slice(0, i + 1) + ']';
        try {
          const parsed = JSON.parse(candidate) as unknown[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { groups: parsed.map(mapItem), partial: true };
          }
        } catch {
          // Not valid yet — keep walking backward
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function callOpenAI(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new AIError('OPENAI_API_KEY not set');

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a git commit grouping engine that balances reviewability and revertability. You produce the smallest, most reviewer-friendly commits that are each safe to revert independently. Respond only with valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 16384,
  });

  return response.choices[0]?.message?.content ?? '';
}

async function callAnthropic(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AIError('ANTHROPIC_API_KEY not set');

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 16384,
    messages: [{ role: 'user', content: prompt }],
    system: 'You are a git commit grouping engine that balances reviewability and revertability. You produce the smallest, most reviewer-friendly commits that are each safe to revert independently. Respond only with valid JSON.',
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock && 'text' in textBlock ? textBlock.text : '';
}

async function callGemini(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new AIError('GEMINI_API_KEY (or GOOGLE_API_KEY) not set');

  const client = new GoogleGenerativeAI(apiKey);
  const genModel = client.getGenerativeModel({
    model,
    systemInstruction: 'You are a git commit grouping engine that balances reviewability and revertability. You produce the smallest, most reviewer-friendly commits that are each safe to revert independently. Respond only with valid JSON.',
    generationConfig: { temperature: 0.2, maxOutputTokens: 16384 },
  });

  const result = await genModel.generateContent(prompt);
  return result.response.text();
}

/**
 * Detect common API error patterns from response text or error messages.
 * Returns a user-friendly message if a known error pattern is found.
 */
function detectAPIError(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Quota / billing errors
  if (lowerText.includes('quota') || lowerText.includes('rate limit') || lowerText.includes('rate_limit')) {
    return 'API quota or rate limit exceeded';
  }
  if (lowerText.includes('billing') || lowerText.includes('payment') || lowerText.includes('insufficient_quota')) {
    return 'API billing issue - check your account balance';
  }

  // Auth errors
  if (lowerText.includes('invalid api key') || lowerText.includes('invalid_api_key') || lowerText.includes('unauthorized')) {
    return 'Invalid API key';
  }
  if (lowerText.includes('authentication') || lowerText.includes('api key not found')) {
    return 'API authentication failed';
  }

  // Model errors
  if (lowerText.includes('model not found') || lowerText.includes('does not exist')) {
    return 'AI model not found - check your configuration';
  }

  // Context length
  if (lowerText.includes('context length') || lowerText.includes('too long') || lowerText.includes('max tokens')) {
    return 'Request too large for AI model';
  }

  return null;
}

/**
 * Call the configured AI provider with a prompt.
 */
async function callProvider(config: GitShipConfig, prompt: string): Promise<string> {
  if (config.ai.provider === 'anthropic') {
    return callAnthropic(prompt, config.ai.model);
  } else if (config.ai.provider === 'gemini') {
    return callGemini(prompt, config.ai.model ?? 'gemini-3-flash-preview');
  } else {
    return callOpenAI(prompt, config.ai.model);
  }
}

/**
 * Split files into chunks of ~chunkSize, keeping heuristic group members
 * together so coupled files stay in the same AI call.
 */
function chunkDiffs(
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  chunkSize: number = 10,
): { diffs: FileDiff[]; groups: Array<{ category: string; files: string[] }> }[] {
  const diffMap = new Map(diffs.map((d) => [d.path, d]));
  const assigned = new Set<string>();
  const chunks: { diffs: FileDiff[]; groups: Array<{ category: string; files: string[] }> }[] = [];

  let currentChunkDiffs: FileDiff[] = [];
  let currentChunkGroups: Array<{ category: string; files: string[] }> = [];

  for (const group of heuristicGroups) {
    const groupDiffs = group.files
      .filter((f) => diffMap.has(f))
      .map((f) => diffMap.get(f)!);

    // If adding this group exceeds chunk size and current chunk is non-empty, flush
    if (currentChunkDiffs.length > 0 && currentChunkDiffs.length + groupDiffs.length > chunkSize) {
      chunks.push({ diffs: currentChunkDiffs, groups: currentChunkGroups });
      currentChunkDiffs = [];
      currentChunkGroups = [];
    }

    // If a single group is larger than chunkSize, it becomes its own chunk
    if (groupDiffs.length > chunkSize && currentChunkDiffs.length === 0) {
      chunks.push({ diffs: groupDiffs, groups: [group] });
      for (const d of groupDiffs) assigned.add(d.path);
      continue;
    }

    currentChunkDiffs.push(...groupDiffs);
    currentChunkGroups.push(group);
    for (const d of groupDiffs) assigned.add(d.path);
  }

  // Add any remaining diffs not covered by heuristic groups
  const ungroupedDiffs = diffs.filter((d) => !assigned.has(d.path));
  if (ungroupedDiffs.length > 0) {
    const ungroupedGroup = { category: 'source', files: ungroupedDiffs.map((d) => d.path) };
    currentChunkDiffs.push(...ungroupedDiffs);
    currentChunkGroups.push(ungroupedGroup);
  }

  // Flush remaining
  if (currentChunkDiffs.length > 0) {
    chunks.push({ diffs: currentChunkDiffs, groups: currentChunkGroups });
  }

  return chunks;
}

/**
 * Analyze a large changeset (>20 files) by splitting into chunks,
 * running parallel AI calls, and merging/deduplicating results.
 */
async function analyzeChunked(
  config: GitShipConfig,
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: IssueContext | null,
): Promise<AIGroupResult[]> {
  const chunks = chunkDiffs(diffs, heuristicGroups);

  const chunkResults = await Promise.all(
    chunks.map(async (chunk) => {
      // Each chunk gets its own retry loop via analyzeWithRetry
      return analyzeWithRetry(config, chunk.diffs, chunk.groups, issue);
    }),
  );

  // Merge results and deduplicate files across chunks
  const seenFiles = new Set<string>();
  const merged: AIGroupResult[] = [];

  for (const groups of chunkResults) {
    for (const group of groups) {
      const uniqueFiles = group.files.filter((f) => !seenFiles.has(f));
      if (uniqueFiles.length > 0) {
        merged.push({ ...group, files: uniqueFiles });
        for (const f of uniqueFiles) seenFiles.add(f);
      }
    }
  }

  return merged;
}

/**
 * Core retry logic: up to 3 attempts with progressive compression.
 *
 * | Attempt | Compression                                              |
 * |---------|----------------------------------------------------------|
 * | 1       | Normal prompt (adaptive excerpts)                        |
 * | 2       | Halve excerptChars, force compact (strip examples/body)  |
 * | 3       | Zero excerpts (summaries only), force compact            |
 */
async function analyzeWithRetry(
  config: GitShipConfig,
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: IssueContext | null,
): Promise<AIGroupResult[]> {
  const baseExcerpt = Math.max(150, Math.floor(4000 / diffs.length));

  const attempts: { excerptChars?: number; forceCompact: boolean }[] = [
    { forceCompact: false },                                           // attempt 1: adaptive defaults
    { excerptChars: Math.floor(baseExcerpt / 2), forceCompact: true }, // attempt 2: halved + compact
    { excerptChars: 0, forceCompact: true },                           // attempt 3: summaries only
  ];

  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const { excerptChars, forceCompact } = attempts[i];
    const prompt = buildPrompt(
      diffs,
      heuristicGroups,
      issue,
      config.commits.maxMessageLength,
      excerptChars,
      forceCompact,
    );

    try {
      const responseText = await callProvider(config, prompt);
      const result = parseAIResponse(responseText);

      if (result && result.groups.length > 0) {
        if (result.partial) {
          console.warn(
            '⚠ AI response was truncated — recovered %d group(s). Some files may fall back to heuristic grouping.',
            result.groups.length,
          );
        }
        return result.groups;
      }

      // Response was empty or unparseable — try next compression level
      const detail = responseText.length === 0
        ? 'The AI returned an empty response'
        : 'The AI response was truncated or unparseable';

      if (i < attempts.length - 1) {
        console.warn('⚠ %s (attempt %d/%d) — retrying with more compression…', detail, i + 1, attempts.length);
      }
      lastError = new AIError(detail);
    } catch (error) {
      if (error instanceof AIError) {
        lastError = error;
      } else {
        const errorMessage = (error as Error).message;
        const apiError = detectAPIError(errorMessage);

        // Non-retryable errors (auth, billing, model not found) — throw immediately
        if (apiError && !apiError.includes('too large')) {
          throw new AIError(`${apiError} (${config.ai.provider}/${config.ai.model})`, { cause: error });
        }

        lastError = error;
      }

      if (i < attempts.length - 1) {
        console.warn('⚠ AI call failed (attempt %d/%d) — retrying with more compression…', i + 1, attempts.length);
      }
    }
  }

  // All 3 attempts failed
  if (lastError instanceof AIError) throw lastError;

  const errorMessage = (lastError as Error).message;
  const apiError = detectAPIError(errorMessage);
  const detail = apiError
    ? `${apiError} (${config.ai.provider}/${config.ai.model})`
    : `AI analysis failed after 3 attempts (${config.ai.provider}/${config.ai.model}): ${errorMessage}`;
  throw new AIError(detail, {
    cause: lastError,
    suggestion: 'Stage fewer files and commit in smaller batches, or choose "Continue with basic commits" to skip AI grouping.',
  });
}

export async function analyzeWithAI(
  config: GitShipConfig,
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: IssueContext | null,
): Promise<AIGroupResult[]> {
  // For very large changesets, split into chunks and run in parallel
  if (diffs.length > 20) {
    return analyzeChunked(config, diffs, heuristicGroups, issue);
  }

  return analyzeWithRetry(config, diffs, heuristicGroups, issue);
}
