export class GitShipError extends Error {
    suggestion;
    constructor(message, options) {
        super(message, { cause: options?.cause });
        this.name = 'GitShipError';
        this.suggestion = options?.suggestion;
    }
}
export class LinearError extends GitShipError {
    constructor(message, options) {
        super(message, {
            suggestion: 'Check your LINEAR_API_KEY env var and network connection.',
            ...options,
        });
        this.name = 'LinearError';
    }
}
export class AIError extends GitShipError {
    constructor(message, options) {
        super(message, {
            suggestion: 'Check your OPENAI_API_KEY or ANTHROPIC_API_KEY env var.',
            ...options,
        });
        this.name = 'AIError';
    }
}
export class ReviewError extends GitShipError {
    constructor(tool, message, options) {
        super(message, {
            suggestion: `Ensure "${tool}" is installed and available in your PATH.`,
            ...options,
        });
        this.name = 'ReviewError';
    }
}
export class GitError extends GitShipError {
    constructor(message, options) {
        super(message, {
            suggestion: options?.suggestion ?? 'Check your git configuration and repository state.',
            ...options,
        });
        this.name = 'GitError';
    }
}
//# sourceMappingURL=errors.js.map