# git-ship

AI-powered git workflow CLI that automates `git add`, `commit`, and `push` with intelligent commit grouping, Linear issue context, and a code review gate.

## Features

- **AI-powered commit grouping** — Groups changed files into logical commits using OpenAI, Anthropic, or Gemini, with heuristic fallback
- **Linear integration** — Parses issue IDs from branch names, fetches issue context, and adds references to commit messages
- **Code review gate** — Runs CodeRabbit, Devin, Codex, or Graphite Diamond before pushing
- **Conventional commits** — Automatic formatting with type, scope, and issue refs; enforces imperative mood, lowercase start, no trailing period
- **Configurable commit message length** — Set max message length per-project (prompted on first run, saved to `.gitshiprc.json`)
- **File ignore patterns** — Automatically excludes `node_modules`, `.env*`, `dist`, and `.DS_Store` from commits
- **Interactive CLI** — Review, edit, or regroup commits before they're created
- **Dry-run mode** — Preview the commit plan without executing

## Install

```bash
npm install -g git-ship
```

## Usage

```bash
# Full interactive flow
git-ship

# Or use the alias
gs

# Preview without committing or pushing
git-ship --dry-run

# Skip code review
git-ship --no-review

# Specify issue ID manually
git-ship --issue ENG-123

# Override review tool
git-ship --review-tool devin

# Verbose output
git-ship -v
```

### CLI Options

| Flag | Description |
|------|-------------|
| `-d, --dry-run` | Show commit plan without executing |
| `-v, --verbose` | Enable debug logging |
| `--review-tool <tool>` | Override review tool (`coderabbit`, `devin`, `codex`, `graphite`) |
| `--no-review` | Skip code review step |
| `-i, --issue <id>` | Manually specify Linear issue ID |

## How It Works

```
$ git-ship

[1/7] Detect branch → parse issue ID from branch name (e.g., feat/ENG-123-...)
[2/7] Fetch Linear context (title, description, labels, state)
[3/7] Collect changed files and parse structured diffs
[4/7] Group files into logical commits:
      - Heuristic pre-group by path (tests, docs, deps, migrations, src dirs)
      - AI refines grouping using diffs + Linear context
[5/7] Display commit plan → Accept / Edit messages / Regroup / Cancel
[6/7] Run code review → display findings → Push / Fix / Cancel
[7/7] Push to remote
```

## Configuration

Create a `.gitshiprc.json` in your project root (or use `gitship.config.js`, or a `"gitship"` key in `package.json`):

```json
{
  "linear": {
    "transport": "graphql",
    "mcpEndpoint": "https://mcp.linear.app/sse"
  },
  "ai": {
    "provider": "openai",
    "model": "gpt-4o"
  },
  "review": {
    "enabled": true,
    "tool": "coderabbit"
  },
  "commits": {
    "conventional": true,
    "allowedTypes": ["feat", "fix", "chore", "docs", "style", "refactor", "test", "ci", "build", "perf"],
    "includeIssueRef": true,
    "maxMessageLength": 72
  },
  "ignorePatterns": ["node_modules/**", ".env*", "dist/**", ".DS_Store"],
  "branch": {
    "teamPrefixes": ["ENG", "DES"]
  }
}
```

On first run, if no `.gitshiprc.json` exists, git-ship will prompt you for a max commit message length and save it to `.gitshiprc.json` automatically.

### Environment Variables

git-ship loads a `.env` file from your project root automatically (via [dotenv](https://github.com/motdotla/dotenv)), so you can set API keys and config overrides there instead of exporting them in your shell.

Example `.env`:

```env
OPENAI_API_KEY=sk-...
GITSHIP_AI_PROVIDER=anthropic
GITSHIP_AI_MODEL=claude-sonnet-4-20250514
```

| Variable | Required | Description |
|----------|----------|-------------|
| `LINEAR_API_KEY` | For Linear features | Linear workspace API key |
| `OPENAI_API_KEY` | For AI grouping (OpenAI) | OpenAI API key |
| `ANTHROPIC_API_KEY` | For AI grouping (Anthropic) | Anthropic API key |
| `GEMINI_API_KEY` | For AI grouping (Gemini) | Google Gemini API key (also accepts `GOOGLE_API_KEY`) |

Config overrides via env vars:

| Variable | Values |
|----------|--------|
| `GITSHIP_AI_PROVIDER` | `openai`, `anthropic`, `gemini` |
| `GITSHIP_AI_MODEL` | Any model string (e.g. `gpt-4o`, `claude-sonnet-4-20250514`, `gemini-3-flash-preview`) |
| `GITSHIP_LINEAR_TRANSPORT` | `graphql`, `mcp` |
| `GITSHIP_REVIEW_TOOL` | `coderabbit`, `devin`, `codex`, `graphite` |
| `GITSHIP_REVIEW_ENABLED` | `true`, `false` |
| `GITSHIP_COMMIT_MAX_LENGTH` | Number between `20` and `200` (overrides `commits.maxMessageLength`) |

## Commit Grouping

Files are grouped using a two-pass approach:

**1. Heuristic pre-grouping** by file path:

| Pattern | Category |
|---------|----------|
| `*.test.ts`, `tests/` | `test` |
| `*.md`, `docs/` | `docs` |
| `Dockerfile`, `.github/` | `ci-infra` |
| `package.json`, lockfiles | `deps` |
| `migrations/` | `migration` |
| Source files | Grouped by directory |

**2. AI semantic regrouping** — The LLM refines groups using diff content and Linear issue context, returning structured JSON with type, scope, summary, and rationale per group.

If AI is unavailable, the heuristic groups are used directly.

## Code Review Adapters

| Tool | Command | Local? |
|------|---------|--------|
| CodeRabbit | `coderabbit review --plain` | Yes |
| Devin | `npx devin-review` | Yes |
| Codex | `codex exec` | Yes |
| Graphite | `gt stack submit --draft` | No (push-based) |

Review results are normalized to findings with severity levels (`critical`, `warning`, `info`). Critical findings block the push by default.

## Graceful Degradation

| Failure | Behavior |
|---------|----------|
| Linear unreachable | Warn, proceed without issue context |
| Issue not found | Warn, skip issue ref in commits |
| AI provider fails | Fall back to heuristic-only grouping |
| Review tool missing | Warn, offer to skip |
| Push rejected | Show error, suggest `git pull --rebase` |
| No changes | Clean exit with info message |
| All files ignored | Clean exit with info message |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## Project Structure

```
src/
├── cli.ts                  # Commander.js entry, 7-step orchestration
├── config/                 # cosmiconfig + Zod schema + env overrides
├── git/                    # simple-git: status, diff, commit, push
├── linear/                 # Branch parser, GraphQL + MCP clients
├── analysis/               # Heuristic grouper, AI client, message formatter
├── review/                 # ReviewAdapter interface + 4 adapters
├── ui/                     # Prompts, spinners, rich display
└── utils/                  # Logger, errors, exec wrapper
```

## Requirements

- Node.js >= 18
- Git

## License

MIT
