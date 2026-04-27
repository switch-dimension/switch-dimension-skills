# Switch Dimension Skills

A collection of agent skills for [skills.sh](https://skills.sh)—reusable capabilities for AI coding agents (Cursor, Claude Code, Windsurf, and more).

## Installation

```bash
npx skills add switch-dimension/switch-dimension-skills
```

## Available Skills

- **project-log** — Ensures a `.docs` folder exists, creates `project-log.md`, and records current project status for handoff. Use when ending a session, handing off, or saving project state.

## Recommended Skills from Other Providers

Skills from other providers that complement this collection:


| Provider                                 | Skill | Description |
| ---------------------------------------- | ----- | ----------- |
| *Add skills as you discover useful ones* |       |             |


npx skills add [https://github.com/clerk/skills](https://github.com/clerk/skills) --skill clerk-nextjs-patterns 

## Creating & Sharing Skills

See [SKILLS_WORKFLOW_GUIDE.md](./SKILLS_WORKFLOW_GUIDE.md) for the full workflow on creating, storing, and sharing skills via skills.sh.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on submitting new skills, the PR process, and security requirements.

## Security

See [SECURITY.md](./SECURITY.md) for the full security policy, vulnerability reporting process, and skill installation guidelines.

---

## Skill Installation Policy

**For all team members**: This repository is the single source of truth for approved skills. To maintain security and consistency:

### Approved Installation Source

Install skills **only** from this repository:

```bash
npx skills add switch-dimension/switch-dimension-skills
```

### Third-Party Skills

Do **not** install skills directly from external repositories:

```bash
# DON'T DO THIS
npx skills add some-external-user/random-skill
```

Instead, if you need a third-party skill:
1. Fork or copy the skill into this repository via a Pull Request
2. The skill will undergo security review
3. Once merged, install from this repo

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full process.

### Verification

After installing, verify the source in your project's `skills-lock.json`:

```json
{
  "skills": {
    "skill-name": {
      "source": "switch-dimension/switch-dimension-skills",
      "sourceType": "github"
    }
  }
}
```

If the `source` field points to any other repository, do not use that skill and report it to the repository owner.

### Need a New Skill?

1. Check if it already exists in this repository
2. If not, propose it via a Pull Request (see [CONTRIBUTING.md](./CONTRIBUTING.md))
3. The designated owner will review and merge approved skills