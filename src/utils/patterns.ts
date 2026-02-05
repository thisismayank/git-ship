/**
 * Matches a file path against a single ignore pattern.
 *
 * Supported pattern types:
 *   - `dir/**`   — matches any path starting with `dir/`
 *   - `prefix*`  — matches any path starting with `prefix`
 *   - `exact`    — exact string match against the full path or basename
 */
function matchesIgnorePattern(filePath: string, pattern: string): boolean {
  // dir/** — anything under that directory
  if (pattern.endsWith('/**')) {
    const dir = pattern.slice(0, -3); // strip /**
    return filePath.startsWith(dir + '/') || filePath === dir;
  }

  // prefix* — anything starting with the prefix (e.g. .env*)
  if (pattern.endsWith('*') && !pattern.includes('/')) {
    const prefix = pattern.slice(0, -1);
    const basename = filePath.split('/').pop() ?? filePath;
    return basename.startsWith(prefix);
  }

  // Exact match against full path or basename
  const basename = filePath.split('/').pop() ?? filePath;
  return filePath === pattern || basename === pattern;
}

export function matchesAnyPattern(filePath: string, patterns: string[]): boolean {
  return patterns.some((p) => matchesIgnorePattern(filePath, p));
}
