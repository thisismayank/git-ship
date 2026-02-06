import 'dotenv/config';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Command } from 'commander';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { loadConfig, hasProjectConfig } from './config/loader.js';
import { shouldRunGlobalSetup, runGlobalSetupWizard } from './config/setup-wizard.js';
import { shouldRunRepoSetup, promptRepoSetup, runRepoSetupWizard, markRepoAsUsingGlobalConfig } from './config/repo-setup.js';
import type { GitShipConfig } from './config/schema.js';
import { createGit, getStatus } from './git/status.js';
import { getFileDiffs } from './git/diff.js';
import { stageAndCommitMultiple } from './git/commit.js';
import { pushToRemote } from './git/push.js';
import { parseBranch } from './linear/branch-parser.js';
import { createLinearClient, type LinearIssue } from './linear/index.js';
import { heuristicGroup, mergeAIGroups, type CommitGroup } from './analysis/grouper.js';
import { analyzeWithAI } from './analysis/ai-client.js';
import { formatAllCommitMessages } from './analysis/commit-message.js';
import { runReview, hasCriticalFindings, hasWarnings } from './review/runner.js';
import type { ReviewAdapter } from './review/runner.js';
import { CodeRabbitAdapter } from './review/coderabbit.js';
import { DevinAdapter } from './review/devin.js';
import { CodexAdapter } from './review/codex.js';
import { GraphiteAdapter } from './review/graphite.js';
import { withSpinner } from './ui/spinner.js';
import { displayIssueContext, displayCommitPlan, displayReviewResults, displayChangedFiles } from './ui/display.js';
import { promptIssueId, promptConfirmIssueId, promptCommitPlanAction, promptEditCommitMessage, promptReviewAction, promptConfirmPush } from './ui/prompts.js';
import { matchesAnyPattern } from './utils/patterns.js';
import { logger, setLogLevel } from './utils/logger.js';
import { GitShipError } from './utils/errors.js';
import { createUpdateChecker, displayUpdateBanner, displayUpdateNotification, type UpdateChecker } from './utils/update-check.js';

const require = createRequire(import.meta.url);
const { version: VERSION } = require('../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

const TOTAL_STEPS = 7;

function displayReadme(): void {
  try {
    const readmePath = join(PACKAGE_ROOT, 'README.md');
    const readme = readFileSync(readmePath, 'utf-8');
    console.log(readme);
  } catch {
    logger.error('Could not read README.md');
    logger.info('View online at: https://github.com/thisismayank/git-ship#readme');
  }
}

function getReviewAdapter(tool: string, config: GitShipConfig): ReviewAdapter {
  switch (tool) {
    case 'coderabbit': return new CodeRabbitAdapter(config);
    case 'devin': return new DevinAdapter(config);
    case 'codex': return new CodexAdapter(config);
    case 'graphite': return new GraphiteAdapter(config);
    default: return new CodeRabbitAdapter(config);
  }
}

async function ensureSetup(): Promise<void> {
  // Global setup wizard - first-time setup
  if (await shouldRunGlobalSetup()) {
    await runGlobalSetupWizard();
  }

  // Repo setup - prompt for global vs custom config
  if (await shouldRunRepoSetup()) {
    const choice = await promptRepoSetup();
    if (choice === 'customize') {
      await runRepoSetupWizard();
    } else if (choice === 'use-global') {
      await markRepoAsUsingGlobalConfig();
    }
    // 'skip' - no action needed, will prompt again next time
  }
}

async function ship(options: {
  dryRun?: boolean;
  verbose?: boolean;
  reviewTool?: string;
  noReview?: boolean;
  issue?: string;
  updateChecker?: UpdateChecker;
  updateShownAtStart?: boolean;
}): Promise<void> {
  if (options.verbose) setLogLevel('debug');

  // Run setup wizards if needed (global and/or repo)
  await ensureSetup();

  const config = await loadConfig();

  const git = createGit();

  // ─── Step 1: Detect branch & parse issue ID ───
  logger.step(1, TOTAL_STEPS, 'Detecting branch and issue ID...');

  const status = await getStatus(git);

  if (status.isClean) {
    logger.info(chalk.dim('No changes to commit. Working tree is clean.'));
    return;
  }

  const branchName = status.branch;
  logger.debug(`Branch: ${branchName}`);

  let issueId: string | null = options.issue ?? null;
  if (!issueId) {
    const parsed = parseBranch(branchName, config.branch.teamPrefixes);

    if (parsed.issueId) {
      if (parsed.confidence === 'high') {
        // High confidence: use directly
        issueId = parsed.issueId;
      } else {
        // Medium confidence: ask user to confirm
        const result = await promptConfirmIssueId(parsed.issueId, branchName);
        issueId = result.issueId;
      }
    }
  }

  if (!issueId) {
    issueId = await promptIssueId(branchName);
  }

  if (issueId) {
    logger.success(`Issue: ${chalk.bold(issueId)}`);
  } else {
    logger.warn('No issue ID detected. Proceeding without Linear context.');
  }

  // ─── Step 2: Fetch Linear context ───
  logger.step(2, TOTAL_STEPS, 'Fetching Linear context...');

  let issue: LinearIssue | null = null;
  if (issueId) {
    const linearClient = createLinearClient(config);
    if (linearClient) {
      try {
        issue = await withSpinner('Fetching issue details', () =>
          linearClient.getIssue(issueId!),
        );
        if (issue) {
          displayIssueContext(issue);
        } else {
          logger.warn(`Issue ${issueId} not found in Linear.`);
        }
      } catch (error) {
        logger.warn(`Could not fetch Linear issue: ${(error as Error).message}`);
        logger.debug('Proceeding without issue context.');
      }
    } else {
      logger.warn('LINEAR_API_KEY not set. Skipping issue fetch.');
    }
  }

  // ─── Step 3: Collect changed files & parse diffs ───
  logger.step(3, TOTAL_STEPS, 'Collecting changes and parsing diffs...');

  const changedFiles = status.changedFiles.filter(
    (f) => !matchesAnyPattern(f.path, config.ignorePatterns),
  );

  if (changedFiles.length === 0) {
    logger.info(chalk.dim('No changes to commit after filtering ignored files.'));
    return;
  }

  displayChangedFiles(changedFiles);
  logger.info(chalk.dim(`${changedFiles.length} file(s) changed`));

  const filePaths = changedFiles.map((f) => f.path);
  const diffs = await withSpinner('Parsing diffs', () =>
    getFileDiffs(git, filePaths),
  );

  // ─── Step 4: Group files into logical commits ───
  logger.step(4, TOTAL_STEPS, 'Grouping files into logical commits...');

  const preGroups = heuristicGroup(filePaths);
  logger.debug(`Heuristic pre-groups: ${preGroups.length}`);

  let groups: CommitGroup[];
  try {
    const aiGroups = await withSpinner('AI analyzing diffs for optimal grouping', () =>
      analyzeWithAI(config, diffs, preGroups, issue),
    );
    groups = mergeAIGroups(preGroups, aiGroups, filePaths);
  } catch (error) {
    logger.warn(`AI grouping failed: ${(error as Error).message}`);
    logger.info('Falling back to heuristic grouping.');
    groups = mergeAIGroups(preGroups, null, filePaths);
  }

  // ─── Step 5: Display commit plan & get user decision ───
  logger.step(5, TOTAL_STEPS, 'Reviewing commit plan...');

  displayCommitPlan(groups, issueId ?? undefined);

  if (options.dryRun) {
    logger.info(chalk.dim('Dry run — no commits or pushes will be made.'));
    return;
  }

  let finalGroups = groups;
  let action = await promptCommitPlanAction();

  while (action === 'edit') {
    for (let i = 0; i < finalGroups.length; i++) {
      const newSummary = await promptEditCommitMessage(finalGroups[i]);
      finalGroups[i] = { ...finalGroups[i], summary: newSummary };
    }
    displayCommitPlan(finalGroups, issueId ?? undefined);
    action = await promptCommitPlanAction();
  }

  if (action === 'cancel') {
    logger.info('Cancelled.');
    return;
  }

  if (action === 'regroup') {
    // Re-run AI grouping with a fresh call
    logger.info('Re-running AI grouping...');
    try {
      const aiGroups = await withSpinner('Re-analyzing diffs', () =>
        analyzeWithAI(config, diffs, preGroups, issue),
      );
      finalGroups = mergeAIGroups(preGroups, aiGroups, filePaths);
    } catch {
      logger.warn('AI re-grouping failed, using previous groups.');
    }
    displayCommitPlan(finalGroups, issueId ?? undefined);

    action = await promptCommitPlanAction();
    if (action === 'cancel') {
      logger.info('Cancelled.');
      return;
    }
  }

  // ─── Create commits ───
  const commitInputs = formatAllCommitMessages(finalGroups, {
    conventional: config.commits.conventional,
    includeIssueRef: config.commits.includeIssueRef,
    issueId,
    allowedTypes: config.commits.allowedTypes,
    maxMessageLength: config.commits.maxMessageLength,
  });

  const results = await withSpinner(
    `Creating ${commitInputs.length} commit(s)`,
    () => stageAndCommitMultiple(git, commitInputs),
  );

  for (const r of results) {
    logger.success(`${chalk.dim(r.hash.slice(0, 7))} ${r.message.split('\n')[0]}`);
  }

  // ─── Step 6: Code review gate ───
  const skipReview = options.noReview || !config.review.enabled;
  if (!skipReview) {
    logger.step(6, TOTAL_STEPS, 'Running code review...');

    const reviewToolName = options.reviewTool ?? config.review.tool;
    const adapter = getReviewAdapter(reviewToolName, config);

    try {
      const reviewResult = await withSpinner(
        `Running ${adapter.name} review`,
        () => runReview(adapter, 'main'),
      );

      displayReviewResults(reviewResult);

      if (!reviewResult.passed) {
        const hasCritical = hasCriticalFindings(reviewResult);
        const reviewAction = await promptReviewAction(hasCritical);

        if (reviewAction === 'cancel') {
          logger.info('Cancelled. Commits are local — you can amend or reset.');
          return;
        }
        if (reviewAction === 'fix') {
          logger.info('Fix the issues and run git-ship again.');
          return;
        }
        // 'push' — continue
      }
    } catch (error) {
      logger.warn(`Review failed: ${(error as Error).message}`);
      const shouldContinue = await promptConfirmPush(branchName);
      if (!shouldContinue) {
        logger.info('Cancelled.');
        return;
      }
    }
  } else {
    logger.step(6, TOTAL_STEPS, chalk.dim('Code review skipped.'));
  }

  // ─── Step 7: Push to remote ───
  logger.step(7, TOTAL_STEPS, 'Pushing to remote...');

  const shouldPush = await promptConfirmPush(branchName);
  if (!shouldPush) {
    logger.info('Commits created locally. Push when ready.');
    return;
  }

  const pushResult = await withSpinner(
    `Pushing ${branchName} to origin`,
    () => pushToRemote(git, branchName, { setUpstream: !status.tracking }),
  );

  if (pushResult.success) {
    logger.success(`Pushed to ${pushResult.remote}/${pushResult.branch}`);
  }

  // Show update notification at the end if it wasn't shown at start
  if (!options.updateShownAtStart && options.updateChecker) {
    const deferredUpdate = options.updateChecker.getResult();
    if (deferredUpdate) {
      console.log(); // Add spacing
      displayUpdateNotification(VERSION, deferredUpdate);
    }
  }
}

// ─── CLI Setup ───
const program = new Command();

program
  .name('git-ship')
  .description('AI-powered git workflow: auto-group commits, fetch Linear context, review & push')
  .version(VERSION)
  .option('-d, --dry-run', 'Show commit plan without executing')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--review-tool <tool>', 'Override review tool (coderabbit, devin, codex, graphite)')
  .option('--no-review', 'Skip code review step')
  .option('-i, --issue <id>', 'Manually specify Linear issue ID')
  .option('--setup', 'Re-run the setup wizard to update configuration')
  .option('--readme', 'Display the full README documentation')
  .addHelpText('after', `
Examples:
  $ gs                        Run the full interactive workflow
  $ gs --dry-run              Preview commit plan without executing
  $ gs --no-review            Skip the code review step
  $ gs -i ENG-123             Manually specify a Linear issue ID
  $ gs --setup                Re-run the setup wizard
  $ gs --readme               Display full documentation

Configuration:
  Global config:  ~/.config/gitship/config.json
  Local config:   .gitshiprc.json (per-repo overrides)
  API keys:       Stored in your shell profile (~/.zshrc, ~/.bashrc, etc.)

More info: https://github.com/thisismayank/git-ship
`)
  .action(async (options) => {
    try {
      // If --readme flag is passed, display the README and exit
      if (options.readme) {
        displayReadme();
        return;
      }

      // If --setup flag is passed, force re-run the setup wizard
      if (options.setup) {
        const { runGlobalSetupWizard } = await import('./config/setup-wizard.js');
        await runGlobalSetupWizard();
        logger.info(chalk.dim('\nSetup complete. Run gs again to commit changes.'));
        return;
      }

      // Start update check immediately (non-blocking)
      const updateChecker = createUpdateChecker(VERSION);

      // Wait up to 300ms for the check to complete
      let updateShownAtStart = false;
      const latest = await updateChecker.wait(300);

      if (latest) {
        displayUpdateBanner(VERSION, latest);
        updateShownAtStart = true;
        const action = await select({
          message: 'A new version is available. What would you like to do?',
          choices: [
            { name: 'Update now', value: 'update' as const },
            { name: 'Skip and continue', value: 'skip' as const },
          ],
        });

        if (action === 'update') {
          logger.info(`\nRun: ${chalk.cyan('npm i -g git-ship')}\n`);
          return;
        }
      }

      await ship({ ...options, updateChecker, updateShownAtStart });
    } catch (error) {
      if (error instanceof GitShipError) {
        logger.error(error.message);
        if (error.suggestion) {
          logger.info(chalk.dim(`Suggestion: ${error.suggestion}`));
        }
        process.exit(1);
      }
      // Rethrow unexpected errors
      throw error;
    }
  });

program.parse();
