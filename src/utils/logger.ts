import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let currentLevel: LogLevel = 'info';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[currentLevel];
}

export const logger = {
  debug(...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.debug(chalk.gray('[debug]'), ...args);
    }
  },

  info(...args: unknown[]): void {
    if (shouldLog('info')) {
      console.log(...args);
    }
  },

  warn(...args: unknown[]): void {
    if (shouldLog('warn')) {
      console.warn(chalk.yellow('⚠'), ...args);
    }
  },

  error(...args: unknown[]): void {
    if (shouldLog('error')) {
      console.error(chalk.red('✖'), ...args);
    }
  },

  step(stepNum: number, total: number, message: string): void {
    if (shouldLog('info')) {
      console.log(chalk.cyan(`[${stepNum}/${total}]`), message);
    }
  },

  success(message: string): void {
    if (shouldLog('info')) {
      console.log(chalk.green('✔'), message);
    }
  },
};
