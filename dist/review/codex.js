import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
export class CodexAdapter {
    name = 'Codex';
    async isAvailable() {
        return isCommandAvailable('codex');
    }
    async runReview(baseBranch, cwd) {
        try {
            const prompt = [
                'Review the following git diff for bugs, security issues, and code quality problems.',
                'Output findings in the format: [severity] file:line - message',
                'Severity levels: critical, warning, info',
                `Compare against branch: ${baseBranch}`,
            ].join('\n');
            const { stdout } = await exec('codex', ['exec', prompt], { cwd, timeout: 180_000 });
            return this.parseOutput(stdout);
        }
        catch (error) {
            throw new ReviewError('codex', `Codex review failed: ${error.message}`, { cause: error });
        }
    }
    parseOutput(output) {
        const findings = [];
        const lines = output.split('\n');
        for (const line of lines) {
            const match = line.match(/\[(critical|warning|info)\]\s*(.+?):(\d+)\s*[-–]\s*(.*)/i);
            if (match) {
                findings.push({
                    file: match[2],
                    line: parseInt(match[3], 10),
                    severity: match[1].toLowerCase(),
                    message: match[4],
                });
            }
        }
        const hasCritical = findings.some((f) => f.severity === 'critical');
        return {
            passed: !hasCritical,
            summary: findings.length === 0 ? 'No issues found' : `Found ${findings.length} issue(s)`,
            findings,
        };
    }
}
//# sourceMappingURL=codex.js.map