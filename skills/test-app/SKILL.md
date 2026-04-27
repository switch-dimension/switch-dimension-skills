---
name: test-app
description: Starts the dev server, opens the browser, and tests recent changes end-to-end. Use this skill whenever the user says things like "test my changes", "check if this works", "run and test", "smoke test", "verify the app", "open the browser and test", "make sure it works", "test the UI", "check for errors", or asks you to visually verify, click through flows, or check console logs after making code changes. Also trigger when the user wants to see their app running and validated in the browser, even if they don't say "test" explicitly — phrases like "does it look right?", "spin it up and check", or "try it out" count too.
metadata:
  author: switch-dimension
  version: "0.1.0"
---

# Smoke Test Skill

Run the dev server, open the app in a browser, and verify recent changes actually work — visually, functionally, and without errors.

## Workflow

### 1. Understand what changed

Start by figuring out what you're testing. Run these in parallel:

- `git diff HEAD` and `git diff --cached` — see what changed
- `git log --oneline -3` — recent commit context
- Read the `package.json` in the project root to find the dev server command and port

If the user tells you what to test, use that. Otherwise, infer from the diff which pages/components/flows were affected.

### 2. Start the dev server

Detect the dev command from `package.json` scripts — look for `dev`, `start`, or `serve` in that order. Run it in the background:

```bash
nohup npm run dev > /tmp/smoke-test-server.log 2>&1 &
echo $! > /tmp/smoke-test-server.pid
```

Wait for the server to be ready by polling the log or the port:

```bash
for i in $(seq 1 30); do
  curl -s http://localhost:3000 > /dev/null 2>&1 && break
  sleep 1
done
```

Detect the port from `package.json`, framework config, or server output. Don't assume 3000 — check the logs if the first attempt fails.

### 3. Check server logs for startup errors

Read `/tmp/smoke-test-server.log` and look for:
- Compilation errors or warnings
- Missing module errors
- Type errors
- Failed to compile messages

If there are blocking errors, report them to the user immediately and stop — no point opening the browser if the server didn't start.

### 4. Open the browser and navigate

Use the browser automation tools:

1. Call `tabs_context_mcp` to see current browser state
2. Create a new tab with `tabs_create_mcp` pointing to the app URL
3. Wait a moment for the page to load, then take a screenshot with `computer` (screenshot action) to verify it rendered

Navigate to the specific page or route affected by the changes. If the diff touched `/app/dashboard/page.tsx`, navigate to `/dashboard`. Use your judgment to map file paths to routes.

### 5. Visual verification

Take a screenshot and check:
- Does the page render without a blank screen or error boundary?
- Are the key UI elements visible (headers, buttons, forms, data)?
- Is the layout broken or overlapping?
- Do images and assets load?

Use `read_page` to get the page structure if you need to verify specific elements exist.

### 6. Check console and network

Use `read_console_messages` to check for:
- JavaScript errors (red)
- Unhandled promise rejections
- Failed network requests (4xx, 5xx)
- React/framework-specific warnings (hydration mismatches, missing keys, deprecated APIs)

Use `read_network_requests` to check for:
- Failed API calls
- Slow responses (>3s)
- CORS errors
- 404s for assets

### 7. Click through the flow

Based on what changed, interact with the affected UI:

- Click buttons and links using `find` + `computer` (click)
- Fill forms using `form_input`
- Navigate between pages
- Test the happy path first, then edge cases if relevant

After each interaction:
- Take a screenshot to verify the result
- Check console for new errors
- Verify the expected outcome happened (navigation occurred, data appeared, modal opened, etc.)

### 8. Record a GIF (when useful)

For multi-step flows, use `gif_creator` to record the interaction sequence. This gives the user a visual artifact they can review. Name it descriptively, e.g., `login-flow-test.gif` or `dashboard-crud-test.gif`.

### 9. Clean up

When done testing, kill the dev server:

```bash
kill $(cat /tmp/smoke-test-server.pid) 2>/dev/null
rm -f /tmp/smoke-test-server.pid /tmp/smoke-test-server.log
```

### 10. Report results

Give the user a clear summary:

```
## Smoke Test Results

**Changes tested:** <what was changed>
**URL tested:** http://localhost:<port>/<path>

### Rendering: PASS/FAIL
- <what rendered correctly or didn't>

### Console Errors: PASS/FAIL (N errors found)
- <list any errors>

### Network: PASS/FAIL
- <any failed requests>

### Flow Test: PASS/FAIL
- <what interactions were tested and results>

### Screenshots
- <reference any screenshots taken>
```

Be honest. If something looks off, say so. If everything works, say that too.

## Safety: ask before acting on live apps

This skill may run against production or staging environments. Before performing any of the following, **always stop and ask the user for confirmation**:

- **Submitting forms** that create, update, or delete real data (e.g., creating a user, posting content, placing an order)
- **Clicking delete/remove/archive buttons** or anything that mutates persistent state
- **Publishing or deploying** anything
- **Sending emails, notifications, or messages** through the app
- **Making payments or transactions**
- **Modifying settings or configuration** within the app UI

When in doubt about whether an action has side effects, ask. It's better to pause and confirm than to accidentally create a real order or delete production data.

For read-only actions (navigating pages, viewing data, taking screenshots, reading console logs), no confirmation is needed.

## Important notes

- Never leave the dev server running after the test completes
- If the port is already in use, check if there's already a server running and use it instead of starting a new one
- If the browser tools aren't responding, tell the user — don't loop endlessly
- Keep the test focused on what actually changed. Don't try to test the entire app
- If you hit an error you can't get past after 2-3 attempts, stop and report it
