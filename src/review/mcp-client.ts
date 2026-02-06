import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { ReviewResult, ReviewFinding } from './runner.js';
import { ReviewError } from '../utils/errors.js';

export interface MCPReviewClient {
  isConnected(): Promise<boolean>;
  runReview(baseBranch: string, cwd?: string): Promise<ReviewResult>;
  disconnect(): Promise<void>;
}

export interface MCPReviewClientOptions {
  endpoint: string;
  apiKey: string;
  toolName: string;
  serviceName: string;
}

export function createMCPReviewClient(options: MCPReviewClientOptions): MCPReviewClient {
  const { endpoint, apiKey, toolName, serviceName } = options;
  let client: Client | null = null;
  let connectionFailed = false;

  async function getClient(): Promise<Client> {
    if (client) return client;

    client = new Client(
      { name: 'git-ship', version: '0.1.0' },
      { capabilities: {} },
    );

    const url = new URL(endpoint);
    url.searchParams.set('apiKey', apiKey);

    const transport = new SSEClientTransport(url);
    await client.connect(transport);

    return client;
  }

  return {
    async isConnected(): Promise<boolean> {
      if (connectionFailed) return false;

      try {
        await getClient();
        return true;
      } catch {
        connectionFailed = true;
        return false;
      }
    },

    async runReview(baseBranch: string, cwd?: string): Promise<ReviewResult> {
      try {
        const c = await getClient();

        const result = await c.callTool({
          name: toolName,
          arguments: {
            baseBranch,
            cwd: cwd ?? process.cwd(),
          },
        });

        if (!result.content || (result.content as Array<{ type: string; text?: string }>).length === 0) {
          return {
            passed: true,
            summary: 'No review results returned',
            findings: [],
          };
        }

        const textContent = (result.content as Array<{ type: string; text?: string }>).find(
          (c) => c.type === 'text',
        );

        if (!textContent?.text) {
          return {
            passed: true,
            summary: 'Empty review response',
            findings: [],
          };
        }

        return parseReviewResponse(textContent.text);
      } catch (error) {
        throw new ReviewError(
          serviceName.toLowerCase(),
          `${serviceName} MCP review failed: ${(error as Error).message}`,
          { cause: error },
        );
      }
    },

    async disconnect(): Promise<void> {
      if (client) {
        await client.close();
        client = null;
      }
    },
  };
}

function parseReviewResponse(text: string): ReviewResult {
  try {
    // Try to parse as JSON first
    const data = JSON.parse(text) as {
      passed?: boolean;
      summary?: string;
      findings?: Array<{
        file: string;
        line?: number;
        severity: string;
        message: string;
        suggestion?: string;
      }>;
    };

    const findings: ReviewFinding[] = (data.findings ?? []).map((f) => ({
      file: f.file,
      line: f.line,
      severity: normalizeSeverity(f.severity),
      message: f.message,
      suggestion: f.suggestion,
    }));

    const hasCritical = findings.some((f) => f.severity === 'critical');

    return {
      passed: data.passed ?? !hasCritical,
      summary: data.summary ?? (findings.length === 0 ? 'No issues found' : `Found ${findings.length} issue(s)`),
      findings,
    };
  } catch {
    // Fallback: parse as plain text
    return parseTextResponse(text);
  }
}

function parseTextResponse(text: string): ReviewResult {
  const findings: ReviewFinding[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Try common formats
    const patterns = [
      // [severity] file:line - message
      /\[(critical|warning|info|error)\]\s*(.+?):(\d+)?\s*[-–]\s*(.*)/i,
      // severity: message @ file:line
      /(critical|error|warning|info):\s*(.+?)\s*@\s*(.+?):(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        if (pattern.source.includes('@')) {
          // severity: message @ file:line format
          findings.push({
            file: match[3],
            line: parseInt(match[4], 10),
            severity: normalizeSeverity(match[1]),
            message: match[2],
          });
        } else {
          // [severity] file:line - message format
          findings.push({
            file: match[2],
            line: match[3] ? parseInt(match[3], 10) : undefined,
            severity: normalizeSeverity(match[1]),
            message: match[4],
          });
        }
        break;
      }
    }
  }

  const hasCritical = findings.some((f) => f.severity === 'critical');

  return {
    passed: !hasCritical,
    summary: findings.length === 0 ? 'No issues found' : `Found ${findings.length} issue(s)`,
    findings,
  };
}

function normalizeSeverity(severity: string): 'critical' | 'warning' | 'info' {
  const s = severity.toLowerCase();
  if (s === 'error' || s === 'critical') return 'critical';
  if (s === 'warning' || s === 'warn') return 'warning';
  return 'info';
}
