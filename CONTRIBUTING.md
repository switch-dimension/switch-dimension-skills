# Contributing Guide

Thank you for contributing to the Switch Dimension Skills repository. This guide covers the workflow for submitting new skills, updating existing ones, and maintaining security standards.

## Quick Start

1. Fork or branch from `main`
2. Create your skill in `skills/your-skill-name/`
3. Test locally with `node scripts/lint-skills.mjs`
4. Submit a Pull Request
5. Await review from the designated owner

## Repository Structure

```
switch-dimension-skills/
├── skills/                    # All skills live here
│   ├── skill-name/
│   │   ├── SKILL.md          # Required: Skill definition
│   │   ├── scripts/          # Optional: Helper scripts
│   │   └── reference.md      # Optional: Additional docs
│   └── ...
├── .github/
│   ├── workflows/            # CI/CD automation
│   ├── CODEOWNERS            # Review gating
│   └── pull_request_template.md
├── scripts/
│   └── lint-skills.mjs       # Local validation script
├── README.md                  # Main documentation
├── SECURITY.md               # Security policy
└── CONTRIBUTING.md           # This file
```

## Creating a New Skill

### 1. Branch from main

```bash
git checkout main
git pull origin main
git checkout -b feat/my-new-skill
```

### 2. Create the skill directory

```bash
mkdir -p skills/my-new-skill
```

Directory naming:
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Examples: `project-log`, `test-app`, `security-audit`

### 3. Write SKILL.md

Every skill requires a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-new-skill              # Must match directory name
description: Clear, third-person description of what this skill does and when to use it. Include trigger terms like "use when", "for", "helps with".
license: MIT                   # Optional
metadata:                       # Optional
  author: your-github-handle
  version: "1.0.0"
---

# Skill Title

## Instructions

Step-by-step guidance for the agent. Be specific and actionable.

1. First step
2. Second step
3. Third step

## Examples

Concrete examples of when and how to use this skill.

### Example 1: Common use case

Describe the scenario and expected outcome.

```
```

### Description Best Practices

- **Third person**: "Processes Excel files" not "I can help with Excel"
- **Include triggers**: "Use when working with PDFs, forms, or document extraction"
- **WHAT + WHEN**: What it does + when the agent should apply it
- **20+ characters**: Descriptions should be detailed enough to be useful

### 4. Add optional supporting files

If your skill needs helper scripts:

```bash
mkdir skills/my-new-skill/scripts
# Add your script files here
```

Guidelines for scripts:
- Prefer Node.js or Python for portability
- No compiled binaries
- Include comments explaining complex operations
- Avoid network calls unless essential
- Never use `eval()`, `exec()`, or pipe remote content to shell

### 5. Validate locally

Run the linting script before submitting:

```bash
node scripts/lint-skills.mjs
```

Fix any errors or warnings before opening a PR.

### 6. Commit your changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add my-new-skill for [specific purpose]"
```

Common types:
- `feat`: New skill or capability
- `fix`: Bug fix in existing skill
- `docs`: Documentation changes
- `refactor`: Code improvement without behavior change
- `chore`: Maintenance, tooling, config

### 7. Push and open a Pull Request

```bash
git push -u origin feat/my-new-skill
```

Then open a PR on GitHub. The PR template will guide you through the security checklist.

## Review Process

All PRs require:

1. **Review from the designated owner** (specified in CODEOWNERS)
2. **All CI checks must pass**:
   - Secret detection (Gitleaks)
   - Static analysis (Semgrep)
   - Skill validation (custom linting)
3. **No merge conflicts** with main

The reviewer will check:
- SKILL.md format and frontmatter
- Security of any scripts
- Clarity of instructions
- Alignment with existing skills

## Updating an Existing Skill

Same process as creating a new skill:

1. Branch from main
2. Make your changes
3. Validate locally
4. Commit with appropriate type:
   - `fix(skill-name): correct typo in instructions`
   - `feat(skill-name): add new capability`
   - `docs(skill-name): clarify usage examples`
5. Open PR and complete the template

## Security Requirements

Before submitting, ensure your skill:

- [ ] Contains no secrets (API keys, passwords, tokens)
- [ ] Has no internal URLs or infrastructure details
- [ ] Does not use `eval()`, `new Function()`, or similar
- [ ] Does not execute remote content (`curl | sh`)
- [ ] Does not spawn child processes without justification
- [ ] Validates any user input
- [ ] Uses only relative paths within the workspace

See [SECURITY.md](SECURITY.md) for the full security policy.

## Proposing Third-Party Skills

If you want to use a skill from another repository:

1. **Do not install directly** via `npx skills add owner/repo`
2. **Copy the skill** into this repository via a PR:
   - Fork/copy the skill directory to `skills/`
   - Review for security issues
   - Update frontmatter if needed
   - Follow all validation steps
3. **Install from this repo** after merge

This ensures all skills pass our security review.

## Code of Conduct

- Be respectful in discussions
- Accept constructive feedback
- Focus on skill quality and security
- Help others learn the contribution process

## Questions?

- Open an issue for general questions (not security-related)
- See [SKILLS_WORKFLOW_GUIDE.md](SKILLS_WORKFLOW_GUIDE.md) for more details
- Review existing skills in `skills/` for examples
