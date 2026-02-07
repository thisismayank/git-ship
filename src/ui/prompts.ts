import { select, input, confirm, editor } from "@inquirer/prompts";
import type { CommitGroup } from "../analysis/grouper.js";

export async function promptIssueId(
  branchName: string
): Promise<string | null> {
  const useManual = await confirm({
    message: `Could not detect issue ID from branch "${branchName}". Enter manually?`,
    default: true,
  });

  if (!useManual) return null;

  return input({
    message: "Enter the Linear issue ID (e.g., ENG-123):",
    validate: (val) =>
      val.trim().length > 0 ? true : "Issue ID cannot be empty",
  });
}

export type IssueIdAction = "use" | "edit" | "skip";

export async function promptConfirmIssueId(
  detectedId: string,
  branchName: string
): Promise<{ action: IssueIdAction; issueId: string | null }> {
  const action = await select<IssueIdAction>({
    message: `Detected issue ID "${detectedId}" from branch. Is this correct?`,
    choices: [
      { name: `Yes, use ${detectedId}`, value: "use" },
      { name: "No, enter different ID", value: "edit" },
      { name: "Skip (no issue ID)", value: "skip" },
    ],
  });

  if (action === "use") {
    return { action, issueId: detectedId };
  }

  if (action === "edit") {
    const issueId = await input({
      message: "Enter the correct Linear issue ID (e.g., ENG-123):",
      validate: (val) =>
        val.trim().length > 0 ? true : "Issue ID cannot be empty",
    });
    return { action, issueId };
  }

  return { action, issueId: null };
}

export type CommitPlanAction = "accept" | "edit" | "regroup" | "cancel";

export async function promptCommitPlanAction(): Promise<CommitPlanAction> {
  return select<CommitPlanAction>({
    message: "What would you like to do with this commit plan?",
    choices: [
      { name: "Accept and commit", value: "accept" },
      { name: "Edit commit messages", value: "edit" },
      { name: "Regroup files", value: "regroup" },
      { name: "Cancel", value: "cancel" },
    ],
  });
}

export async function promptEditCommitMessage(
  group: CommitGroup
): Promise<string> {
  return input({
    message: `Edit message for "${group.type}(${group.scope})":`,
    default: group.summary,
  });
}

export type ReviewAction = "push" | "fix" | "cancel";

export async function promptReviewAction(
  hasCritical: boolean
): Promise<ReviewAction> {
  const choices: Array<{ name: string; value: ReviewAction }> = [];

  if (!hasCritical) {
    choices.push({ name: "Push anyway", value: "push" });
  }
  choices.push({ name: "Fix issues first", value: "fix" });
  choices.push({ name: "Cancel", value: "cancel" });

  return select<ReviewAction>({
    message: hasCritical
      ? "Critical issues found. How would you like to proceed?"
      : "Review found warnings. How would you like to proceed?",
    choices,
  });
}

export async function promptConfirmPush(branchName: string): Promise<boolean> {
  return confirm({
    message: `Push "${branchName}" to remote?`,
    default: true,
  });
}

export type AIFailureAction = "continue" | "retry" | "cancel";

export async function promptAIFailureAction(errorMessage: string): Promise<AIFailureAction> {
  return select<AIFailureAction>({
    message: "How would you like to proceed?",
    choices: [
      { name: "Continue with basic commits (generic messages)", value: "continue" },
      { name: "Retry AI analysis", value: "retry" },
      { name: "Cancel", value: "cancel" },
    ],
  });
}

export async function promptSelectReviewTool(): Promise<string> {
  return select({
    message: "Select a code review tool:",
    choices: [
      { name: "CodeRabbit", value: "coderabbit" },
      { name: "Devin", value: "devin" },
      { name: "Codex", value: "codex" },
      { name: "Graphite Diamond", value: "graphite" },
      { name: "Skip review", value: "skip" },
    ],
  });
}

export async function promptMaxMessageLength(): Promise<number> {
  const val = await input({
    message: "Max commit header length (20-200, default 72):",
    default: "72",
    validate: (val) => {
      const n = parseInt(val.trim(), 10);
      if (isNaN(n) || n < 20 || n > 200)
        return "Must be a number between 20 and 200";
      return true;
    },
  });
  return parseInt(val.trim(), 10);
}

export async function promptPlainTextRequirements(): Promise<string | null> {
  const wantRequirements = await confirm({
    message: "Would you like to provide context/requirements for these changes?",
    default: true,
  });

  if (!wantRequirements) return null;

  console.log("\n  Opening editor for requirements (paste or type, then save and close)...\n");

  const requirements = await editor({
    message: "Enter requirements/context:",
    default: "# Paste or type your requirements here\n# Lines starting with # will be ignored\n\n",
    postfix: ".md",
    validate: (val) => {
      // Filter out comment lines and check if there's actual content
      const content = val
        .split("\n")
        .filter((line) => !line.trim().startsWith("#"))
        .join("\n")
        .trim();
      return content.length > 0 ? true : "Please enter some context (non-comment lines)";
    },
  });

  // Filter out comment lines
  const cleanedRequirements = requirements
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n")
    .trim();

  return cleanedRequirements || null;
}
