import { select, input, password, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import {
  hasGlobalConfig,
  writeGlobalConfig,
  addApiKeyToShellProfile,
  getShellProfilePath,
  type GlobalConfig,
} from './global.js';
import { logger } from '../utils/logger.js';
import { withSpinner } from '../ui/spinner.js';

export interface SetupResult {
  config: Partial<GlobalConfig>;
  apiKeysAdded: string[];
}

type ApiKeyAction = 'use' | 'update' | 'add';

async function promptApiKey(
  keyName: string,
  apiKeysAdded: string[],
  options: { required?: boolean; description?: string } = {},
): Promise<{ action: ApiKeyAction; keyAdded: boolean }> {
  const existingKey = process.env[keyName];
  const maskedKey = existingKey ? `${existingKey.slice(0, 4)}...${existingKey.slice(-4)}` : null;

  if (existingKey) {
    const action = await select<ApiKeyAction>({
      message: `${keyName} found in environment (${maskedKey}). What would you like to do?`,
      choices: [
        { name: 'Use existing key', value: 'use' },
        { name: 'Update with new key', value: 'update' },
      ],
    });

    if (action === 'use') {
      return { action: 'use', keyAdded: false };
    }

    // Update the key
    const newKey = await password({
      message: `Enter new ${keyName}:`,
      mask: '*',
    });

    if (newKey.trim()) {
      const result = await addApiKeyToShellProfile(keyName, newKey.trim());
      if (result.success) {
        apiKeysAdded.push(keyName);
        logger.success(`Updated ${keyName} in ${result.profilePath}`);
        return { action: 'update', keyAdded: true };
      } else {
        logger.warn(`Could not update ${keyName} in shell profile.`);
      }
    }
    return { action: 'update', keyAdded: false };
  }

  // Key doesn't exist
  if (options.description) {
    logger.info(chalk.dim(options.description));
  }

  const apiKey = await password({
    message: `Enter your ${keyName}:`,
    mask: '*',
  });

  if (apiKey.trim()) {
    const result = await addApiKeyToShellProfile(keyName, apiKey.trim());
    if (result.success) {
      apiKeysAdded.push(keyName);
      logger.success(`Added ${keyName} to ${result.profilePath}`);
      // Set for current session
      process.env[keyName] = apiKey.trim();
      return { action: 'add', keyAdded: true };
    } else {
      logger.warn(`Could not add ${keyName} to shell profile. Please add it manually.`);
    }
  }
  return { action: 'add', keyAdded: false };
}

function showSourceReminder(apiKeysAdded: string[]): void {
  if (apiKeysAdded.length > 0) {
    const profilePath = getShellProfilePath();
    if (profilePath) {
      logger.info('');
      logger.info(chalk.yellow.bold('Action required:'));
      logger.info(chalk.yellow(`The following keys were added/updated: ${apiKeysAdded.join(', ')}`));
      logger.info(chalk.yellow('To use them in this terminal session, run:'));
      logger.info(chalk.cyan(`  source ${profilePath}`));
      logger.info(chalk.dim('Or restart your terminal.'));
      logger.info('');
    }
  }
}

export async function runGlobalSetupWizard(): Promise<SetupResult> {
  logger.info(chalk.bold('\n Welcome to git-ship! Let\'s set up your configuration.\n'));

  const config: Partial<GlobalConfig> = {};
  const apiKeysAdded: string[] = [];

  // ─── Section 1: AI Provider ───
  logger.info(chalk.bold.blue('\n1. AI Provider Configuration\n'));

  const provider = await select({
    message: 'Which AI provider would you like to use for commit analysis?',
    choices: [
      { name: 'OpenAI (GPT-4o) - Recommended', value: 'openai' as const },
      { name: 'Anthropic (Claude)', value: 'anthropic' as const },
      { name: 'Google (Gemini)', value: 'gemini' as const },
    ],
  });

  const defaultModels: Record<string, string> = {
    openai: 'gpt-4o',
    anthropic: 'claude-sonnet-4-20250514',
    gemini: 'gemini-pro',
  };

  const model = await input({
    message: 'Which model would you like to use?',
    default: defaultModels[provider],
  });

  config.ai = { provider, model };

  // AI API Key
  const aiApiKeyNames: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GOOGLE_API_KEY',
  };
  const aiApiKeyName = aiApiKeyNames[provider];

  await promptApiKey(aiApiKeyName, apiKeysAdded);

  // ─── Section 2: Linear Integration ───
  logger.info(chalk.bold.blue('\n2. Linear Integration\n'));
  logger.info(chalk.dim('git-ship can fetch issue context from Linear to improve commit messages.\n'));

  const setupLinear = await confirm({
    message: 'Would you like to connect Linear?',
    default: true,
  });

  if (setupLinear) {
    // Transport selection first
    const linearTransport = await select({
      message: 'How would you like to connect to Linear?',
      choices: [
        {
          name: 'API Key (Recommended)',
          value: 'graphql' as const,
          description: 'Direct GraphQL API - requires LINEAR_API_KEY',
        },
        {
          name: 'MCP (Model Context Protocol)',
          value: 'mcp' as const,
          description: 'SSE-based connection - also requires LINEAR_API_KEY',
        },
      ],
    });

    config.linear = {
      transport: linearTransport,
      mcpEndpoint: 'https://mcp.linear.app/sse',
    };

    // LINEAR_API_KEY (needed for both transports)
    logger.info('');
    const linearKeyResult = await promptApiKey('LINEAR_API_KEY', apiKeysAdded, {
      description: 'Get your API key from: https://linear.app/settings/api\n(Create a "Personal API Key" with read access)\n',
    });

    // Validate Linear connection
    const linearApiKey = process.env.LINEAR_API_KEY;
    if (linearApiKey) {
      const validated = await validateLinearConnection(linearApiKey);
      if (validated) {
        logger.success('Linear connection validated successfully!');
      } else {
        logger.warn('Could not validate Linear connection. Check your API key.');
      }
    }

    // Team prefixes
    logger.info(chalk.dim('\nTeam prefixes help identify issue IDs in branch names (e.g., ENG-123, DES-456).\n'));

    const prefixesInput = await input({
      message: 'Enter your team prefixes (comma-separated):',
      default: 'ENG,DES',
      validate: (val) => {
        if (!val.trim()) return 'At least one prefix is required';
        return true;
      },
    });

    config.branch = {
      teamPrefixes: prefixesInput.split(',').map((p) => p.trim().toUpperCase()).filter(Boolean),
    };
  }

  // ─── Section 3: Code Review Tool (Optional) ───
  logger.info(chalk.bold.blue('\n3. Code Review Tool (Optional)\n'));
  logger.info(chalk.dim('Pre-push code review catches issues before they reach your PR.'));
  logger.info(chalk.dim('Note: MCP integrations are experimental - CLI fallback is used if unavailable.\n'));

  const reviewChoice = await select({
    message: 'Would you like to enable code review?',
    choices: [
      {
        name: 'Graphite Diamond (Recommended)',
        value: 'graphite' as const,
        description: 'Uses gt CLI - install with: npm i -g @withgraphite/graphite-cli',
      },
      {
        name: 'CodeRabbit',
        value: 'coderabbit' as const,
        description: 'AI-powered review - requires coderabbit CLI or API key',
      },
      {
        name: 'Codex',
        value: 'codex' as const,
        description: 'Uses your OPENAI_API_KEY - requires codex CLI',
      },
      {
        name: 'Devin',
        value: 'devin' as const,
        description: 'AI-powered review - limited access, invite-only',
      },
      {
        name: 'Skip (disable code review)',
        value: 'none' as const,
        description: 'You can enable this later in config',
      },
    ],
  });

  if (reviewChoice === 'none') {
    config.review = {
      enabled: false,
      tool: 'coderabbit',
      transport: 'cli',
      endpoints: {
        devin: 'https://mcp.devin.ai/sse',
        coderabbit: 'https://mcp.coderabbit.ai/sse',
        codex: 'http://localhost:3000/sse',
      },
    };
    logger.info(chalk.dim('Code review disabled. Use --review-tool <tool> to enable per-run.'));
  } else {
    config.review = {
      enabled: true,
      tool: reviewChoice,
      transport: 'cli', // Default to CLI, more reliable
      endpoints: {
        devin: 'https://mcp.devin.ai/sse',
        coderabbit: 'https://mcp.coderabbit.ai/sse',
        codex: 'http://localhost:3000/sse',
      },
    };

    // Only prompt for API key for CodeRabbit/Devin if user wants to set it up
    const reviewApiKeyNames: Record<string, string | null> = {
      coderabbit: 'CODERABBIT_API_KEY',
      devin: 'DEVIN_API_KEY',
      codex: null, // Uses OPENAI_API_KEY
      graphite: null, // Uses CLI only
    };
    const reviewApiKeyName = reviewApiKeyNames[reviewChoice];

    if (reviewApiKeyName && !process.env[reviewApiKeyName]) {
      const wantApiKey = await confirm({
        message: `Do you have a ${reviewApiKeyName}? (Optional - CLI fallback will be used if not set)`,
        default: false,
      });

      if (wantApiKey) {
        const reviewApiKey = await password({
          message: `Enter your ${reviewApiKeyName}:`,
          mask: '*',
        });

        if (reviewApiKey.trim()) {
          const result = await addApiKeyToShellProfile(reviewApiKeyName, reviewApiKey.trim());
          if (result.success) {
            apiKeysAdded.push(reviewApiKeyName);
            config.review.transport = 'mcp'; // Enable MCP if they have the key
            logger.success(`Added ${reviewApiKeyName} to ${result.profilePath}`);
          } else {
            logger.warn(`Could not add ${reviewApiKeyName} to shell profile. Please add it manually.`);
          }
        }
      }
    }

    if (reviewChoice === 'graphite') {
      logger.info(chalk.dim('\nMake sure you have Graphite CLI installed: npm i -g @withgraphite/graphite-cli'));
    }
  }

  // ─── Section 4: Commit Settings ───
  logger.info(chalk.bold.blue('\n4. Commit Settings\n'));

  const maxLenInput = await input({
    message: 'Maximum commit message length (20-200):',
    default: '72',
    validate: (val) => {
      const n = parseInt(val.trim(), 10);
      if (isNaN(n) || n < 20 || n > 200) return 'Must be a number between 20 and 200';
      return true;
    },
  });
  config.commits = { maxMessageLength: parseInt(maxLenInput.trim(), 10) };

  // ─── Save Configuration ───
  await writeGlobalConfig(config);
  logger.success('\nGlobal configuration saved!');

  // Show source reminder if API keys were added/updated
  showSourceReminder(apiKeysAdded);

  return { config, apiKeysAdded };
}

async function validateLinearConnection(apiKey: string): Promise<boolean> {
  try {
    // Dynamic import to avoid circular dependencies
    const { LinearClient } = await import('@linear/sdk');
    const client = new LinearClient({ apiKey });

    // Try to fetch the current user - simplest validation
    const viewer = await withSpinner('Validating Linear connection', async () => {
      return await client.viewer;
    });

    if (viewer?.id) {
      logger.info(chalk.dim(`Connected as: ${viewer.name || viewer.email}`));
      return true;
    }
    return false;
  } catch (error) {
    logger.debug(`Linear validation error: ${(error as Error).message}`);
    return false;
  }
}

export async function shouldRunGlobalSetup(): Promise<boolean> {
  return !(await hasGlobalConfig());
}
