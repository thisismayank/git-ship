export function formatCommitMessage(group, options) {
    const { conventional, includeIssueRef, issueId, allowedTypes, maxMessageLength } = options;
    if (!conventional) {
        const ref = includeIssueRef && issueId ? ` (${issueId})` : '';
        return `${group.summary}${ref}`;
    }
    // Validate type
    const type = allowedTypes.includes(group.type) ? group.type : 'chore';
    const scope = group.scope ? `(${sanitizeScope(group.scope)})` : '';
    const summary = sanitizeSummary(group.summary, maxMessageLength);
    const ref = includeIssueRef && issueId ? `\n\nRefs: ${issueId}` : '';
    return `${type}${scope}: ${summary}${ref}`;
}
export function formatAllCommitMessages(groups, options) {
    return groups.map((group) => ({
        files: group.files,
        message: formatCommitMessage(group, options),
    }));
}
function sanitizeScope(scope) {
    return scope
        .replace(/[^a-zA-Z0-9/_-]/g, '')
        .replace(/\//g, '-')
        .slice(0, 30);
}
function sanitizeSummary(summary, maxLength) {
    // Ensure lowercase first letter
    let s = summary.trim();
    if (s.length === 0)
        return 'update';
    s = s.charAt(0).toLowerCase() + s.slice(1);
    // Remove trailing period
    if (s.endsWith('.'))
        s = s.slice(0, -1);
    // Limit length
    if (s.length > maxLength)
        s = s.slice(0, maxLength - 3) + '...';
    return s;
}
//# sourceMappingURL=commit-message.js.map