import { type Ora } from 'ora';
export declare function createSpinner(text: string): Ora;
export declare function withSpinner<T>(text: string, fn: () => Promise<T>): Promise<T>;
//# sourceMappingURL=spinner.d.ts.map