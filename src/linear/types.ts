export interface LinearIssue {
  id: string;
  identifier: string; // e.g., "ENG-123"
  title: string;
  description: string | null;
  state: string;
  labels: string[];
  priority: number;
  url: string;
}

export interface LinearClient {
  getIssue(issueId: string): Promise<LinearIssue | null>;
}
