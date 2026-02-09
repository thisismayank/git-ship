export class GitShipError extends Error {
  public readonly suggestion?: string;

  constructor(message: string, options?: { suggestion?: string; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'GitShipError';
    this.suggestion = options?.suggestion;
  }
}

export class LinearError extends GitShipError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, {
      suggestion: 'Check your LINEAR_API_KEY env var and network connection.',
      ...options,
    });
    this.name = 'LinearError';
  }
}

export class AIError extends GitShipError {
  constructor(message: string, options?: { suggestion?: string; cause?: unknown }) {
    super(message, {
      suggestion: options?.suggestion ?? 'Check your OPENAI_API_KEY or ANTHROPIC_API_KEY env var.',
      cause: options?.cause,
    });
    this.name = 'AIError';
  }
}

export class ReviewError extends GitShipError {
  constructor(tool: string, message: string, options?: { cause?: unknown }) {
    super(message, {
      suggestion: `Ensure "${tool}" is installed and available in your PATH.`,
      ...options,
    });
    this.name = 'ReviewError';
  }
}

export class GitError extends GitShipError {
  constructor(message: string, options?: { suggestion?: string; cause?: unknown }) {
    super(message, {
      suggestion: options?.suggestion ?? 'Check your git configuration and repository state.',
      ...options,
    });
    this.name = 'GitError';
  }
}
