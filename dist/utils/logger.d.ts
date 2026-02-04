export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export declare function setLogLevel(level: LogLevel): void;
export declare const logger: {
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
    step(stepNum: number, total: number, message: string): void;
    success(message: string): void;
};
//# sourceMappingURL=logger.d.ts.map