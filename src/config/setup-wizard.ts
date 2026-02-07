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

// ─── Provider Setup Functions ───

async function setupLinearProvider(
  config: Partial<GlobalConfig>,
  apiKeysAdded: string[],
): Promise<void> {
  // Transport selection
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

  // LINEAR_API_KEY
  logger.info('');
  await promptApiKey('LINEAR_API_KEY', apiKeysAdded, {
    description: 'Get your API key from: https://linear.app/settings/api\n(Create a "Personal API Key" with read access)\n',
  });

  // Validate connection
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

async function setupJiraProvider(
  config: Partial<GlobalConfig>,
  apiKeysAdded: string[],
): Promise<void> {
  logger.info(chalk.yellow('\n⚠ Jira integration is experimental and may not work with all configurations.\n'));

  // Jira base URL
  const baseUrl = await input({
    message: 'Enter your Jira instance URL:',
    default: 'https://yourcompany.atlassian.net',
    validate: (val) => {
      try {
        new URL(val.trim());
        return true;
      } catch {
        return 'Please enter a valid URL';
      }
    },
  });

  // Project key (optional)
  const projectKey = await input({
    message: 'Enter your default project key (optional, e.g., PROJ):',
    default: '',
  });

  config.jira = {
    baseUrl: baseUrl.trim(),
    projectKey: projectKey.trim() || undefined,
  };

  // JIRA_EMAIL
  logger.info('');
  logger.info(chalk.dim('Jira requires your email and an API token for authentication.\n'));

  const jiraEmail = await input({
    message: 'Enter your Jira account email:',
    validate: (val) => val.trim().includes('@') ? true : 'Please enter a valid email',
  });

  if (jiraEmail.trim()) {
    const result = await addApiKeyToShellProfile('JIRA_EMAIL', jiraEmail.trim());
    if (result.success) {
      apiKeysAdded.push('JIRA_EMAIL');
      process.env.JIRA_EMAIL = jiraEmail.trim();
      logger.success(`Added JIRA_EMAIL to ${result.profilePath}`);
    }
  }

  // JIRA_API_TOKEN
  await promptApiKey('JIRA_API_TOKEN', apiKeysAdded, {
    description: 'Get your API token from: https://id.atlassian.com/manage-profile/security/api-tokens\n',
  });

  // Team prefixes for branch parsing
  logger.info(chalk.dim('\nProject prefixes help identify issue IDs in branch names (e.g., PROJ-123).\n'));

  const prefixesInput = await input({
    message: 'Enter your project prefixes (comma-separated):',
    default: projectKey || 'PROJ',
    validate: (val) => {
      if (!val.trim()) return 'At least one prefix is required';
      return true;
    },
  });

  config.branch = {
    teamPrefixes: prefixesInput.split(',').map((p) => p.trim().toUpperCase()).filter(Boolean),
  };
}

async function setupAsanaProvider(
  config: Partial<GlobalConfig>,
  apiKeysAdded: string[],
): Promise<void> {
  logger.info(chalk.yellow('\n⚠ Asana integration is experimental.\n'));
  logger.info(chalk.dim('Note: Asana uses task GIDs as identifiers. You\'ll need to include'));
  logger.info(chalk.dim('the task GID in your branch name (e.g., feat/1234567890123-task-name).\n'));

  // ASANA_ACCESS_TOKEN
  await promptApiKey('ASANA_ACCESS_TOKEN', apiKeysAdded, {
    description: 'Get your Personal Access Token from: https://app.asana.com/0/my-apps\n(Click "Create new token" under Personal access tokens)\n',
  });

  // Since Asana uses numeric GIDs, we don't need team prefixes
  // But we'll set an empty array to indicate this
  config.branch = {
    teamPrefixes: [],
  };

  logger.info(chalk.dim('\nAsana task GIDs are numeric (e.g., 1234567890123).'));
  logger.info(chalk.dim('Include the GID in your branch name for automatic detection.\n'));
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

  // ─── Section 2: Issue Tracker Integration ───
  logger.info(chalk.bold.blue('\n2. Issue Tracker Integration\n'));
  logger.info(chalk.dim('git-ship uses issue/ticket context to create better commit messages.\n'));

  const issueTrackerProvider = await select({
    message: 'How would you like to provide issue context?',
    choices: [
      {
        name: 'Linear (Recommended)',
        value: 'linear' as const,
        description: 'Automatically fetch issue details from Linear',
      },
      {
        name: 'Jira (Experimental)',
        value: 'jira' as const,
        description: 'Fetch issue details from Jira - requires setup',
      },
      {
        name: 'Asana (Experimental)',
        value: 'asana' as const,
        description: 'Fetch task details from Asana - requires setup',
      },
      {
        name: 'Plain Text',
        value: 'plain' as const,
        description: 'Manually enter requirements each time you commit',
      },
      {
        name: 'None',
        value: 'none' as const,
        description: 'Skip issue context - commits based on diffs only',
      },
    ],
  });

  config.issueTracker = { provider: issueTrackerProvider };

  // Provider-specific setup
  if (issueTrackerProvider === 'linear') {
    await setupLinearProvider(config, apiKeysAdded);
  } else if (issueTrackerProvider === 'jira') {
    await setupJiraProvider(config, apiKeysAdded);
  } else if (issueTrackerProvider === 'asana') {
    await setupAsanaProvider(config, apiKeysAdded);
  } else if (issueTrackerProvider === 'plain') {
    logger.info(chalk.dim('\nYou\'ll be prompted to enter requirements when running git-ship.'));
    logger.info(chalk.dim('This context helps the AI understand what you\'re working on.\n'));
  } else {
    // "none" selected - show warning about basic commits
    logger.info('');
    logger.warn(chalk.yellow.bold('Without issue context, commit messages will be basic and generic.'));
    logger.info('');
    logger.info(chalk.dim('Example commits without context:'));
    logger.info(chalk.dim('  • feat(src): feat changes in src'));
    logger.info(chalk.dim('  • chore(root): chore changes in root'));
    logger.info(chalk.dim('  • fix(components): fix changes in components'));
    logger.info('');
    logger.info(chalk.dim('Example commits WITH context (Linear/Jira/Plain Text):'));
    logger.info(chalk.dim('  • feat(auth): add OAuth2 login flow with Google provider'));
    logger.info(chalk.dim('  • fix(cart): resolve race condition in quantity update'));
    logger.info(chalk.dim('  • refactor(api): extract validation logic to middleware'));
    logger.info('');
    logger.info(chalk.dim('You can change this later by running: gs --setup'));
    logger.info('');
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

  logger.info(chalk.dim('Commit messages have three parts:'));
  logger.info(chalk.dim('  • Header: Short summary (limited length), shown in git log'));
  logger.info(chalk.dim('  • Body: Detailed explanation of what changed'));
  logger.info(chalk.dim('  • Footer: Links commit to requirements/issue\n'));

  logger.info(chalk.dim('Example:'));
  logger.info(chalk.dim('  ┌──────────────────────────────────────────────────────────────┐'));
  logger.info(chalk.dim('  │ feat(auth): add OAuth2 login with Google provider            │ ← Header'));
  logger.info(chalk.dim('  │                                                              │'));
  logger.info(chalk.dim('  │ Implement Google OAuth2 authentication:                      │'));
  logger.info(chalk.dim('  │ - Add OAuth2 callback handler                                │ ← Body'));
  logger.info(chalk.dim('  │ - Store tokens securely in session                           │'));
  logger.info(chalk.dim('  │ - Add logout endpoint to revoke tokens                       │'));
  logger.info(chalk.dim('  │                                                              │'));
  logger.info(chalk.dim('  │ Addresses: "Users should be able to log in with Google"      │ ← Footer'));
  logger.info(chalk.dim('  │ Refs: ENG-123                                                │'));
  logger.info(chalk.dim('  └──────────────────────────────────────────────────────────────┘\n'));

  const maxLenInput = await input({
    message: 'Maximum commit header length (20-200):',
    default: '72',
    validate: (val) => {
      const n = parseInt(val.trim(), 10);
      if (isNaN(n) || n < 20 || n > 200) return 'Must be a number between 20 and 200';
      return true;
    },
  });
  config.commits = { maxMessageLength: parseInt(maxLenInput.trim(), 10) };

  logger.info(chalk.dim('\nThe body has no length limit and will include detailed context.'));

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
