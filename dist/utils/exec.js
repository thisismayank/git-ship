import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
export async function exec(command, args, options) {
    const timeout = options?.timeout ?? 30_000;
    const { stdout, stderr } = await execFileAsync(command, args, {
        cwd: options?.cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024,
    });
    return { stdout, stderr };
}
export async function isCommandAvailable(command) {
    try {
        await execFileAsync('which', [command]);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=exec.js.map