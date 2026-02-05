import { type GitShipConfig } from './schema.js';
export declare function loadConfig(cwd?: string): Promise<GitShipConfig>;
export declare function hasProjectConfig(cwd?: string): Promise<boolean>;
export declare function writeProjectConfig(partial: Record<string, unknown>, cwd?: string): Promise<void>;
//# sourceMappingURL=loader.d.ts.map