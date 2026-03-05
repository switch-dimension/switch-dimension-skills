---
name: log-doctor
description: Diagnose errors from dev server logs (Next.js, Vite, etc.) and fix them. Use this skill whenever the user mentions checking logs, server errors, terminal errors, build failures, or asks things like "why is my server crashing", "check my logs", "what's this error", "fix the build error", "the dev server is broken", "something's wrong with my app", "check the terminal", "I'm getting an error", or "debug the server output". Also trigger when the user asks you to monitor running tasks for errors, review background task output, or wants help understanding any error in terminal or task logs — even if they don't say "logs" explicitly.
metadata:
  author: switch-dimension
  version: "0.1.0"
---

# Log Doctor

Find errors in dev server and task logs, diagnose them, and fix the source code.

## When to use

This skill covers two scenarios:

1. **Terminal / Bash output** — The user ran a dev server or build command and sees errors
2. **Background tasks** — The user has running subagent tasks and wants to check them for errors

## Workflow

### 1. Gather logs

Collect error output from all available sources in parallel:

**From Bash / terminal:**
- Check if there's a running dev server log file (e.g., `/tmp/smoke-test-server.log` or similar)
- If the user just ran a command, the error is likely in the recent Bash output already visible in conversation context — no need to re-run anything
- If a dev server is running in the background, read its log file

**From background tasks:**
- Use `TaskList` to see all active tasks
- Use `TaskGet` on any tasks with status `in_progress` or `failed` to read their output
- Look for error patterns in the task output

**From the dev server directly:**
- Before starting a dev server, check if one is already running on the expected port:
  ```bash
  lsof -i :<port> -sTCP:LISTEN
  ```
- If the port is in use, the server is likely already running — read its output from the existing log file or ask the user where to find the logs instead of starting a new instance
- If the port is free and no logs are available, start the dev server to reproduce:
  ```bash
  npm run dev 2>&1 | head -100
  ```
- If you're unsure which port the project uses, check `package.json` scripts and framework config first. If still unclear, ask the user rather than guessing
- For build errors: `npm run build 2>&1 | head -200`

### 2. Identify the errors

Scan the collected logs for these patterns:

**Next.js specific:**
- `Error: ` or `error -` prefixed lines
- `Module not found` — missing import or package
- `Type error` — TypeScript issues
- `Unhandled Runtime Error` — runtime crashes
- `Failed to compile` — build-blocking errors
- `Warning:` lines that indicate real problems (hydration mismatch, missing key, etc.)
- `ENOENT` or `EACCES` — file system issues
- Server component / client component boundary violations
- `next.config` parsing errors

**Vite specific:**
- `[vite]` prefixed error lines
- `Failed to resolve import` — missing module
- `Pre-transform error` — plugin failures
- `TypeError` or `ReferenceError` in SSR
- HMR errors (`[hmr]`)
- `optimized dependencies changed` loops
- Config file errors

**General:**
- Stack traces (lines with `at ...`)
- `EADDRINUSE` — port conflict
- `SyntaxError` — malformed code
- `Cannot find module` — missing dependency
- Segfaults or out-of-memory errors
- npm/yarn/pnpm install failures

### 3. Diagnose root cause

For each error found:

1. **Read the referenced file and line** — the stack trace or error message almost always points to a specific file and line number. Read it.
2. **Understand the context** — read surrounding code, imports, and related files to understand why the error occurs
3. **Check package.json** — if it's a missing module, check if the package is listed in dependencies
4. **Check config files** — for config-related errors, read `next.config.js`, `vite.config.ts`, `tsconfig.json`, etc.

### 4. Fix the errors

Apply fixes directly — don't just suggest them. Common fixes:

| Error | Fix |
|-------|-----|
| `Module not found` | Install the package or fix the import path |
| `Type error` | Fix the type issue in the source file |
| `Failed to compile` (syntax) | Fix the syntax error |
| `EADDRINUSE` | Find and kill the process on that port |
| Hydration mismatch | Fix the server/client rendering discrepancy |
| Missing env variable | Tell the user which `.env` variable is needed |
| `Cannot find module` (local) | Fix the relative import path |

For each fix:
1. Edit the file using the Edit tool
2. If a package needs installing, run `npm install <package>` (or the appropriate package manager)
3. If it's a config issue, edit the config file

After fixing, verify by running the build or dev server again and checking that the error is gone.

### 5. Report findings

Give the user a clear summary:

```
## Log Doctor Report

**Source:** <where you found the logs>

### Errors Found: N

**1. <Error title>**
- File: `path/to/file.ts:42`
- Error: <the error message>
- Cause: <why it happened>
- Fix: <what you did>
- Status: Fixed / Needs user action

### Verification
<did the fix work? paste the clean output or remaining errors>
```

If an error requires user input (like adding an env variable or choosing between options), explain what's needed and ask.

## Important notes

- Always read the actual source file before attempting a fix — don't guess based on the error message alone
- If multiple errors exist, fix them in dependency order (e.g., fix missing imports before type errors)
- If an error is in `node_modules`, the fix is usually in the project's code or config, not in the module itself — don't edit `node_modules`
- If you can't determine the fix, explain the error clearly and suggest what the user should investigate
- Don't restart the dev server unless you need to verify a fix — the user may have it running intentionally
- For background tasks, use `TaskGet` to read output — don't stop or restart tasks without asking
