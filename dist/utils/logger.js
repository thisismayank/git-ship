import chalk from 'chalk';
let currentLevel = 'info';
const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
export function setLogLevel(level) {
    currentLevel = level;
}
function shouldLog(level) {
    return levels[level] >= levels[currentLevel];
}
export const logger = {
    debug(...args) {
        if (shouldLog('debug')) {
            console.debug(chalk.gray('[debug]'), ...args);
        }
    },
    info(...args) {
        if (shouldLog('info')) {
            console.log(...args);
        }
    },
    warn(...args) {
        if (shouldLog('warn')) {
            console.warn(chalk.yellow('⚠'), ...args);
        }
    },
    error(...args) {
        if (shouldLog('error')) {
            console.error(chalk.red('✖'), ...args);
        }
    },
    step(stepNum, total, message) {
        if (shouldLog('info')) {
            console.log(chalk.cyan(`[${stepNum}/${total}]`), message);
        }
    },
    success(message) {
        if (shouldLog('info')) {
            console.log(chalk.green('✔'), message);
        }
    },
};
//# sourceMappingURL=logger.js.map