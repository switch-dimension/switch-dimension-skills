---
name: skill-review
description: Reviews new or modified agent skills for quality, safety, discoverability, structure, and repository best practices. Use when reviewing skill submissions, pull requests that add or change SKILL.md files, skill metadata, helper scripts, examples, or when the user asks to review a skill.
metadata:
  author: switch-dimension
  version: "0.1.0"
---

# Skill Review

Review agent skills as reusable instructions that will be loaded into another agent's context. Prioritize correctness, safety, clarity, and whether the skill will trigger at the right time.

## Review Workflow

### 1. Identify the skill changes

Start with the actual diff:

- Check changed skill directories and `SKILL.md` files.
- Review any supporting files such as scripts, examples, reference docs, templates, or fixtures.
- Compare new skills against existing skills to detect duplication or overlap.
- If reviewing a PR, inspect all commits in scope, not only the latest commit.

Do not rewrite the skill during review unless the user explicitly asks for fixes. Review findings first.

### 2. Validate required structure

For each changed skill, verify:

- The skill lives in its own kebab-case directory.
- `SKILL.md` exists and starts with valid YAML frontmatter.
- Frontmatter `name` matches the directory name.
- `description` is present, specific, and written in third person.
- `metadata.version` exists and uses SemVer, such as `"0.1.0"` or `"1.2.3"`.
- Any linked reference files are present and one level deep from `SKILL.md`.
- The main `SKILL.md` is concise enough to be loaded into context; move long detail to reference files when needed.

Run the repository's skill validation command when available. In this repo, use:

```bash
node scripts/lint-skills.mjs
```

### 3. Review discoverability

The description determines when an agent applies the skill. Check that it includes:

- **What** the skill does.
- **When** to use it, including natural trigger phrases users might say.
- Clear scope boundaries so it does not activate for unrelated work.
- Third-person wording, for example "Reviews pull requests" rather than "I review pull requests".

Flag descriptions that are vague, too broad, too narrow, first-person, missing triggers, or longer than needed.

### 4. Review instruction quality

The body should help an agent perform the task reliably:

- Steps are ordered and actionable.
- The skill tells the agent what evidence to gather before acting.
- Decision points are explicit when multiple paths are possible.
- Output expectations are clear.
- Examples are concrete and relevant.
- The skill avoids restating obvious general agent behavior.
- The skill does not include stale, time-sensitive, or project-specific details unless the skill is intentionally project-specific.

Prefer concise workflows, checklists, and templates over long prose.

### 5. Review safety and permissions

Look for security and operational risks:

- Secrets, credentials, tokens, private URLs, or internal infrastructure details.
- Instructions to pipe untrusted remote downloads directly into a shell.
- `eval`, `new Function`, shell execution, or child process usage without clear justification.
- Network calls, file writes, destructive commands, or external service actions without user confirmation rules.
- Hardcoded absolute paths that will not work across machines.
- Instructions that bypass review, tests, security checks, or repository policy.

If helper scripts are included, read them. Treat scripts as executable code, not documentation.

### 6. Review maintainability

Check whether the skill will age well:

- Version changes match the behavioral impact.
- Deprecations include migration guidance.
- New skills do not duplicate existing skills without explaining why.
- Naming is clear, specific, and stable.
- Supporting files are necessary and easy to find.
- Documentation or README listings are updated when the repository expects them.

### 7. Report findings

Use a code-review style response:

- Lead with findings, ordered by severity.
- Reference exact files and symbols where possible.
- Explain the risk and the suggested fix.
- Separate blockers from suggestions.
- If there are no issues, say so and mention any residual risk or validation gaps.

Suggested severity labels:

- **Blocking**: Unsafe, invalid, misleading, or likely to make the skill fail.
- **Important**: Reduces reliability, discoverability, or maintainability.
- **Suggestion**: Improves clarity or consistency but does not block approval.

## Approval Checklist

- [ ] Structure and metadata are valid.
- [ ] Description is discoverable and scoped.
- [ ] Instructions are actionable and concise.
- [ ] Safety risks are addressed.
- [ ] Helper scripts and linked files are reviewed.
- [ ] Skill does not duplicate existing functionality unnecessarily.
- [ ] Validation command passes or failures are understood.
