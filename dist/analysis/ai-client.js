import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { truncateDiff } from '../git/diff.js';
import { AIError } from '../utils/errors.js';
function buildPrompt(diffs, heuristicGroups, issue) {
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
function parseAIResponse(text) {
    try {
        // Try to extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch)
            return null;
        const parsed = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(parsed))
            return null;
        return parsed.map((item) => {
            const obj = item;
            return {
                files: obj.files ?? [],
                type: obj.type ?? 'chore',
                scope: obj.scope ?? 'misc',
                summary: obj.summary ?? 'changes',
                rationale: obj.rationale ?? '',
            };
        });
    }
    catch {
        return null;
    }
}
async function callOpenAI(prompt, model) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
        throw new AIError('OPENAI_API_KEY not set');
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
async function callAnthropic(prompt, model) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
        throw new AIError('ANTHROPIC_API_KEY not set');
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
export async function analyzeWithAI(config, diffs, heuristicGroups, issue) {
    const prompt = buildPrompt(diffs, heuristicGroups, issue);
    try {
        let responseText;
        if (config.ai.provider === 'anthropic') {
            responseText = await callAnthropic(prompt, config.ai.model);
        }
        else {
            responseText = await callOpenAI(prompt, config.ai.model);
        }
        return parseAIResponse(responseText);
    }
    catch (error) {
        if (error instanceof AIError)
            throw error;
        throw new AIError(`AI analysis failed: ${error.message}`, { cause: error });
    }
}
//# sourceMappingURL=ai-client.js.map