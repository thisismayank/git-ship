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
import { createGit, getStatus, isGitRepository } from './git/status.js';
import { getFileDiffs } from './git/diff.js';
import { stageAndCommitMultiple } from './git/commit.js';
import { pushToRemote } from './git/push.js';
import { parseBranch } from './linear/branch-parser.js';
import { createIssueTrackerClient, requiresIssueFetch, usesPlainTextContext, createPlainTextContext, type IssueContext } from './issue-tracker/index.js';
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
import { promptIssueId, promptConfirmIssueId, promptCommitPlanAction, promptEditCommitMessage, promptReviewAction, promptConfirmPush, promptAIFailureAction, promptPlainTextRequirements } from './ui/prompts.js';
import { matchesAnyPattern } from './utils/patterns.js';
import { logger, setLogLevel } from './utils/logger.js';
import { GitShipError, AIError } from './utils/errors.js';
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

  // Early check: make sure we're in a git repository
  const git = createGit();
  if (!(await isGitRepository(git))) {
    logger.error('Not a git repository');
    logger.info(chalk.dim('Run this command from inside a git repository, or initialize one with: git init'));
    process.exit(1);
  }

  // Run setup wizards if needed (global and/or repo)
  await ensureSetup();

  const config = await loadConfig();

  // ─── Step 1: Detect branch & parse issue ID ───
  logger.step(1, TOTAL_STEPS, 'Detecting branch and issue ID...');

  const status = await getStatus(git);

  if (status.isClean) {
    logger.info(chalk.dim('No changes to commit. Working tree is clean.'));
    return;
  }

  const branchName = status.branch;
  logger.debug(`Branch: ${branchName}`);

  // Parse issue ID from branch if using an external issue tracker
  let issueId: string | null = options.issue ?? null;
  const needsIssueFetch = requiresIssueFetch(config);

  if (needsIssueFetch && !issueId) {
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

    if (!issueId) {
      issueId = await promptIssueId(branchName);
    }

    if (issueId) {
      logger.success(`Issue: ${chalk.bold(issueId)}`);
    } else {
      logger.warn('No issue ID detected. Proceeding without issue context.');
    }
  }

  // ─── Step 2: Fetch issue context ───
  const providerName = config.issueTracker.provider;
  const providerLabels: Record<string, string> = {
    linear: 'Linear',
    jira: 'Jira',
    asana: 'Asana',
    plain: 'Plain Text',
    none: 'None',
  };

  logger.step(2, TOTAL_STEPS, `Fetching issue context (${providerLabels[providerName] || providerName})...`);

  let issueContext: IssueContext | null = null;

  if (usesPlainTextContext(config)) {
    // Plain text mode: prompt user for requirements
    const requirements = await promptPlainTextRequirements();
    if (requirements) {
      issueContext = createPlainTextContext(requirements);
      logger.success('Requirements captured.');
    } else {
      logger.info(chalk.dim('No requirements provided. Proceeding with diffs only.'));
    }
  } else if (needsIssueFetch && issueId) {
    // External issue tracker: fetch from API
    const issueClient = createIssueTrackerClient(config);
    if (issueClient) {
      try {
        issueContext = await withSpinner(`Fetching issue from ${issueClient.name}`, () =>
          issueClient.getIssue(issueId!),
        );
        if (issueContext) {
          displayIssueContext(issueContext);
        } else {
          logger.warn(`Issue ${issueId} not found.`);
        }
      } catch (error) {
        logger.warn(`Could not fetch issue: ${(error as Error).message}`);
        logger.debug('Proceeding without issue context.');
      }
    } else {
      const keyNames: Record<string, string> = {
        linear: 'LINEAR_API_KEY',
        jira: 'JIRA_API_TOKEN and JIRA_EMAIL',
        asana: 'ASANA_ACCESS_TOKEN',
      };
      logger.warn(`${keyNames[providerName] || 'API key'} not set. Skipping issue fetch.`);
    }
  } else if (providerName === 'none') {
    logger.info(chalk.dim('Issue tracking disabled. Using diffs only.'));
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

  // Initialize with fallback groups - will be overwritten on AI success
  let groups: CommitGroup[] = mergeAIGroups(preGroups, null, filePaths);
  let aiAnalysisSucceeded = false;

  // Keep trying AI analysis until success, user chooses to continue with basic, or cancels
  while (!aiAnalysisSucceeded) {
    try {
      const aiGroups = await withSpinner('AI analyzing diffs for optimal grouping', () =>
        analyzeWithAI(config, diffs, preGroups, issueContext),
      );
      groups = mergeAIGroups(preGroups, aiGroups, filePaths);
      aiAnalysisSucceeded = true;
    } catch (error) {
      const aiError = error as AIError;

      // Show prominent error message
      console.log(); // Add spacing
      logger.error(chalk.bold('AI commit analysis failed'));
      logger.error(aiError.message);
      if (aiError.suggestion) {
        logger.info(chalk.dim(`Suggestion: ${aiError.suggestion}`));
      }
      console.log(); // Add spacing

      // Prompt user for action
      const failureAction = await promptAIFailureAction(aiError.message);

      if (failureAction === 'cancel') {
        logger.info('Cancelled.');
        return;
      }

      if (failureAction === 'retry') {
        logger.info('Retrying AI analysis...');
        continue; // Loop back to try again
      }

      // failureAction === 'continue' - proceed with basic commits (already initialized)
      logger.warn('Proceeding with basic commit messages (file grouping by directory).');
      break;
    }
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
    let regroupSucceeded = false;

    while (!regroupSucceeded) {
      try {
        const aiGroups = await withSpinner('Re-analyzing diffs', () =>
          analyzeWithAI(config, diffs, preGroups, issueContext),
        );
        finalGroups = mergeAIGroups(preGroups, aiGroups, filePaths);
        regroupSucceeded = true;
      } catch (error) {
        const aiError = error as AIError;

        console.log();
        logger.error(chalk.bold('AI re-grouping failed'));
        logger.error(aiError.message);
        if (aiError.suggestion) {
          logger.info(chalk.dim(`Suggestion: ${aiError.suggestion}`));
        }
        console.log();

        const failureAction = await promptAIFailureAction(aiError.message);

        if (failureAction === 'cancel') {
          logger.info('Cancelled.');
          return;
        }

        if (failureAction === 'retry') {
          logger.info('Retrying AI analysis...');
          continue;
        }

        // Continue with previous groups
        logger.warn('Keeping previous commit grouping.');
        break;
      }
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
    maxHeaderLength: config.commits.maxMessageLength,
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
  $ gs config                 Show current configuration
  $ gs config set <key> <val> Update a setting (e.g., gs config set commits.headerLength 50)
  $ gs config path            Show config file paths

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

// ─── Config Subcommand ───
const configCmd = program
  .command('config')
  .description('View or modify git-ship configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const { loadGlobalConfig, getGlobalConfigPath } = await import('./config/global.js');
    const { loadConfig } = await import('./config/loader.js');

    const globalConfig = await loadGlobalConfig();
    const effectiveConfig = await loadConfig();

    if (options.json) {
      console.log(JSON.stringify(effectiveConfig, null, 2));
      return;
    }

    console.log(chalk.bold('\n📁 Configuration Files\n'));
    console.log(`  Global: ${chalk.cyan(getGlobalConfigPath())}`);
    console.log(`  Local:  ${chalk.cyan('.gitshiprc.json')} ${chalk.dim('(if exists, overrides global)')}`);

    console.log(chalk.bold('\n⚙️  Current Settings\n'));

    // Issue Tracker
    const provider = effectiveConfig.issueTracker?.provider || 'none';
    const providerLabels: Record<string, string> = {
      linear: 'Linear',
      jira: 'Jira (Experimental)',
      asana: 'Asana (Experimental)',
      plain: 'Plain Text',
      none: 'None',
    };
    console.log(`  ${chalk.dim('Issue Tracker:')}  ${providerLabels[provider] || provider}`);

    // AI Provider
    console.log(`  ${chalk.dim('AI Provider:')}    ${effectiveConfig.ai.provider} (${effectiveConfig.ai.model})`);

    // Commits
    console.log(`  ${chalk.dim('Header Length:')} ${effectiveConfig.commits.maxMessageLength} characters`);
    console.log(`  ${chalk.dim('Conventional:')}  ${effectiveConfig.commits.conventional ? 'Yes' : 'No'}`);
    console.log(`  ${chalk.dim('Issue Refs:')}    ${effectiveConfig.commits.includeIssueRef ? 'Yes' : 'No'}`);

    // Review
    console.log(`  ${chalk.dim('Code Review:')}   ${effectiveConfig.review.enabled ? `${effectiveConfig.review.tool} (${effectiveConfig.review.transport})` : 'Disabled'}`);

    console.log(chalk.dim('\nRun "gs config set <key> <value>" to change settings.'));
    console.log(chalk.dim('Run "gs --setup" to re-run the full setup wizard.\n'));
  });

configCmd
  .command('set <key> <value>')
  .description('Set a configuration value')
  .addHelpText('after', `
Supported keys:
  commits.headerLength    Maximum commit header length (20-200)
  commits.conventional    Use conventional commits format (true/false)
  commits.includeIssueRef Include issue reference in commits (true/false)
  issueTracker.provider   Issue tracker: linear, jira, asana, plain, none
  ai.provider             AI provider: openai, anthropic, gemini
  ai.model                AI model name (e.g., gpt-4o, claude-sonnet-4-20250514)
  review.enabled          Enable code review (true/false)
  review.tool             Review tool: coderabbit, devin, codex, graphite

Examples:
  $ gs config set commits.headerLength 50
  $ gs config set ai.provider anthropic
  $ gs config set issueTracker.provider plain
  $ gs config set review.enabled false
`)
  .action(async (key: string, value: string) => {
    const { loadGlobalConfig, writeGlobalConfig, getGlobalConfigPath } = await import('./config/global.js');
    type PartialConfig = Record<string, Record<string, unknown> | undefined>;

    const config: PartialConfig = await loadGlobalConfig() || {};

    // Parse the key path
    const keyLower = key.toLowerCase();
    let updated = false;

    // Handle different config keys
    if (keyLower === 'commits.headerlength' || keyLower === 'commits.maxmessagelength') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 20 || num > 200) {
        logger.error('Header length must be a number between 20 and 200');
        process.exit(1);
      }
      config.commits = { ...config.commits, maxMessageLength: num };
      updated = true;
      logger.success(`Set commits.headerLength = ${num}`);

    } else if (keyLower === 'commits.conventional') {
      const bool = value.toLowerCase() === 'true';
      config.commits = { ...config.commits, conventional: bool };
      updated = true;
      logger.success(`Set commits.conventional = ${bool}`);

    } else if (keyLower === 'commits.includeissueref') {
      const bool = value.toLowerCase() === 'true';
      config.commits = { ...config.commits, includeIssueRef: bool };
      updated = true;
      logger.success(`Set commits.includeIssueRef = ${bool}`);

    } else if (keyLower === 'issuetracker.provider') {
      const validProviders = ['linear', 'jira', 'asana', 'plain', 'none'];
      if (!validProviders.includes(value.toLowerCase())) {
        logger.error(`Invalid provider. Must be one of: ${validProviders.join(', ')}`);
        process.exit(1);
      }
      config.issueTracker = { ...config.issueTracker, provider: value.toLowerCase() };
      updated = true;
      logger.success(`Set issueTracker.provider = ${value.toLowerCase()}`);

    } else if (keyLower === 'ai.provider') {
      const validProviders = ['openai', 'anthropic', 'gemini'];
      if (!validProviders.includes(value.toLowerCase())) {
        logger.error(`Invalid AI provider. Must be one of: ${validProviders.join(', ')}`);
        process.exit(1);
      }
      config.ai = { ...config.ai, provider: value.toLowerCase() };
      updated = true;
      logger.success(`Set ai.provider = ${value.toLowerCase()}`);

    } else if (keyLower === 'ai.model') {
      config.ai = { ...config.ai, model: value };
      updated = true;
      logger.success(`Set ai.model = ${value}`);

    } else if (keyLower === 'review.enabled') {
      const bool = value.toLowerCase() === 'true';
      config.review = { ...config.review, enabled: bool };
      updated = true;
      logger.success(`Set review.enabled = ${bool}`);

    } else if (keyLower === 'review.tool') {
      const validTools = ['coderabbit', 'devin', 'codex', 'graphite'];
      if (!validTools.includes(value.toLowerCase())) {
        logger.error(`Invalid review tool. Must be one of: ${validTools.join(', ')}`);
        process.exit(1);
      }
      config.review = { ...config.review, tool: value.toLowerCase() };
      updated = true;
      logger.success(`Set review.tool = ${value.toLowerCase()}`);

    } else {
      logger.error(`Unknown config key: ${key}`);
      logger.info('Run "gs config set --help" to see available keys.');
      process.exit(1);
    }

    if (updated) {
      await writeGlobalConfig(config);
      logger.info(chalk.dim(`Config saved to ${getGlobalConfigPath()}`));
    }
  });

configCmd
  .command('path')
  .description('Show configuration file paths')
  .action(async () => {
    const { getGlobalConfigPath } = await import('./config/global.js');
    console.log(chalk.bold('\nConfiguration File Paths\n'));
    console.log(`  Global config: ${chalk.cyan(getGlobalConfigPath())}`);
    console.log(`  Local config:  ${chalk.cyan('.gitshiprc.json')} ${chalk.dim('(in repository root)')}`);
    console.log(`  API keys:      ${chalk.cyan('~/.zshrc')} ${chalk.dim('or ~/.bashrc')}`);
    console.log();
  });

// Default config command (no subcommand) shows config
configCmd.action(async () => {
  // Run 'show' by default
  await configCmd.commands.find(c => c.name() === 'show')?.parseAsync([]);
});

program.parse();
