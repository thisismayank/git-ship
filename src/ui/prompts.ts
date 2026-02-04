import { select, input, confirm } from '@inquirer/prompts';
import type { CommitGroup } from '../analysis/grouper.js';

export async function promptIssueId(branchName: string): Promise<string | null> {
  const useManual = await confirm({
    message: `Could not detect issue ID from branch "${branchName}". Enter manually?`,
    default: true,
  });

  if (!useManual) return null;

  return input({
    message: 'Enter the Linear issue ID (e.g., ENG-123):',
    validate: (val) => (val.trim().length > 0 ? true : 'Issue ID cannot be empty'),
  });
}

export type CommitPlanAction = 'accept' | 'edit' | 'regroup' | 'cancel';

export async function promptCommitPlanAction(): Promise<CommitPlanAction> {
  return select<CommitPlanAction>({
    message: 'What would you like to do with this commit plan?',
    choices: [
      { name: 'Accept and commit', value: 'accept' },
      { name: 'Edit commit messages', value: 'edit' },
      { name: 'Regroup files', value: 'regroup' },
      { name: 'Cancel', value: 'cancel' },
    ],
  });
}

export async function promptEditCommitMessage(group: CommitGroup): Promise<string> {
  return input({
    message: `Edit message for "${group.type}(${group.scope})":`,
    default: group.summary,
  });
}

export type ReviewAction = 'push' | 'fix' | 'cancel';

export async function promptReviewAction(hasCritical: boolean): Promise<ReviewAction> {
  const choices: Array<{ name: string; value: ReviewAction }> = [];

  if (!hasCritical) {
    choices.push({ name: 'Push anyway', value: 'push' });
  }
  choices.push({ name: 'Fix issues first', value: 'fix' });
  choices.push({ name: 'Cancel', value: 'cancel' });

  return select<ReviewAction>({
    message: hasCritical
      ? 'Critical issues found. How would you like to proceed?'
      : 'Review found warnings. How would you like to proceed?',
    choices,
  });
}

export async function promptConfirmPush(branchName: string): Promise<boolean> {
  return confirm({
    message: `Push "${branchName}" to remote?`,
    default: true,
  });
}

export async function promptSelectReviewTool(): Promise<string> {
  return select({
    message: 'Select a code review tool:',
    choices: [
      { name: 'CodeRabbit', value: 'coderabbit' },
      { name: 'Devin', value: 'devin' },
      { name: 'Codex', value: 'codex' },
      { name: 'Graphite Diamond', value: 'graphite' },
      { name: 'Skip review', value: 'skip' },
    ],
  });
}
