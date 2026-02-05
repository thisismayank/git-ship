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

  return `You are a commit grouping assistant. Given the following file changes, group them into logical commits.
${issueContext}
## Changed Files
${fileList}

## Heuristic Pre-Groups
${heuristicInfo}

## Diffs
${diffDetails}

## Instructions
Group these files into logical commits. Each group should represent a single coherent change.
Use conventional commit types: feat, fix, chore, docs, style, refactor, test, ci, build, perf.
Every file must appear in exactly one group.

## Commit Message Rules
- Use imperative mood in the summary (e.g. "add", "fix", "update" — NOT "added", "adding", "fixes")
- Keep the summary under ${maxMessageLength} characters
- Start the summary with a lowercase letter
- Do NOT end the summary with a period
- Follow conventional commits format strictly: type(scope): summary

Respond with ONLY a JSON array (no markdown fencing):
[
  {
    "files": ["path/to/file1", "path/to/file2"],
    "type": "feat",
    "scope": "auth",
    "summary": "add OAuth2 login flow",
    "rationale": "These files together implement the new login feature"
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
        content: 'You are a git commit grouping assistant. Respond only with valid JSON.',
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
    system: 'You are a git commit grouping assistant. Respond only with valid JSON.',
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
    systemInstruction: 'You are a git commit grouping assistant. Respond only with valid JSON.',
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
