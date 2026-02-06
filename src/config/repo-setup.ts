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

  // Team prefixes
  const customizeBranch = await confirm({
    message: 'Customize branch parsing settings?',
    default: false,
  });

  if (customizeBranch) {
    const prefixesInput = await input({
      message: 'Team prefixes (comma-separated, e.g., ENG,DES,PROD):',
      default: 'ENG,DES',
    });

    overrides.branch = {
      teamPrefixes: prefixesInput.split(',').map((p) => p.trim().toUpperCase()),
    };
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
