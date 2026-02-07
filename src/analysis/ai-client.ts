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

function buildPrompt(
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: IssueContext | null,
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

  const issueContext = buildIssueContextSection(issue);

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

### Header (summary)
- The header is the first line of the commit message
- Keep the header under ${maxMessageLength} characters (this is a hard limit)
- Use imperative mood (e.g. "add", "fix", "update" — NOT "added", "adding", "fixes")
- Start with a lowercase letter
- Do NOT end with a period
- Follow conventional commits format: type(scope): summary
- Use conventional commit types: feat, fix, chore, docs, style, refactor, test, ci, build, perf

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
- This helps reviewers understand how the code maps to the original request

## Output Format

Every file must appear in exactly one group. Respond with ONLY a JSON array (no markdown fencing, no commentary):
[
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
        body: (obj.body as string) ?? undefined,
        addresses: (obj.addresses as string) ?? undefined,
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

export async function analyzeWithAI(
  config: GitShipConfig,
  diffs: FileDiff[],
  heuristicGroups: Array<{ category: string; files: string[] }>,
  issue: IssueContext | null,
): Promise<AIGroupResult[]> {
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

    // Check if response looks like an error message
    const detectedError = detectAPIError(responseText);
    if (detectedError) {
      throw new AIError(detectedError);
    }

    const parsed = parseAIResponse(responseText);
    if (!parsed || parsed.length === 0) {
      throw new AIError('AI returned an invalid or empty response');
    }

    return parsed;
  } catch (error) {
    if (error instanceof AIError) throw error;

    // Check if the error message contains known API error patterns
    const errorMessage = (error as Error).message;
    const detectedError = detectAPIError(errorMessage);

    throw new AIError(
      detectedError ?? `AI analysis failed: ${errorMessage}`,
      { cause: error }
    );
  }
}
