import { select, input, confirm } from '@inquirer/prompts';
export async function promptIssueId(branchName) {
    const useManual = await confirm({
        message: `Could not detect issue ID from branch "${branchName}". Enter manually?`,
        default: true,
    });
    if (!useManual)
        return null;
    return input({
        message: 'Enter the Linear issue ID (e.g., ENG-123):',
        validate: (val) => (val.trim().length > 0 ? true : 'Issue ID cannot be empty'),
    });
}
export async function promptCommitPlanAction() {
    return select({
        message: 'What would you like to do with this commit plan?',
        choices: [
            { name: 'Accept and commit', value: 'accept' },
            { name: 'Edit commit messages', value: 'edit' },
            { name: 'Regroup files', value: 'regroup' },
            { name: 'Cancel', value: 'cancel' },
        ],
    });
}
export async function promptEditCommitMessage(group) {
    return input({
        message: `Edit message for "${group.type}(${group.scope})":`,
        default: group.summary,
    });
}
export async function promptReviewAction(hasCritical) {
    const choices = [];
    if (!hasCritical) {
        choices.push({ name: 'Push anyway', value: 'push' });
    }
    choices.push({ name: 'Fix issues first', value: 'fix' });
    choices.push({ name: 'Cancel', value: 'cancel' });
    return select({
        message: hasCritical
            ? 'Critical issues found. How would you like to proceed?'
            : 'Review found warnings. How would you like to proceed?',
        choices,
    });
}
export async function promptConfirmPush(branchName) {
    return confirm({
        message: `Push "${branchName}" to remote?`,
        default: true,
    });
}
export async function promptSelectReviewTool() {
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
export async function promptMaxMessageLength() {
    const val = await input({
        message: 'Max commit message length (20-200, default 72):',
        default: '72',
        validate: (val) => {
            const n = parseInt(val.trim(), 10);
            if (isNaN(n) || n < 20 || n > 200)
                return 'Must be a number between 20 and 200';
            return true;
        },
    });
    return parseInt(val.trim(), 10);
}
//# sourceMappingURL=prompts.js.map