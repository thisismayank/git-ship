# git-ship: One Command to Rule Your Git Workflow

**TL;DR:** git-ship is an AI-powered CLI that turns your messy changes into clean, grouped, conventional commits — then reviews, pushes, and creates a pull request. One command: `gs`.

---

## The Problem Every Developer Knows

You've been heads-down on a feature for hours. You've touched fifteen files across four different concerns — a new API endpoint, some refactoring, a bug fix you noticed along the way, and updated tests. Now it's time to commit.

You stare at `git diff --stat` and start the mental gymnastics:

- *"Okay, these three files go together..."*
- *"Wait, this utility change should be separate..."*
- *"What's the right commit message format again?"*
- *"Should I include the ticket number?"*

After ten minutes of careful staging and writing commit messages, you give up and type:

```bash
git commit -am "update stuff"
```

Sound familiar? You're not alone.

The result is a git history that looks like this:

```
* update stuff
* fix
* wip
* more changes
* final changes
* final changes v2
```

When someone needs to bisect a bug, review what changed, or understand the history — it's useless.

---

## What if Commits Just... Wrote Themselves?

That's why I built **git-ship**.

```bash
$ gs

[1/8] Detect branch        → parse issue ID from branch name
[2/8] Fetch issue context  → pull requirements from Linear/Jira/Asana
[3/8] Collect changes      → structured diffs for all changed files
[4/8] Group into commits   → AI splits files into logical, revertable commits
[5/8] Review commit plan   → accept / edit / regroup / cancel
[6/8] Code review          → automated review before pushing
[7/8] Push to remote
[8/8] Create pull request  → AI-generated PR description
```

One command. Clean history. Every time.

---

## How It Actually Works

### 1. Smart File Grouping

git-ship doesn't just dump all your changes into one commit. It uses a two-pass approach:

**Pass 1: Heuristic Pre-grouping**
Files are initially grouped by patterns — tests with tests, docs with docs, migrations with their models.

**Pass 2: AI Refinement**
The AI reads every diff and applies two tests:

1. **The Revert Test:** *"If this commit were reverted, would the codebase still work?"* Files that depend on each other stay together.

2. **The Review Test:** *"Can someone understand this commit without reading the others?"* Prefer smaller, focused commits.

The result? Commits that are both safe to revert AND easy to review.

### 2. Context-Aware Commit Messages

git-ship doesn't just describe what changed — it understands *why*.

**Without context:**
```
feat(src): update auth files
```

**With issue context:**
```
feat(auth): add OAuth2 login with Google provider

Implement Google OAuth2 authentication:
- Add OAuth2 callback handler
- Store tokens securely in session
- Add logout endpoint to revoke tokens

Addresses: "Users should be able to log in with Google"
Refs: ENG-123
```

It pulls context from:
- **Linear** — automatic issue fetching
- **Jira** — experimental support
- **Asana** — experimental support
- **Plain text** — paste requirements manually
- **Branch name** — parses issue IDs like `feat/ENG-123-user-auth`

### 3. AI-Generated Pull Requests

After pushing, git-ship can create a PR with a professional description:

```markdown
## Summary
Brief overview of what this PR does and why.

## Problem
What issue or requirement does this address?

## Solution
How does this PR solve the problem?

## Changes Made
- Key changes organized logically
- Not just a commit dump

## Impact
What's affected? Any breaking changes?

## Testing
How was this tested? What should reviewers check?
```

No more staring at an empty PR description wondering what to write.

---

## Real-World Example

Let's say you've been working on adding user authentication. You've touched:

- `src/api/routes/auth.ts` — new login endpoint
- `src/services/auth.ts` — authentication logic
- `src/models/user.ts` — added password field
- `src/utils/jwt.ts` — token utilities
- `src/tests/auth.test.ts` — tests
- `README.md` — updated docs
- `package.json` — added bcrypt dependency

Running `gs` produces:

```
Commit Plan (3 commits)

1. feat(auth): add user authentication with JWT
   • src/api/routes/auth.ts
   • src/services/auth.ts
   • src/models/user.ts
   • src/utils/jwt.ts
   • src/tests/auth.test.ts

   Implements login/logout with JWT tokens. Tests included.

2. docs(readme): add authentication documentation
   • README.md

   Standalone documentation update.

3. chore(deps): add bcrypt for password hashing
   • package.json
   • package-lock.json

   Dependency addition for auth feature.
```

Each commit tells a clear story. Each can be reverted independently. Reviewers will thank you.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **AI Commit Grouping** | Produces small, reviewer-friendly commits that are safe to revert |
| **Multi-Tracker Support** | Works with Linear, Jira, Asana, or plain text requirements |
| **Rich Commit Messages** | Header + body + footer with requirement mapping |
| **Code Review Gate** | Runs CodeRabbit, Graphite, or other tools before pushing |
| **PR Creation** | AI-generated pull request descriptions |
| **Conventional Commits** | Enforces type, scope, and format automatically |
| **Graceful Degradation** | Works even when AI or integrations fail |

---

## Getting Started

### Install

```bash
npm install -g git-ship
```

### First Run

```bash
gs
```

The setup wizard walks you through:
1. Choose your AI provider (OpenAI, Anthropic, or Gemini)
2. Connect your issue tracker (optional)
3. Configure commit preferences

### Daily Usage

```bash
# Full workflow
gs

# Preview without committing
gs --dry-run

# Skip code review
gs --no-review

# Create PR for current branch
gs pr

# Update settings
gs config set commits.headerLength 50
```

---

## Why Not Just Use [X]?

**"I already use Copilot/ChatGPT for commit messages"**

Those tools see one file at a time. git-ship sees all your changes, understands their relationships, and groups them intelligently. It's not just about writing messages — it's about structuring your commits.

**"I use commitizen/conventional-commit tools"**

Those enforce format but don't help with grouping or context. You still have to manually stage files and write messages. git-ship automates the entire workflow.

**"I'll just write better commits"**

We all say that. Then it's 6 PM, you've been debugging for hours, and "fix stuff" seems like a perfectly reasonable commit message. git-ship removes the friction so good commits happen by default.

---

## The Philosophy

git-ship is built on a simple belief: **the commit-review-push workflow should be one step**.

The AI is good at reading diffs. Your branch name already contains the ticket. The review tool is already installed. Why are you the glue between all of these?

Your job is to write code. Let git-ship handle the paperwork.

---

## Try It Today

```bash
npm install -g git-ship
gs
```

Your git history will never be the same.

---

## Links

- **GitHub:** https://github.com/thisismayank/git-ship
- **npm:** https://www.npmjs.com/package/git-ship
- **Issues:** https://github.com/thisismayank/git-ship/issues

---

*git-ship is open source (MIT license) and actively maintained. Contributions welcome!*
