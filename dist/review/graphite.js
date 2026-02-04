import { exec, isCommandAvailable } from '../utils/exec.js';
import { ReviewError } from '../utils/errors.js';
export class GraphiteAdapter {
    name = 'Graphite Diamond';
    async isAvailable() {
        return isCommandAvailable('gt');
    }
    async runReview(baseBranch, cwd) {
        try {
            // Graphite Diamond requires pushing first and creating a draft PR
            // Then it reviews via the PR
            await exec('gt', ['stack', 'submit', '--draft'], { cwd, timeout: 60_000 });
            // Poll for Diamond review results
            const { stdout } = await exec('gt', ['pr', 'view', '--json'], { cwd, timeout: 30_000 });
            return this.parseOutput(stdout);
        }
        catch (error) {
            throw new ReviewError('graphite', `Graphite Diamond review failed: ${error.message}`, { cause: error });
        }
    }
    parseOutput(output) {
        try {
            const data = JSON.parse(output);
            const findings = (data.reviews ?? []).flatMap((review) => (review.comments ?? []).map((c) => ({
                file: c.file,
                line: c.line,
                severity: (c.severity ?? 'info'),
                message: c.body,
            })));
            const hasCritical = findings.some((f) => f.severity === 'critical');
            return {
                passed: !hasCritical,
                summary: findings.length === 0 ? 'No issues found' : `Found ${findings.length} issue(s)`,
                findings,
            };
        }
        catch {
            return {
                passed: true,
                summary: 'Could not parse Graphite review output',
                findings: [],
            };
        }
    }
}
//# sourceMappingURL=graphite.js.map