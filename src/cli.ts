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
import { promptIssueId, promptConfirmIssueId, promptCommitPlanAction, promptEditCommitMessage, promptReviewAction, promptConfirmPush, promptAIFailureAction, promptPlainTextRequirements, promptCreatePR, promptPRTitle, promptPRDraft, promptEditPRBody, promptPRBodyEditor } from './ui/prompts.js';
import { createPRAdapter, isPRSupported, generatePRTitle, generatePRBody, generatePRBodyWithAI } from './pr/index.js';
import { matchesAnyPattern } from './utils/patterns.js';
import { logger, setLogLevel } from './utils/logger.js';
import { GitShipError, AIError } from './utils/errors.js';
import { createUpdateChecker, displayUpdateBanner, displayUpdateNotification, type UpdateChecker } from './utils/update-check.js';
import { getLastSeenVersion, setLastSeenVersion, getWhatsNewSinceVersion, displayWhatsNew, getUpdateTeaser } from './utils/whats-new.js';

const require = createRequire(import.meta.url);
const { version: VERSION } = require('../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

const TOTAL_STEPS = 8;

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

  // ─── Step 8: Create Pull Request ───
  logger.step(8, TOTAL_STEPS, 'Pull request...');

  const prSupported = await isPRSupported();
  if (prSupported) {
    const wantPR = await promptCreatePR();

    if (wantPR) {
      const prAdapter = createPRAdapter();
      if (prAdapter) {
        const baseBranch = await prAdapter.getDefaultBaseBranch();

        // Generate PR title and body using AI
        const defaultTitle = generatePRTitle(issueContext, groups);
        const prTitle = await promptPRTitle(defaultTitle);

        const prBody = await withSpinner(
          'Generating PR description with AI',
          () => generatePRBodyWithAI({
            issue: issueContext,
            commits: groups,
            branchName,
            baseBranch,
            config,
          }),
        );

        // Ask if user wants to edit the body
        const wantEdit = await promptEditPRBody();
        const finalBody = wantEdit ? await promptPRBodyEditor(prBody) : prBody;

        // Ask if draft
        const isDraft = await promptPRDraft();

        // Create the PR
        const prResult = await withSpinner(
          'Creating pull request',
          () => prAdapter.createPR({
            title: prTitle,
            body: finalBody,
            baseBranch,
            headBranch: branchName,
            isDraft,
          }),
        );

        if (prResult.success && prResult.url) {
          logger.success(`Pull request created: ${chalk.cyan.underline(prResult.url)}`);
        } else if (prResult.error) {
          logger.warn(`Could not create PR: ${prResult.error}`);
        }
      }
    } else {
      logger.info(chalk.dim('Skipped PR creation.'));
    }
  } else {
    // gh CLI not available - offer to generate PR description for manual copy
    logger.warn('GitHub CLI (gh) not found. Cannot create PR automatically.');
    logger.info(chalk.dim('Install with: brew install gh (or visit https://cli.github.com)'));

    const wantDescription = await promptCreatePR();
    if (wantDescription) {
      const baseBranch = 'main'; // Default assumption

      const prBody = await withSpinner(
        'Generating PR description with AI',
        () => generatePRBodyWithAI({
          issue: issueContext,
          commits: groups,
          branchName,
          baseBranch,
          config,
        }),
      );

      const defaultTitle = generatePRTitle(issueContext, groups);

      console.log('\n' + chalk.bold.cyan('─── PR Title ───'));
      console.log(defaultTitle);
      console.log('\n' + chalk.bold.cyan('─── PR Description (copy this) ───'));
      console.log(prBody);
      console.log(chalk.bold.cyan('─────────────────────────────────') + '\n');

      logger.info(`Create your PR manually at: ${chalk.cyan('https://github.com/<owner>/<repo>/compare/' + branchName)}`);
    }
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

      // Check if we just updated - show "What's New" once
      const lastSeenVersion = await getLastSeenVersion();
      if (lastSeenVersion !== VERSION) {
        const newReleases = getWhatsNewSinceVersion(lastSeenVersion, VERSION);
        if (newReleases.length > 0 && lastSeenVersion !== null) {
          // Only show if user has used git-ship before (not first time)
          displayWhatsNew(newReleases);
        }
        await setLastSeenVersion(VERSION);
      }

      // Start update check immediately (non-blocking)
      const updateChecker = createUpdateChecker(VERSION);

      // Wait up to 300ms for the check to complete
      let updateShownAtStart = false;
      const latest = await updateChecker.wait(300);

      if (latest) {
        displayUpdateBanner(VERSION, latest);
        // Show teaser of what's in the new version
        const teaser = getUpdateTeaser(latest);
        if (teaser) {
          console.log(chalk.cyan(`  ${teaser}`));
          console.log();
        }
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

// ─── PR Subcommand ───
program
  .command('pr')
  .description('Create a pull request for the current branch')
  .option('-d, --draft', 'Create as draft PR')
  .option('-t, --title <title>', 'PR title (defaults to branch/issue name)')
  .option('-b, --base <branch>', 'Base branch (defaults to main/master)')
  .action(async (options) => {
    try {
      const git = createGit();

      // Check if we're in a git repo
      if (!(await isGitRepository(git))) {
        logger.error('Not a git repository');
        process.exit(1);
      }

      // Check if PR creation is supported (gh CLI available)
      const prSupported = await isPRSupported();
      const prAdapter = prSupported ? createPRAdapter() : null;

      // Get current branch
      const status = await getStatus(git);
      const branchName = status.branch;

      // Determine base branch
      let baseBranch = options.base || 'main';
      if (prAdapter) {
        baseBranch = options.base || await prAdapter.getDefaultBaseBranch();
      }

      logger.info(`Creating PR: ${chalk.cyan(branchName)} → ${chalk.cyan(baseBranch)}`);

      // Load config for issue tracking
      const config = await loadConfig();

      // Try to get issue context
      let issueContext: IssueContext | null = null;
      const needsIssueFetch = requiresIssueFetch(config);

      if (needsIssueFetch) {
        const parsed = parseBranch(branchName, config.branch.teamPrefixes);
        if (parsed.issueId) {
          const issueClient = createIssueTrackerClient(config);
          if (issueClient) {
            try {
              issueContext = await withSpinner(
                `Fetching issue ${parsed.issueId}`,
                () => issueClient.getIssue(parsed.issueId!),
              );
            } catch {
              logger.warn(`Could not fetch issue ${parsed.issueId}`);
            }
          }
        }
      }

      // Get commits on this branch with full details
      const { execSync } = await import('node:child_process');
      const commitGroups: CommitGroup[] = [];

      try {
        // Get commit hashes
        const hashLog = execSync(`git log ${baseBranch}..HEAD --pretty=format:"%H"`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        const hashes = hashLog.trim().split('\n').filter(Boolean);

        for (const hash of hashes) {
          // Get full commit message
          const fullMessage = execSync(`git log -1 ${hash} --pretty=format:"%B"`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
          }).trim();

          // Get files changed in this commit
          const filesOutput = execSync(`git diff-tree --no-commit-id --name-only -r ${hash}`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
          });
          const files = filesOutput.trim().split('\n').filter(Boolean);

          // Parse the commit message
          const lines = fullMessage.split('\n');
          const subjectLine = lines[0] || '';

          // Parse conventional commit header
          const headerMatch = subjectLine.match(/^(\w+)(?:\(([^)]+)\))?: (.+)$/);
          const type = headerMatch ? headerMatch[1] : 'chore';
          const scope = headerMatch ? (headerMatch[2] || 'misc') : 'misc';
          const summary = headerMatch ? headerMatch[3] : subjectLine;

          // Extract body (everything between header and footer)
          let body: string | undefined;
          let addresses: string | undefined;

          // Find body content (skip empty lines after header)
          const bodyLines: string[] = [];
          let inBody = false;
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!inBody && line.trim() === '') continue; // Skip empty lines at start
            if (line.startsWith('Addresses:')) {
              addresses = line.replace('Addresses:', '').trim();
              continue;
            }
            if (line.startsWith('Refs:')) continue; // Skip refs line
            if (line.startsWith('Co-Authored-By:')) continue; // Skip co-author
            inBody = true;
            bodyLines.push(line);
          }

          // Clean up trailing empty lines from body
          while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === '') {
            bodyLines.pop();
          }

          if (bodyLines.length > 0) {
            body = bodyLines.join('\n');
          }

          commitGroups.push({
            files,
            type,
            scope,
            summary,
            body,
            addresses,
            rationale: '',
          });
        }
      } catch {
        // Branch might not have diverged yet or other git error
      }

      // Reverse to show oldest commits first (chronological order)
      commitGroups.reverse();

      // Generate title
      const defaultTitle = options.title || generatePRTitle(issueContext, commitGroups);
      const prTitle = await promptPRTitle(defaultTitle);

      // Generate body using AI
      const prBody = await withSpinner(
        'Generating PR description with AI',
        () => generatePRBodyWithAI({
          issue: issueContext,
          commits: commitGroups,
          branchName,
          baseBranch,
          config,
        }),
      );

      // Ask if user wants to edit
      const wantEdit = await promptEditPRBody();
      const finalBody = wantEdit ? await promptPRBodyEditor(prBody) : prBody;

      if (prAdapter) {
        // gh CLI available - create PR automatically
        const isDraft = options.draft || await promptPRDraft();

        const prResult = await withSpinner(
          'Creating pull request',
          () => prAdapter.createPR({
            title: prTitle,
            body: finalBody,
            baseBranch,
            headBranch: branchName,
            isDraft,
          }),
        );

        if (prResult.success && prResult.url) {
          logger.success(`Pull request created: ${chalk.cyan.underline(prResult.url)}`);
        } else if (prResult.error) {
          logger.error(`Could not create PR: ${prResult.error}`);
          process.exit(1);
        }
      } else {
        // gh CLI not available - show PR description for manual copy
        logger.warn('GitHub CLI (gh) not found. Cannot create PR automatically.');
        logger.info(chalk.dim('Install with: brew install gh (or visit https://cli.github.com)\n'));

        console.log(chalk.bold.cyan('─── PR Title ───'));
        console.log(prTitle);
        console.log('\n' + chalk.bold.cyan('─── PR Description (copy this) ───'));
        console.log(finalBody);
        console.log(chalk.bold.cyan('─────────────────────────────────') + '\n');

        logger.info(`Create your PR manually at: ${chalk.cyan(`https://github.com/<owner>/<repo>/compare/${branchName}`)}`);
      }
    } catch (error) {
      if (error instanceof GitShipError) {
        logger.error(error.message);
        if (error.suggestion) {
          logger.info(chalk.dim(`Suggestion: ${error.suggestion}`));
        }
        process.exit(1);
      }
      throw error;
    }
  });

// ─── Release Subcommand ───
program
  .command('release')
  .description('Create a GitHub release with AI-generated notes')
  .option('-v, --version <version>', 'Version to release (defaults to package.json version)')
  .option('--draft', 'Create as draft release')
  .option('--dry-run', 'Generate notes without creating release')
  .action(async (options) => {
    try {
      const { execSync } = await import('node:child_process');

      // Get version from package.json or option
      const releaseVersion = options.version || VERSION;

      logger.info(`Preparing release v${releaseVersion}...`);

      // Check if gh CLI is available
      try {
        execSync('gh auth status', { stdio: 'pipe' });
      } catch {
        logger.error('GitHub CLI not authenticated. Run: gh auth login');
        process.exit(1);
      }

      // Get commits since last tag (or all commits if no tags)
      let commits: string[] = [];
      try {
        const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
          encoding: 'utf-8',
        }).trim();
        const log = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s|%b<<<END>>>"`, {
          encoding: 'utf-8',
        });
        commits = log.split('<<<END>>>').filter(Boolean).map(c => c.trim());
        logger.info(`Found ${commits.length} commits since ${lastTag}`);
      } catch {
        // No tags yet - get recent commits
        const log = execSync('git log --oneline -30', { encoding: 'utf-8' });
        commits = log.trim().split('\n');
        logger.info(`No previous tags found. Using last ${commits.length} commits.`);
      }

      if (commits.length === 0) {
        logger.warn('No commits found for release notes.');
        process.exit(1);
      }

      // Load config for AI
      const config = await loadConfig();

      // Generate release notes using AI
      const prompt = `Generate professional GitHub release notes for version ${releaseVersion} of git-ship (a CLI tool for AI-powered git workflow).

Based on these commits:
${commits.join('\n')}

Format the release notes in markdown with:
1. A brief intro (1-2 sentences)
2. "## What's New" section with the major features/changes (use emojis)
3. "## Improvements" section for smaller enhancements
4. "## Bug Fixes" section if applicable
5. "## Breaking Changes" section if applicable (only if there are actual breaking changes)

Keep it concise and user-friendly. Focus on what users care about, not implementation details.
Output ONLY the markdown, no preamble.`;

      logger.info('Generating release notes with AI...');

      const { generatePRBodyWithAI } = await import('./pr/index.js');

      // Reuse the AI calling infrastructure
      let releaseNotes: string;
      const aiProvider = config.ai.provider;
      const aiModel = config.ai.model;

      if (aiProvider === 'openai') {
        const OpenAI = (await import('openai')).default;
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await client.chat.completions.create({
          model: aiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
        });
        releaseNotes = response.choices[0]?.message?.content ?? '';
      } else if (aiProvider === 'anthropic') {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await client.messages.create({
          model: aiModel,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });
        const textBlock = response.content.find((b) => b.type === 'text');
        releaseNotes = textBlock && 'text' in textBlock ? textBlock.text : '';
      } else {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: aiModel });
        const result = await model.generateContent(prompt);
        releaseNotes = result.response.text();
      }

      console.log('\n' + chalk.bold.cyan('─── Release Notes ───'));
      console.log(releaseNotes);
      console.log(chalk.bold.cyan('─────────────────────') + '\n');

      if (options.dryRun) {
        logger.info('Dry run - release not created.');
        return;
      }

      // Create the release
      const { confirm } = await import('@inquirer/prompts');
      const shouldCreate = await confirm({
        message: `Create GitHub release v${releaseVersion}?`,
        default: true,
      });

      if (!shouldCreate) {
        logger.info('Release cancelled.');
        return;
      }

      // Write notes to temp file for gh CLI
      const { writeFileSync, unlinkSync } = await import('node:fs');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');
      const notesFile = join(tmpdir(), `gitship-release-notes-${Date.now()}.md`);
      writeFileSync(notesFile, releaseNotes, 'utf-8');

      try {
        const args = [
          'gh', 'release', 'create',
          `v${releaseVersion}`,
          '--title', `v${releaseVersion}`,
          '--notes-file', notesFile,
        ];

        if (options.draft) {
          args.push('--draft');
        }

        execSync(args.join(' '), { stdio: 'inherit' });
        logger.success(`Release v${releaseVersion} created!`);
      } finally {
        try {
          unlinkSync(notesFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      }
      process.exit(1);
    }
  });

program.parse();
