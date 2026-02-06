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

Every developer knows the routine: you've been heads-down on a feature for hours, touching fifteen files across four concerns. Now it's time to commit. You stare at `git diff --stat`, mentally sort files into groups, write conventional commit messages, stage carefully, and hope you didn't mix a migration with a test change. Then you do it again for the next group. And the next.

Most of the time, you give up and write `git commit -am "update stuff"`. The commit history turns into noise. When someone needs to bisect a bug or review what changed, the history is useless.

I built **git-ship** because the commit–review–push workflow felt like it should be one step. The AI is good at reading diffs and understanding which changes belong together. The branch name already tells you what you're working on. The review tool is already installed. Why am I the glue between all of these?

Now I run `gs`, review the plan, and hit enter. Clean history, every time.

<p align="center">
  <img src="docs/screenshots/git-ship-a.png" alt="git-ship in action" width="700" />
</p>

## How It Works

```
$ git-ship

[1/7] Detect branch        → parse issue ID from branch name (e.g., feat/ENG-123-...)
[2/7] Fetch Linear context  → pull issue title, description, labels
[3/7] Collect changes       → structured diffs for all changed files
[4/7] Group into commits    → heuristic pre-group, then AI refines into revertable commits
[5/7] Review commit plan    → accept / edit messages / regroup / cancel
[6/7] Code review           → CodeRabbit, Devin, Codex, or Graphite
[7/7] Push to remote
```

You stay in control. Every step is interactive — review the plan, edit messages, regroup files, or cancel at any point.

## Install

```bash
npm install -g git-ship
```

## Quick Start

On first run, git-ship launches an interactive setup wizard:

```
$ gs

Welcome to git-ship! Let's set up your configuration.

1. AI Provider Configuration
   → Choose OpenAI, Anthropic, or Gemini
   → Enter your API key (saved to shell profile)

2. Linear Integration
   → Connect Linear for issue context (optional)
   → Validate connection
   → Configure team prefixes (e.g., ENG, DES)

3. Code Review Tool (Optional)
   → Choose Graphite, CodeRabbit, Codex, Devin, or skip

4. Commit Settings
   → Max commit message length
```

Configuration is saved globally (`~/.config/gitship/config.json`) and works across all repos.

## Usage

```bash
git-ship              # Full interactive flow
gs                    # Shorthand alias
git-ship --dry-run    # Preview commit plan without executing
git-ship --no-review  # Skip code review
git-ship --issue ENG-123  # Manually specify Linear issue
git-ship --setup      # Re-run setup wizard to update configuration
git-ship --help       # Show all available commands
git-ship --readme     # Display full documentation
```

| Flag                   | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `-h, --help`           | Show all available commands with descriptions                     |
| `-d, --dry-run`        | Show commit plan without executing                                |
| `-v, --verbose`        | Enable debug logging                                              |
| `--review-tool <tool>` | Override review tool (`coderabbit`, `devin`, `codex`, `graphite`) |
| `--no-review`          | Skip code review                                                  |
| `-i, --issue <id>`     | Manually specify Linear issue ID                                  |
| `--setup`              | Re-run setup wizard to update API keys or configuration           |
| `--readme`             | Display the full README documentation in terminal                 |

## What Makes It Different

|                           |                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **AI commit grouping**    | Produces small, reviewer-friendly commits that are each safe to revert — powered by OpenAI, Anthropic, or Gemini with heuristic fallback |
| **Linear integration**    | Parses issue IDs from branch names, fetches context, and adds refs to commit messages automatically                                      |
| **Code review gate**      | Runs CodeRabbit, Devin, Codex, or Graphite before pushing. Critical findings block the push.                                             |
| **Conventional commits**  | Enforces type, scope, imperative mood, configurable length — no more inconsistent commit history                                         |
| **Smart file filtering**  | Automatically ignores `node_modules`, `.env*`, `dist`, `.DS_Store`, `.gitshiprc.json` — configurable via `ignorePatterns`                |
| **Global + local config** | One-time setup works across all repos; override per-repo when needed                                                                     |

## Branch Parsing

git-ship detects Linear issue IDs from branch names with flexible matching:

| Branch Name                        | Detected Issue | Confidence |
| ---------------------------------- | -------------- | ---------- |
| `feat/ENG-123-user-auth`           | `ENG-123`      | High       |
| `fix/eng-456`                      | `ENG-456`      | High       |
| `feat/oxford-optimisation-elm-123` | `ELM-123`      | High\*     |
| `mayank/DES-789-design-update`     | `DES-789`      | High       |
| `feature-abc-123-description`      | `ABC-123`      | Medium\*\* |

\*If `ELM` is in your configured team prefixes
\*\*Medium confidence prompts for confirmation

Configure team prefixes during setup or in config:

```json
{
  "branch": {
    "teamPrefixes": ["ENG", "DES", "ELM", "PROD"]
  }
}
```

## Commit Grouping

Files are grouped using a two-pass approach that balances two goals: **small, reviewer-friendly commits** and **safe revertability**. Every commit should be easy to review in isolation _and_ safe to revert without breaking the build.

### Pass 1 — Heuristic pre-grouping

A fast first pass groups files by path patterns:

| Pattern                   | Category             |
| ------------------------- | -------------------- |
| `*.test.ts`, `tests/`     | `test`               |
| `*.md`, `docs/`           | `docs`               |
| `Dockerfile`, `.github/`  | `ci-infra`           |
| `package.json`, lockfiles | `deps`               |
| `migrations/`             | `migration`          |
| Source files              | Grouped by directory |

### Pass 2 — AI refinement

The AI reads every diff and applies two tests:

1. **The Revert Test** (safety floor) — _"If this commit were reverted, would the codebase still compile and run?"_ Files that depend on each other must stay together.
2. **The Review Test** (quality goal) — _"Can a reviewer understand this commit without reading the others?"_ Prefer smaller, focused commits that each tell one clear story.

When Linear context is available, the AI uses the issue title, description, and labels to better understand the intent of your changes.

### Fallback

If AI is unavailable, heuristic groups from Pass 1 are used directly with auto-generated conventional commit messages.

## Code Review

| Tool       | Status       | Notes                                                              |
| ---------- | ------------ | ------------------------------------------------------------------ |
| Graphite   | Recommended  | Uses `gt` CLI — install with `npm i -g @withgraphite/graphite-cli` |
| CodeRabbit | Experimental | Requires CLI or API key                                            |
| Codex      | Experimental | Uses your `OPENAI_API_KEY`                                         |
| Devin      | Experimental | Limited access, invite-only                                        |

Findings are normalized with severity levels (`critical`, `warning`, `info`). Critical findings block the push by default.

## Configuration

### Global Configuration

Stored at `~/.config/gitship/config.json`. Created automatically by the setup wizard. Works across all repos.

```bash
gs --setup  # Re-run setup wizard anytime
```

### API Key Storage

API keys are stored in your shell profile for security and persistence:

| Shell | Profile Location             |
| ----- | ---------------------------- |
| zsh   | `~/.zshrc`                   |
| bash  | `~/.bashrc`                  |
| fish  | `~/.config/fish/config.fish` |

The setup wizard automatically detects your shell and adds keys in the correct format. If a key already exists, you'll be asked whether to use the existing key or update it.

After adding new keys, run `source ~/.zshrc` (or your shell's profile) to use them in the current terminal session.

### Per-Repository Setup

The first time you run `git-ship` in a new repository, you'll see:

```
First time using git-ship in this repository.

? How would you like to configure this repository?
> Use global config (recommended)
  Customize for this repo
  Skip for now
```

- **Use global config** — Creates a minimal `.gitshiprc.json` that references your global settings. The prompt won't appear again.
- **Customize for this repo** — Launches a wizard to override specific settings (AI provider, review tool, commit length, etc.)
- **Skip for now** — Uses global config for this run, but you'll be prompted again next time.

### Local Configuration (per-repo)

Create a `.gitshiprc.json` in your project root to override global settings:

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
    "tool": "graphite",
    "transport": "cli"
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
  "ignorePatterns": [
    "node_modules/**",
    ".env*",
    "dist/**",
    ".DS_Store",
    ".gitshiprc.json"
  ],
  "branch": {
    "teamPrefixes": ["ENG", "DES"]
  }
}
```

### Config Precedence

```
CLI flags (--review-tool, --issue, etc.)
    ↓
Environment variables (GITSHIP_*)
    ↓
Local config (.gitshiprc.json)
    ↓
Global config (~/.config/gitship/config.json)
    ↓
Defaults
```

### Environment Variables

git-ship loads `.env` from your project root automatically.

**API keys:**

| Variable             | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `LINEAR_API_KEY`     | Linear workspace API key                              |
| `OPENAI_API_KEY`     | OpenAI API key                                        |
| `ANTHROPIC_API_KEY`  | Anthropic API key                                     |
| `GEMINI_API_KEY`     | Google Gemini API key (also accepts `GOOGLE_API_KEY`) |
| `CODERABBIT_API_KEY` | CodeRabbit API key (optional)                         |
| `DEVIN_API_KEY`      | Devin API key (optional)                              |

**Config overrides:**

| Variable                      | Values                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| `GITSHIP_AI_PROVIDER`         | `openai`, `anthropic`, `gemini`                              |
| `GITSHIP_AI_MODEL`            | Any model string (e.g. `gpt-4o`, `claude-sonnet-4-20250514`) |
| `GITSHIP_LINEAR_TRANSPORT`    | `graphql`, `mcp`                                             |
| `GITSHIP_REVIEW_TOOL`         | `coderabbit`, `devin`, `codex`, `graphite`                   |
| `GITSHIP_REVIEW_ENABLED`      | `true`, `false`                                              |
| `GITSHIP_REVIEW_TRANSPORT`    | `mcp`, `cli`                                                 |
| `GITSHIP_COMMIT_MAX_LENGTH`   | `20` – `200`                                                 |
| `GITSHIP_DEVIN_ENDPOINT`      | Custom MCP endpoint for Devin                                |
| `GITSHIP_CODERABBIT_ENDPOINT` | Custom MCP endpoint for CodeRabbit                           |
| `GITSHIP_CODEX_ENDPOINT`      | Custom MCP endpoint for Codex                                |

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
