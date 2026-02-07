export interface PRContext {
  title: string;
  body: string;
  baseBranch: string;
  headBranch: string;
  isDraft: boolean;
}

export interface PRResult {
  success: boolean;
  url?: string;
  number?: number;
  error?: string;
}

export interface PRAdapter {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  getDefaultBaseBranch(): Promise<string>;
  createPR(context: PRContext): Promise<PRResult>;
  getRepoUrl(): Promise<string | null>;
}
