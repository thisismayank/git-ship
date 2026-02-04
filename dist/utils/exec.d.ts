export interface ExecResult {
    stdout: string;
    stderr: string;
}
export declare function exec(command: string, args: string[], options?: {
    cwd?: string;
    timeout?: number;
}): Promise<ExecResult>;
export declare function isCommandAvailable(command: string): Promise<boolean>;
//# sourceMappingURL=exec.d.ts.map