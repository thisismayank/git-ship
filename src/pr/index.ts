import { execSync } from "node:child_process";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PRAdapter, PRContext, PRResult } from "./types.js";
import type { IssueContext } from "../issue-tracker/types.js";
import type { CommitGroup } from "../analysis/grouper.js";
import type { GitShipConfig } from "../config/schema.js";
import { GitHubAdapter } from "./github.js";

export type { PRAdapter, PRContext, PRResult } from "./types.js";

export function createPRAdapter(): PRAdapter | null {
  // For now, only GitHub is supported
  // Future: detect GitLab, Bitbucket, etc.
  return new GitHubAdapter();
}

export async function isPRSupported(): Promise<boolean> {
  const adapter = createPRAdapter();
  if (!adapter) return false;
  return adapter.isAvailable();
}

export interface PRBodyOptions {
  issue: IssueContext | null;
  commits: CommitGroup[];
  branchName: string;
}

export function generatePRTitle(
  issue: IssueContext | null,
  commits: CommitGroup[],
): string {
  // If we have an issue with a title, use it
  if (issue && issue.title && issue.source !== "plain") {
    return issue.title;
  }

  // If single commit, use its summary
  if (commits.length === 1) {
    const c = commits[0];
    return `${c.type}(${c.scope}): ${c.summary}`;
  }

  // Multiple commits - create a summary
  const types = [...new Set(commits.map((c) => c.type))];
  const scopes = [...new Set(commits.map((c) => c.scope))];

  if (types.length === 1 && scopes.length === 1) {
    return `${types[0]}(${scopes[0]}): multiple changes`;
  }

  // Generic title based on primary type
  const primaryType = types.includes("feat") ? "feat" : types[0];
  return `${primaryType}: ${commits.length} changes`;
}

export function generatePRBody(options: PRBodyOptions): string {
  const { issue, commits } = options;
  const sections: string[] = [];

  // Summary section
  sections.push("## Summary\n");

  if (issue && issue.source !== "none") {
    if (issue.source === "plain") {
      // Plain text requirements
      sections.push(issue.description || "No description provided.");
    } else {
      // External issue tracker
      const issueLink = issue.url
        ? `[${issue.identifier}](${issue.url})`
        : issue.identifier;
      sections.push(`This PR addresses ${issueLink}: **${issue.title}**`);

      if (issue.description) {
        const truncated =
          issue.description.length > 500
            ? issue.description.slice(0, 500) + "..."
            : issue.description;
        sections.push(`\n> ${truncated.replace(/\n/g, "\n> ")}`);
      }
    }
  } else {
    // No issue context - summarize from commits
    const summaries = commits.map((c) => `- ${c.summary}`);
    sections.push(summaries.join("\n"));
  }

  // Changes section
  sections.push("\n## Changes\n");

  for (const commit of commits) {
    sections.push(`### ${commit.type}(${commit.scope}): ${commit.summary}\n`);

    if (commit.body) {
      sections.push(commit.body);
    }

    if (commit.addresses) {
      sections.push(`\n**Addresses:** ${commit.addresses}`);
    }

    // List files changed
    if (commit.files.length <= 5) {
      sections.push(
        `\n<details><summary>Files changed (${commit.files.length})</summary>\n`,
      );
      sections.push(commit.files.map((f) => `- \`${f}\``).join("\n"));
      sections.push("\n</details>\n");
    } else {
      sections.push(`\n*${commit.files.length} files changed*\n`);
    }
  }

  // Test plan section
  sections.push("## Test Plan\n");
  sections.push("- [ ] Tested locally");
  sections.push("- [ ] Added/updated tests");
  sections.push("- [ ] Reviewed for edge cases");

  // Footer
  sections.push("\n---");
  sections.push(
    "*Generated with [git-ship](https://github.com/thisismayank/git-ship)*",
  );

  return sections.join("\n");
}

export async function getRecentCommits(
  baseBranch: string,
  headBranch: string,
): Promise<string[]> {
  try {
    const result = execSync(
      `git log ${baseBranch}..${headBranch} --pretty=format:"%s"`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
    );
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

// ─── AI-Powered PR Title & Description ───

const GITHUB_PR_TITLE_MAX_LENGTH = 200;

export interface AIGeneratePROptions {
  issue: IssueContext | null;
  commits: CommitGroup[];
  branchName: string;
  baseBranch: string;
  config: GitShipConfig;
}

// Keep the old name as an alias for backwards compatibility in external usage
export type AIGeneratePRBodyOptions = AIGeneratePROptions;

function buildPRTitlePrompt(options: AIGeneratePROptions): string {
  const { issue, commits } = options;

  let requirementsSection = "";
  if (issue && issue.source === "plain" && issue.description) {
    requirementsSection = `## Requirements/Context Provided by the Developer
${issue.description}`;
  }

  const commitSummaries = commits
    .map((c) => `- ${c.type}(${c.scope}): ${c.summary}`)
    .join("\n");

  return `You are a senior software engineer. Generate a concise pull request title based on the following information.

${requirementsSection}

## Commits
${commitSummaries}

---

Rules:
- The title MUST be ${GITHUB_PR_TITLE_MAX_LENGTH} characters or fewer.
- Use conventional commit style if appropriate (e.g. "feat: ...", "fix: ...", "refactor: ...").
- Focus on the overall purpose/intent of the changes, not individual commits.
- Be specific but concise. Prefer clarity over brevity.
- If requirements are provided, derive the title from them rather than just summarizing commits.

Output ONLY the PR title, nothing else. No quotes, no preamble.`;
}

export async function generatePRTitleWithAI(
  options: AIGeneratePROptions,
): Promise<string> {
  const { config } = options;
  const prompt = buildPRTitlePrompt(options);

  const provider = config.ai.provider;
  const model = config.ai.model;

  let title: string;

  switch (provider) {
    case "openai":
      title = await callOpenAIForPR(prompt, model);
      break;
    case "anthropic":
      title = await callAnthropicForPR(prompt, model);
      break;
    case "gemini":
      title = await callGeminiForPR(prompt, model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  // Clean up: remove quotes, trim, enforce max length
  title = title.trim().replace(/^["']|["']$/g, "");

  if (title.length > GITHUB_PR_TITLE_MAX_LENGTH) {
    title = title.slice(0, GITHUB_PR_TITLE_MAX_LENGTH - 1) + "…";
  }

  return title;
}

function buildPRPrompt(options: AIGeneratePROptions): string {
  const { issue, commits, branchName, baseBranch } = options;

  // Build issue context section
  let issueSection = "";
  if (issue && issue.source !== "none") {
    if (issue.source === "plain") {
      issueSection = `## Requirements/Context Provided
${issue.description}`;
    } else {
      issueSection = `## Issue: ${issue.identifier} - ${issue.title}
${issue.description || "No description"}
${issue.labels.length > 0 ? `Labels: ${issue.labels.join(", ")}` : ""}
${issue.url ? `URL: ${issue.url}` : ""}`;
    }
  }

  // Build commits section
  const commitsSection = commits
    .map((c, i) => {
      const filesStr = c.files.length > 0 ? `Files: ${c.files.join(", ")}` : "";
      return `### Commit ${i + 1}: ${c.type}(${c.scope}): ${c.summary}
${c.body || ""}
${c.addresses ? `Addresses: ${c.addresses}` : ""}
${filesStr}`;
    })
    .join("\n\n");

  // Get all files changed
  const allFiles = [...new Set(commits.flatMap((c) => c.files))];

  return `You are a senior software engineer writing a pull request description. Generate a professional, clear, and comprehensive PR description based on the following information.

## Branch Information
- Source branch: ${branchName}
- Target branch: ${baseBranch}

${issueSection}

## Commits in this PR
${commitsSection}

## All Files Changed (${allFiles.length} files)
${allFiles.map((f) => `- ${f}`).join("\n")}

---

Generate a PR description with the following sections. Be concise but thorough. Use markdown formatting.

**Required sections:**

## Summary
A brief 2-3 sentence overview of what this PR does and why.

## Problem
What problem, issue, or requirement does this PR address? Why was this change needed?

## Solution
How does this PR solve the problem? Describe the approach taken at a high level.

## Changes Made
A bullet list of the key changes, organized logically (not just a dump of commits). Group related changes together.

## Impact
What parts of the system are affected? Any breaking changes? Performance implications?

## Testing
How was this tested? What should reviewers verify?

## Additional Context
Any other information reviewers should know (optional - only include if relevant).

---

Output ONLY the PR description in markdown format. Do not include any preamble or explanation.`;
}

async function callOpenAIForPR(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a senior software engineer who writes clear, professional pull request descriptions.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content ?? "";
}

async function callAnthropicForPR(
  prompt: string,
  model: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    system:
      "You are a senior software engineer who writes clear, professional pull request descriptions.",
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}

async function callGeminiForPR(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });
  const result = await genModel.generateContent(prompt);
  return result.response.text();
}

export async function generatePRBodyWithAI(
  options: AIGeneratePRBodyOptions,
): Promise<string> {
  const { config } = options;
  const prompt = buildPRPrompt(options);

  const provider = config.ai.provider;
  const model = config.ai.model;

  let prBody: string;

  switch (provider) {
    case "openai":
      prBody = await callOpenAIForPR(prompt, model);
      break;
    case "anthropic":
      prBody = await callAnthropicForPR(prompt, model);
      break;
    case "gemini":
      prBody = await callGeminiForPR(prompt, model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  // Add footer
  return (
    prBody.trim() +
    "\n\n---\n*Generated with [git-ship](https://github.com/thisismayank/git-ship)*"
  );
}
