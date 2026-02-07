import chalk from 'chalk';
import boxen from 'boxen';
import type { CommitGroup } from '../analysis/grouper.js';
import type { ReviewResult } from '../review/runner.js';
import type { IssueContext } from '../issue-tracker/types.js';

export function displayIssueContext(issue: IssueContext): void {
  const sourceLabels: Record<string, string> = {
    linear: 'Linear Issue',
    jira: 'Jira Issue',
    asana: 'Asana Task',
    plain: 'Requirements',
    none: 'Context',
  };

  const title = sourceLabels[issue.source] || 'Issue Context';

  const lines: string[] = [];

  // For plain text, just show the description
  if (issue.source === 'plain') {
    if (issue.description) {
      const truncated =
        issue.description.length > 300 ? issue.description.slice(0, 300) + '...' : issue.description;
      lines.push(chalk.dim(truncated));
    }
  } else {
    // For external issue trackers, show full context
    lines.push(`${chalk.bold(issue.identifier)}: ${issue.title}`);

    if (issue.labels.length > 0) {
      lines.push(`Labels: ${issue.labels.map((l) => chalk.magenta(l)).join(', ')}`);
    }

    if (issue.description) {
      const truncated =
        issue.description.length > 200 ? issue.description.slice(0, 200) + '...' : issue.description;
      lines.push('', chalk.dim(truncated));
    }

    if (issue.url) {
      lines.push('', chalk.dim.underline(issue.url));
    }
  }

  console.log(
    boxen(lines.join('\n'), {
      title,
      padding: 1,
      borderColor: 'blue',
      borderStyle: 'round',
    }),
  );
}

export function displayCommitPlan(groups: CommitGroup[], issueId?: string): void {
  const lines: string[] = [];

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const ref = issueId && g.type !== 'chore' ? ` (${issueId})` : '';
    const header = `${chalk.bold.green(`${i + 1}.`)} ${chalk.bold(`${g.type}(${g.scope}): ${g.summary}`)}${chalk.dim(ref)}`;
    const files = g.files.map((f) => `   ${chalk.dim('•')} ${f}`).join('\n');

    lines.push(header, files);

    // Show body if present (indented and dimmed)
    if (g.body) {
      const bodyLines = g.body.split('\n').map((line) => `   ${chalk.dim(line)}`).join('\n');
      lines.push(bodyLines);
    }

    // Show what requirement this addresses
    if (g.addresses) {
      lines.push(`   ${chalk.cyan('Addresses:')} ${chalk.dim(g.addresses)}`);
    }

    // Show rationale (why files are grouped together)
    if (g.rationale) {
      lines.push(`   ${chalk.dim.italic(g.rationale)}`);
    }

    lines.push('');
  }

  console.log(
    boxen(lines.join('\n').trimEnd(), {
      title: `Commit Plan (${groups.length} commit${groups.length === 1 ? '' : 's'})`,
      padding: 1,
      borderColor: 'green',
      borderStyle: 'round',
    }),
  );
}

export function displayReviewResults(result: ReviewResult): void {
  const statusColor = result.passed ? chalk.green : chalk.red;
  const statusText = result.passed ? 'PASSED' : 'ISSUES FOUND';

  const lines = [
    `Status: ${statusColor.bold(statusText)}`,
    `Summary: ${result.summary}`,
  ];

  if (result.findings.length > 0) {
    lines.push('', chalk.bold('Findings:'));
    for (const f of result.findings) {
      const sevColor =
        f.severity === 'critical' ? chalk.red : f.severity === 'warning' ? chalk.yellow : chalk.dim;
      const location = f.line ? `${f.file}:${f.line}` : f.file;
      lines.push(`  ${sevColor(`[${f.severity}]`)} ${chalk.dim(location)}`);
      lines.push(`    ${f.message}`);
      if (f.suggestion) {
        lines.push(`    ${chalk.dim(`→ ${f.suggestion}`)}`);
      }
    }
  }

  console.log(
    boxen(lines.join('\n'), {
      title: 'Code Review',
      padding: 1,
      borderColor: result.passed ? 'green' : 'yellow',
      borderStyle: 'round',
    }),
  );
}

export function displayChangedFiles(files: { path: string; status: string }[]): void {
  const lines = files.map((f) => {
    const statusChar =
      f.status === 'added' ? chalk.green('A') :
      f.status === 'deleted' ? chalk.red('D') :
      f.status === 'renamed' ? chalk.blue('R') :
      chalk.yellow('M');
    return `  ${statusChar} ${f.path}`;
  });
  console.log(lines.join('\n'));
}
