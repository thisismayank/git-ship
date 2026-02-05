import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GitShipConfig } from '../config/schema.js';
import type { FileDiff } from '../git/diff.js';
import type { LinearIssue } from '../linear/types.js';
import { truncateDiff } from '../git/diff.js';
import { AIError } from '../utils/errors.js';

export interface AIGroupResult {
  files: string[];
  type: string;
  scope: string;
  summary: string;
  rationale: string;
}

function buildPrompt(
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: LinearIssue | null,
  maxMessageLength: number = 72,
): string {
  const fileList = diffs
    .map((d) => `- ${d.path} (${d.status}, +${d.additions}/-${d.deletions})`)
    .join('\n');

  const diffDetails = diffs
    .map((d) => `=== ${d.path} ===\n${truncateDiff(d, 1500)}`)
    .join('\n\n');

  const heuristicInfo = heuristicGroups
    .map((g) => `${g.category}: ${g.files.join(', ')}`)
    .join('\n');

  const issueContext = issue
    ? `\nLinear Issue: ${issue.identifier} - ${issue.title}\nDescription: ${issue.description ?? 'N/A'}\nLabels: ${issue.labels.join(', ')}\n`
    : '';

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

## Special Cases
- **Tests & specs**: Group with the feature they test — reviewers benefit from seeing implementation and tests together. Only separate tests into their own commit when they cover existing (unchanged) code.
- **Documentation / README**: Always a separate commit.
- **Lockfiles** (package-lock.json, yarn.lock, pnpm-lock.yaml): Group with the package.json change that caused them.
- **Migrations**: Group with the model/schema change they correspond to.

## Changed Files
${fileList}

## Heuristic Pre-Groups (use as a starting hint, override freely)
${heuristicInfo}

## Diffs
${diffDetails}

## Commit Message Rules
- Use imperative mood (e.g. "add", "fix", "update" — NOT "added", "adding", "fixes")
- Keep the summary under ${maxMessageLength} characters
- Start the summary with a lowercase letter
- Do NOT end the summary with a period
- Follow conventional commits format: type(scope): summary
- Use conventional commit types: feat, fix, chore, docs, style, refactor, test, ci, build, perf

## Output Format

Every file must appear in exactly one group. Respond with ONLY a JSON array (no markdown fencing, no commentary):
[
  {
    "files": ["path/to/file1", "path/to/file2"],
    "type": "feat",
    "scope": "auth",
    "summary": "add OAuth2 login flow",
    "rationale": "route imports createSession from service; reverting either alone would break the build"
  }
]`;
}

function parseAIResponse(text: string): AIGroupResult[] | null {
  try {
    // Try to extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as unknown[];

    if (!Array.isArray(parsed)) return null;

    return parsed.map((item) => {
      const obj = item as Record<string, unknown>;
      return {
        files: (obj.files as string[]) ?? [],
        type: (obj.type as string) ?? 'chore',
        scope: (obj.scope as string) ?? 'misc',
        summary: (obj.summary as string) ?? 'changes',
        rationale: (obj.rationale as string) ?? '',
      };
    });
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
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content ?? '';
}

async function callAnthropic(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AIError('ANTHROPIC_API_KEY not set');

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
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
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
  });

  const result = await genModel.generateContent(prompt);
  return result.response.text();
}

export async function analyzeWithAI(
  config: GitShipConfig,
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: LinearIssue | null,
): Promise<AIGroupResult[] | null> {
  const prompt = buildPrompt(diffs, heuristicGroups, issue, config.commits.maxMessageLength);

  try {
    let responseText: string;

    if (config.ai.provider === 'anthropic') {
      responseText = await callAnthropic(prompt, config.ai.model);
    } else if (config.ai.provider === 'gemini') {
      responseText = await callGemini(prompt, config.ai.model ?? 'gemini-3-flash-preview');
    } else {
      responseText = await callOpenAI(prompt, config.ai.model);
    }

    return parseAIResponse(responseText);
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError(`AI analysis failed: ${(error as Error).message}`, { cause: error });
  }
}
