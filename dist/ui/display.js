import chalk from 'chalk';
import boxen from 'boxen';
export function displayIssueContext(issue) {
    const lines = [
        `${chalk.bold(issue.identifier)}: ${issue.title}`,
        `State: ${chalk.cyan(issue.state)}`,
    ];
    if (issue.labels.length > 0) {
        lines.push(`Labels: ${issue.labels.map((l) => chalk.magenta(l)).join(', ')}`);
    }
    if (issue.description) {
        const truncated = issue.description.length > 200 ? issue.description.slice(0, 200) + '...' : issue.description;
        lines.push('', chalk.dim(truncated));
    }
    console.log(boxen(lines.join('\n'), {
        title: 'Linear Issue',
        padding: 1,
        borderColor: 'blue',
        borderStyle: 'round',
    }));
}
export function displayCommitPlan(groups, issueId) {
    const lines = [];
    for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        const ref = issueId && g.type !== 'chore' ? ` (${issueId})` : '';
        const header = `${chalk.bold.green(`${i + 1}.`)} ${chalk.bold(`${g.type}(${g.scope}): ${g.summary}`)}${chalk.dim(ref)}`;
        const files = g.files.map((f) => `   ${chalk.dim('•')} ${f}`).join('\n');
        const rationale = g.rationale ? `   ${chalk.dim.italic(g.rationale)}` : '';
        lines.push(header, files);
        if (rationale)
            lines.push(rationale);
        lines.push('');
    }
    console.log(boxen(lines.join('\n').trimEnd(), {
        title: `Commit Plan (${groups.length} commit${groups.length === 1 ? '' : 's'})`,
        padding: 1,
        borderColor: 'green',
        borderStyle: 'round',
    }));
}
export function displayReviewResults(result) {
    const statusColor = result.passed ? chalk.green : chalk.red;
    const statusText = result.passed ? 'PASSED' : 'ISSUES FOUND';
    const lines = [
        `Status: ${statusColor.bold(statusText)}`,
        `Summary: ${result.summary}`,
    ];
    if (result.findings.length > 0) {
        lines.push('', chalk.bold('Findings:'));
        for (const f of result.findings) {
            const sevColor = f.severity === 'critical' ? chalk.red : f.severity === 'warning' ? chalk.yellow : chalk.dim;
            const location = f.line ? `${f.file}:${f.line}` : f.file;
            lines.push(`  ${sevColor(`[${f.severity}]`)} ${chalk.dim(location)}`);
            lines.push(`    ${f.message}`);
            if (f.suggestion) {
                lines.push(`    ${chalk.dim(`→ ${f.suggestion}`)}`);
            }
        }
    }
    console.log(boxen(lines.join('\n'), {
        title: 'Code Review',
        padding: 1,
        borderColor: result.passed ? 'green' : 'yellow',
        borderStyle: 'round',
    }));
}
export function displayChangedFiles(files) {
    const lines = files.map((f) => {
        const statusChar = f.status === 'added' ? chalk.green('A') :
            f.status === 'deleted' ? chalk.red('D') :
                f.status === 'renamed' ? chalk.blue('R') :
                    chalk.yellow('M');
        return `  ${statusChar} ${f.path}`;
    });
    console.log(lines.join('\n'));
}
//# sourceMappingURL=display.js.map