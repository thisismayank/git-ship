<p align="center">
  <h1 align="center">git-ship</h1>
  <p align="center">
    AI-powered git workflow that turns your messy changes into clean, grouped, conventional commits — then reviews and pushes them.
    <br />
    One command: <code>git-ship</code>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/git-ship"><img src="https://img.shields.io/npm/v/git-ship.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/git-ship"><img src="https://img.shields.io/npm/dm/git-ship.svg" alt="npm downloads" /></a>
  <a href="https://github.com/thisismayank/git-ship/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/git-ship.svg" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-blue.svg" alt="node >= 18" />
</p>

---

Stop writing commit messages. `git-ship` reads your diffs, groups related changes into logical commits, writes conventional commit messages using AI, runs a code review, and pushes — all in one command.

## Why I Built This

Every developer knows the routine: you’ve been heads-down on a feature for hours, touching fifteen files across four concerns. Now it’s time to commit. You stare at `git diff --stat`, mentally sort files into groups, write conventional commit messages, stage carefully, and hope you didn’t mix a migration with a test change. Then you do it again for the next group. And the next.

Most of the time, you give up and write `git commit -am "update stuff"`. The commit history turns into noise. When someone needs to bisect a bug or review what changed, the history is useless.

I built **git-ship** because the commit–review–push workflow felt like it should be one step. The AI is good at reading diffs and understanding which changes belong together. The branch name already tells you what you’re working on. The review tool is already installed. Why am I the glue between all of these?

Now I run `gs`, review the plan, and hit enter. Clean history, every time.

<p align="center">
  <img src="docs/screenshots/git-ship.png" alt="git-ship in action" width="700" />
</p>

## How It Works

```
$ git-ship

[1/7] Detect branch        → parse issue ID from branch name (e.g., feat/ENG-123-...)
[2/7] Fetch Linear context  → pull issue title, description, labels
[3/7] Collect changes       → structured diffs for all changed files
[4/7] Group into commits    → heuristic pre-group, then AI refines using diffs + context
[5/7] Review commit plan    → accept / edit messages / regroup / cancel
[6/7] Code review           → CodeRabbit, Devin, Codex, or Graphite
[7/7] Push to remote
```

You stay in control. Every step is interactive — review the plan, edit messages, regroup files, or cancel at any point.

## Install

```bash
npm install -g git-ship
```

## Usage

```bash
git-ship              # Full interactive flow
gs                    # Shorthand alias
git-ship --dry-run    # Preview commit plan without executing
git-ship --no-review  # Skip code review
git-ship --issue ENG-123  # Manually specify Linear issue
```

| Flag                   | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `-d, --dry-run`        | Show commit plan without executing                                |
| `-v, --verbose`        | Enable debug logging                                              |
| `--review-tool <tool>` | Override review tool (`coderabbit`, `devin`, `codex`, `graphite`) |
| `--no-review`          | Skip code review                                                  |
| `-i, --issue <id>`     | Manually specify Linear issue ID                                  |

## What Makes It Different

|                          |                                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **AI commit grouping**   | Groups changed files into logical commits using OpenAI, Anthropic, or Gemini — with heuristic fallback if AI is unavailable |
| **Linear integration**   | Parses issue IDs from branch names, fetches context, and adds refs to commit messages automatically                         |
| **Code review gate**     | Runs CodeRabbit, Devin, Codex, or Graphite before pushing. Critical findings block the push.                                |
| **Conventional commits** | Enforces type, scope, imperative mood, configurable length — no more inconsistent commit history                            |
| **Smart file filtering** | Automatically ignores `node_modules`, `.env*`, `dist`, `.DS_Store` — configurable via `ignorePatterns`                      |
| **First-run setup**      | Prompts for preferences on first run and saves to `.gitshiprc.json` — no manual config needed                               |

## Commit Grouping

Files are grouped using a two-pass approach:

**Pass 1 — Heuristic pre-grouping** by file path:

| Pattern                   | Category             |
| ------------------------- | -------------------- |
| `*.test.ts`, `tests/`     | `test`               |
| `*.md`, `docs/`           | `docs`               |
| `Dockerfile`, `.github/`  | `ci-infra`           |
| `package.json`, lockfiles | `deps`               |
| `migrations/`             | `migration`          |
| Source files              | Grouped by directory |

**Pass 2 — AI semantic refinement** — the LLM refines groups using diff content and Linear issue context, producing structured JSON with type, scope, summary, and rationale per group.

If AI is unavailable, heuristic groups are used directly.

## Code Review

| Tool       | Command                     | Type       |
| ---------- | --------------------------- | ---------- |
| CodeRabbit | `coderabbit review --plain` | Local      |
| Devin      | `npx devin-review`          | Local      |
| Codex      | `codex exec`                | Local      |
| Graphite   | `gt stack submit --draft`   | Push-based |

Findings are normalized with severity levels (`critical`, `warning`, `info`). Critical findings block the push by default.

## Configuration

Create a `.gitshiprc.json` in your project root, or use `gitship.config.js`, or a `"gitship"` key in `package.json`. On first run, if no config exists, git-ship prompts for preferences and creates one automatically.

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-4o"
  },
  "linear": {
    "transport": "graphql"
  },
  "review": {
    "enabled": true,
    "tool": "coderabbit"
  },
  "commits": {
    "conventional": true,
    "allowedTypes": [
      "feat",
      "fix",
      "chore",
      "docs",
      "refactor",
      "test",
      "ci",
      "build",
      "perf"
    ],
    "includeIssueRef": true,
    "maxMessageLength": 72
  },
  "ignorePatterns": ["node_modules/**", ".env*", "dist/**", ".DS_Store"],
  "branch": {
    "teamPrefixes": ["ENG", "DES"]
  }
}
```

### Environment Variables

git-ship loads `.env` from your project root automatically, so you can set API keys there instead of exporting them.

```env
# .env
OPENAI_API_KEY=sk-...
GITSHIP_AI_PROVIDER=anthropic
GITSHIP_AI_MODEL=claude-sonnet-4-20250514
```

**API keys:**

| Variable            | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `LINEAR_API_KEY`    | Linear workspace API key                              |
| `OPENAI_API_KEY`    | OpenAI API key                                        |
| `ANTHROPIC_API_KEY` | Anthropic API key                                     |
| `GEMINI_API_KEY`    | Google Gemini API key (also accepts `GOOGLE_API_KEY`) |

**Config overrides:**

| Variable                    | Values                                                       |
| --------------------------- | ------------------------------------------------------------ |
| `GITSHIP_AI_PROVIDER`       | `openai`, `anthropic`, `gemini`                              |
| `GITSHIP_AI_MODEL`          | Any model string (e.g. `gpt-4o`, `claude-sonnet-4-20250514`) |
| `GITSHIP_LINEAR_TRANSPORT`  | `graphql`, `mcp`                                             |
| `GITSHIP_REVIEW_TOOL`       | `coderabbit`, `devin`, `codex`, `graphite`                   |
| `GITSHIP_REVIEW_ENABLED`    | `true`, `false`                                              |
| `GITSHIP_COMMIT_MAX_LENGTH` | `20` – `200`                                                 |

## Graceful Degradation

git-ship is designed to work even when things fail:

| Failure             | Behavior                              |
| ------------------- | ------------------------------------- |
| Linear unreachable  | Warns, proceeds without issue context |
| AI provider fails   | Falls back to heuristic-only grouping |
| Review tool missing | Warns, offers to skip                 |
| Push rejected       | Shows error with suggested fix        |
| No changes          | Clean exit with info message          |

## Requirements

- Node.js >= 18
- Git

## License

MIT
