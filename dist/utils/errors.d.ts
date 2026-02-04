export declare class GitShipError extends Error {
    readonly suggestion?: string;
    constructor(message: string, options?: {
        suggestion?: string;
        cause?: unknown;
    });
}
export declare class LinearError extends GitShipError {
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
export declare class AIError extends GitShipError {
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
export declare class ReviewError extends GitShipError {
    constructor(tool: string, message: string, options?: {
        cause?: unknown;
    });
}
export declare class GitError extends GitShipError {
    constructor(message: string, options?: {
        suggestion?: string;
        cause?: unknown;
    });
}
//# sourceMappingURL=errors.d.ts.map