import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
export class CodeRabbitAdapter {
    name = 'CodeRabbit';
    async isAvailable() {
        return isCommandAvailable('coderabbit');
    }
    async runReview(baseBranch, cwd) {
        try {
            const { stdout } = await exec('npx', ['coderabbit', 'review', '--plain', '--type', 'uncommitted'], { cwd, timeout: 120_000 });
            return this.parseOutput(stdout);
        }
        catch (error) {
            throw new ReviewError('coderabbit', `CodeRabbit review failed: ${error.message}`, { cause: error });
        }
    }
    parseOutput(output) {
        const findings = [];
        const lines = output.split('\n');
        for (const line of lines) {
            // Parse common review output patterns
            const criticalMatch = line.match(/\[critical\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i);
            const warningMatch = line.match(/\[warning\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i);
            const infoMatch = line.match(/\[info\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i);
            if (criticalMatch) {
                findings.push({
                    file: criticalMatch[1],
                    line: criticalMatch[2] ? parseInt(criticalMatch[2], 10) : undefined,
                    severity: 'critical',
                    message: criticalMatch[3],
                });
            }
            else if (warningMatch) {
                findings.push({
                    file: warningMatch[1],
                    line: warningMatch[2] ? parseInt(warningMatch[2], 10) : undefined,
                    severity: 'warning',
                    message: warningMatch[3],
                });
            }
            else if (infoMatch) {
                findings.push({
                    file: infoMatch[1],
                    line: infoMatch[2] ? parseInt(infoMatch[2], 10) : undefined,
                    severity: 'info',
                    message: infoMatch[3],
                });
            }
        }
        const hasCritical = findings.some((f) => f.severity === 'critical');
        return {
            passed: !hasCritical && findings.filter((f) => f.severity === 'warning').length === 0,
            summary: findings.length === 0
                ? 'No issues found'
                : `Found ${findings.length} issue(s)`,
            findings,
        };
    }
}
//# sourceMappingURL=coderabbit.js.map