import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { hasProjectConfig, writeProjectConfig } from './loader.js';
import { hasGlobalConfig, loadGlobalConfig } from './global.js';
import { logger } from '../utils/logger.js';

export type RepoSetupChoice = 'use-global' | 'customize' | 'skip';

export async function promptRepoSetup(): Promise<RepoSetupChoice> {
  const hasGlobal = await hasGlobalConfig();

  if (!hasGlobal) {
    // No global config — can't use it
    return 'skip';
  }

  logger.info(chalk.dim('First time using git-ship in this repository.\n'));

  return select<RepoSetupChoice>({
    message: 'How would you like to configure this repository?',
    choices: [
      {
        name: 'Use global config (recommended)',
        value: 'use-global',
        description: 'Uses settings from ~/.config/gitship/config.json',
      },
      {
        name: 'Customize for this repo',
        value: 'customize',
        description: 'Creates a local .gitshiprc.json with overrides',
      },
      {
        name: 'Skip for now',
        value: 'skip',
      },
    ],
  });
}

export async function markRepoAsUsingGlobalConfig(): Promise<void> {
  // Create a minimal .gitshiprc.json that indicates this repo uses global config
  // This prevents the prompt from appearing again
  await writeProjectConfig({
    $schema: 'https://github.com/thisismayank/git-ship',
    _useGlobalConfig: true,
  });
  logger.info(chalk.dim('Created .gitshiprc.json (using global config)'));
}

export async function runRepoSetupWizard(): Promise<void> {
  const globalConfig = await loadGlobalConfig();

  logger.info(chalk.bold('\n Customizing git-ship for this repository.\n'));

  const overrides: Record<string, unknown> = {};

  // AI settings
  const customizeAI = await confirm({
    message: 'Customize AI settings for this repo?',
    default: false,
  });

  if (customizeAI) {
    const provider = await select({
      message: 'AI provider for this repo:',
      default: globalConfig?.ai?.provider ?? 'openai',
      choices: [
        { name: 'OpenAI', value: 'openai' as const },
        { name: 'Anthropic', value: 'anthropic' as const },
        { name: 'Gemini', value: 'gemini' as const },
      ],
    });

    const model = await input({
      message: 'Model name:',
      default: globalConfig?.ai?.model ?? 'gpt-4o',
    });

    overrides.ai = { provider, model };
  }

  // Review settings
  const customizeReview = await confirm({
    message: 'Customize review settings for this repo?',
    default: false,
  });

  if (customizeReview) {
    const tool = await select({
      message: 'Code review tool for this repo:',
      default: globalConfig?.review?.tool ?? 'coderabbit',
      choices: [
        { name: 'CodeRabbit', value: 'coderabbit' as const },
        { name: 'Devin', value: 'devin' as const },
        { name: 'Codex', value: 'codex' as const },
        { name: 'Graphite Diamond', value: 'graphite' as const },
      ],
    });

    const enabled = await confirm({
      message: 'Enable code review for this repo?',
      default: true,
    });

    overrides.review = { enabled, tool };
  }

  // Commit settings
  const customizeCommits = await confirm({
    message: 'Customize commit settings for this repo?',
    default: false,
  });

  if (customizeCommits) {
    const maxLenInput = await input({
      message: 'Maximum commit message length (20-200):',
      default: String(globalConfig?.commits?.maxMessageLength ?? 72),
      validate: (val) => {
        const n = parseInt(val.trim(), 10);
        if (isNaN(n) || n < 20 || n > 200) return 'Must be a number between 20 and 200';
        return true;
      },
    });

    const conventional = await confirm({
      message: 'Use conventional commits?',
      default: true,
    });

    overrides.commits = {
      maxMessageLength: parseInt(maxLenInput.trim(), 10),
      conventional,
    };
  }

  // Issue Tracker Integration
  const customizeIssueTracker = await confirm({
    message: 'Customize issue tracker settings for this repo?',
    default: false,
  });

  if (customizeIssueTracker) {
    const issueProvider = await select({
      message: 'Issue tracker for this repo:',
      default: globalConfig?.issueTracker?.provider ?? 'none',
      choices: [
        {
          name: 'Linear',
          value: 'linear' as const,
          description: 'Fetches issue context from Linear',
        },
        {
          name: 'Jira (Experimental)',
          value: 'jira' as const,
          description: 'Fetches issue context from Jira',
        },
        {
          name: 'Asana (Experimental)',
          value: 'asana' as const,
          description: 'Fetches issue context from Asana',
        },
        {
          name: 'Plain Text',
          value: 'plain' as const,
          description: 'Enter requirements manually at commit time',
        },
        {
          name: 'None',
          value: 'none' as const,
          description: 'Basic commits without issue context',
        },
      ],
    });

    overrides.issueTracker = { provider: issueProvider };

    // Show warning for 'none' selection
    if (issueProvider === 'none') {
      console.log(chalk.yellow('\n⚠️  Without issue tracking, commits will be simpler:\n'));
      console.log(chalk.dim('  With context:    feat(auth): add OAuth2 login flow'));
      console.log(chalk.dim('                   Implements social login with Google/GitHub providers'));
      console.log(chalk.dim('                   Addresses: User authentication requirements\n'));
      console.log(chalk.dim('  Without context: feat(auth): update auth files\n'));
    }

    // Only ask for team prefixes if using an external issue tracker
    if (['linear', 'jira', 'asana'].includes(issueProvider)) {
      const prefixesInput = await input({
        message: 'Team prefixes for branch parsing (comma-separated, e.g., ENG,DES,PROD):',
        default: globalConfig?.branch?.teamPrefixes?.join(',') ?? 'ENG,DES',
      });

      overrides.branch = {
        teamPrefixes: prefixesInput.split(',').map((p) => p.trim().toUpperCase()),
      };

      // Provider-specific setup hints
      if (issueProvider === 'jira') {
        console.log(chalk.dim('\nNote: Set JIRA_API_TOKEN and JIRA_USER_EMAIL in your environment.'));
        console.log(chalk.dim('You can also run "gs config set jira.baseUrl https://your-domain.atlassian.net"'));
      } else if (issueProvider === 'asana') {
        console.log(chalk.dim('\nNote: Set ASANA_ACCESS_TOKEN in your environment.'));
      } else if (issueProvider === 'linear') {
        console.log(chalk.dim('\nNote: Ensure LINEAR_API_KEY is set in your environment.'));
      }
    }
  }

  // Write local config
  if (Object.keys(overrides).length > 0) {
    await writeProjectConfig(overrides);
    logger.success('Local configuration saved to .gitshiprc.json');
  } else {
    logger.info(chalk.dim('No overrides selected. Using global config.'));
  }
}

export async function shouldRunRepoSetup(): Promise<boolean> {
  // Run if we have global config but no local config
  const hasGlobal = await hasGlobalConfig();
  const hasLocal = await hasProjectConfig();
  return hasGlobal && !hasLocal;
}
