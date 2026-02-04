export async function runReview(adapter, baseBranch, cwd) {
    const available = await adapter.isAvailable();
    if (!available) {
        return {
            passed: true,
            summary: `${adapter.name} is not installed. Skipping review.`,
            findings: [],
        };
    }
    return adapter.runReview(baseBranch, cwd);
}
export function hasCriticalFindings(result) {
    return result.findings.some((f) => f.severity === 'critical');
}
export function hasWarnings(result) {
    return result.findings.some((f) => f.severity === 'warning');
}
//# sourceMappingURL=runner.js.map