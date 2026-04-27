---
name: update-docs
description: Reviews project changes and updates relevant documentation to match current behavior, setup, configuration, security, operations, and usage. Use when the user asks to update docs, audit documentation, check docs drift, prepare a handoff, document recent changes, or ensure project docs are current.
metadata:
  author: switch-dimension
  version: "0.1.0"
---

# Update Docs

Keep project documentation accurate, minimal, and useful after code, workflow, configuration, or policy changes.

## Workflow

### 1. Understand the change set

Gather context before editing:

- Check `git status` for changed files.
- Review staged and unstaged diffs.
- Review recent commits if the user asks about changes since docs were last updated.
- Identify whether changes affect user behavior, setup, commands, workflows, security, CI, governance, or release/versioning.

Do not overwrite unrelated user edits. If documentation files are already modified, read them carefully and build on those changes.

### 2. Discover documentation

Find the repository's documentation surface before choosing files to edit:

- Search for documentation files and directories, including names like `README`, `CONTRIBUTING`, `SECURITY`, `CHANGELOG`, `RELEASES`, `MIGRATION`, `INSTALL`, `SETUP`, `RUNBOOK`, `OPERATIONS`, `ARCHITECTURE`, `API`, `FAQ`, `docs/`, `documentation/`, `.github/`, and package-specific docs.
- Inspect docs referenced from the project entry points, package metadata, manifests, or existing docs.
- Include non-Markdown docs when they are the source of truth, such as `.rst`, `.adoc`, `.txt`, wiki exports, OpenAPI files, config examples, or generated docs sources.
- For monorepos, identify package-level docs near the changed files as well as root-level docs.
- For agent-skill repositories, inspect relevant `SKILL.md` files and any linked reference docs.

Do not assume a fixed documentation structure. Let the repository's existing docs and changed files determine what needs updating.

### 3. Decide whether docs need changes

Update documentation when a change affects:

- Public or internal commands users run.
- Installation, authentication, setup, or environment requirements.
- CLI flags, script names, workflow names, or required status checks.
- Security posture, supported sources, secrets scanning, or dependency review.
- Governance, ownership, review, deployment, release, or merge policy.
- Public APIs, data models, events, configuration keys, feature flags, or integration contracts.
- Product behavior, UI flows, screenshots, examples, or troubleshooting guidance.
- Package names, module boundaries, generated artifacts, or developer tooling.
- Skill names, behavior, metadata, versioning, deprecation, or install guidance when the repo contains agent skills.
- Release notes, supported versions, or migration steps.

Do not update docs for purely internal refactors unless they change observable behavior or maintenance workflow.

### 4. Edit with documentation standards

Keep edits focused and consistent:

- Prefer short sections with concrete commands and examples.
- Keep user-facing docs accurate before making them comprehensive.
- Use existing headings and tone when possible.
- Avoid duplicating large policy blocks across files; link to the source of truth.
- Keep command examples copy-pasteable.
- Match the repository's versioning and branching terminology instead of assuming `main`, SemVer, GitHub, or public packages.
- Mention authentication only when the workflow actually requires private access, tokens, cloud credentials, or repository permissions.
- Preserve checklists where they help contributors avoid mistakes.

### 5. Validate

After editing:

- Run `git diff --check`.
- Check edited docs for stale names, old command examples, or obsolete tools.
- Verify any documented command if it is cheap and safe to run.
- If docs are generated, update the source files and run the documented generation command when available.

### 6. Report

Summarize:

- Which docs were updated.
- What changed and why.
- What validation ran.
- Any docs intentionally left unchanged.
- Any follow-up needed, such as creating a release or updating remote branch protection.
- Any generated docs that could not be regenerated.

## Documentation Heuristics

- **Start where users start**: Put or link essential setup and usage guidance from the primary entry document.
- **Keep maintainer docs actionable**: Contribution, release, operations, and review docs should explain exact workflows and validation steps.
- **Document trust boundaries**: Security, privacy, permissions, credentials, and data-handling changes belong in the repo's security or operations docs.
- **Document manual configuration**: If behavior depends on settings outside code, record where those settings live and how to verify them.
- **Keep repeated checks close to reviewers**: If something must be verified every change, add it to the repo's PR checklist or review guide.
- **Prefer local specificity over generic templates**: Follow the repository's existing docs structure, vocabulary, and level of detail.

