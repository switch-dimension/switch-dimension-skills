---
name: commit
description: Stages files, generates a conventional commit message from the diff, and commits. Use this skill whenever the user asks to commit, save changes, make a commit, stage and commit, or says things like "commit this", "commit my changes", "save my work to git", or "create a commit". Also trigger when the user uses shorthand like /commit.
metadata:
  author: switch-dimension
  version: "0.1.0"
---

# Git Commit Skill

Stage changes, generate a clear commit message, and commit — all in one step.

## Workflow

### 1. Gather context

Run these in parallel:
- `git status` — see what's changed (never use `-uall`)
- `git diff` and `git diff --cached` — see staged and unstaged changes
- `git log --oneline -5` — match the repo's commit style

### 2. Check for sensitive files

Before staging, scan for files that should not be committed:
- `.env`, `.env.*`
- `credentials.json`, `secrets.*`, `*.pem`, `*.key`
- Any file matching common secret patterns

If found, **warn the user and exclude them** from staging. Only commit them if the user explicitly confirms.

### 3. Stage files

- If files are already staged, respect that selection and only add unstaged changes if they're clearly related.
- If nothing is staged, stage all modified and new files (except sensitive ones).
- Prefer `git add <specific-files>` over `git add .` when there are fewer than 10 files, to keep things explicit.

### 4. Generate a commit message

Use **conventional commits** format:

```
<type>(<optional scope>): <short summary>

<optional body — what and why, not how>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`

Rules for the message:
- Summary line under 72 characters, lowercase, no period
- Pick the type based on what the change actually does, not what files changed
- Scope is optional — use it when changes are clearly scoped to one module/area
- Add a body only when the "why" isn't obvious from the summary
- If changes span multiple concerns, pick the dominant one for the type

**Examples:**

```
feat(auth): add JWT token refresh on expiry
```

```
fix: prevent duplicate entries in search results

The deduplication filter was applied after pagination,
causing duplicates when results spanned page boundaries.
```

```
chore: update dependencies and lock file
```

### 5. Commit

Use a heredoc to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
feat(scope): summary here

Optional body here.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

Always append the `Co-Authored-By` trailer.

### 6. Confirm

Run `git status` after committing to verify it succeeded. Report the commit hash and summary to the user.

## What this skill does NOT do

- **Push** — never push unless the user explicitly asks
- **Amend** — always create a new commit unless told otherwise
- **Force anything** — no `--force`, no `--no-verify`, no skipping hooks
- **Interactive git** — no `-i` flags (not supported in this environment)

If a pre-commit hook fails, fix the issue, re-stage, and create a **new** commit (don't amend).
