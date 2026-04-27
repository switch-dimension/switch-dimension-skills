# Switch Dimension Skills

A collection of agent skills for [skills.sh](https://skills.sh)—reusable capabilities for AI coding agents (Cursor, Claude Code, Windsurf, and more).

## Installation

```bash
npx skills add switch-dimension/switch-dimension-skills
```

## Company Skills CLI

Use the in-repo CLI to discover and install approved company skills:

```bash
npm run skills:list
npm run skills:info -- project-log
npm run skills:install -- project-log
npm run skills:propose -- my-skill
npm run skills:propose -- ~/work/my-skill-repo --skill my-skill
```

The CLI supports private repositories through the GitHub CLI when reading remote metadata:

```bash
gh auth login
npm run skills:list -- --remote
```

Proposal PR creation also requires `gh auth login`.

Available commands:

- `sd-skills list` — list approved skills with version and description
- `sd-skills info <skill>` — show details for one skill
- `sd-skills install <skill>` — install one approved skill with `npx skills`
- `sd-skills install --all` — install every approved skill
- `sd-skills install <skill> --dry-run` — print the install command without running it
- `sd-skills propose <source>` — clone the official skills repo, import an external skill, validate it, push to the official repo or a fork, open a PR, and clean up the temporary checkout

## Available Skills

- **project-log** — Ensures a `.docs` folder exists, creates `project-log.md`, and records current project status for handoff. Use when ending a session, handing off, or saving project state.
- **skill-review** — Reviews new or modified agent skills for quality, safety, discoverability, structure, and repository best practices.
- **update-docs** — Reviews project changes and updates documentation to match current behavior, setup, governance, security, and usage best practices.

## Third-Party Skills

To maintain security, **all skills must be installed from this repository only**. External skills require review before use.

### Using External Skills

If you want to use a skill from another provider:

1. **Import the skill for review**:
  ```bash
   npm run skills:propose -- skill-name
   npm run skills:propose -- owner/skill-repo --skill skill-name
  ```
2. **Review the Pull Request** opened by the CLI
3. **Security review** — The skill undergoes automated and manual review
4. **Install from this repo** after merge:
  ```bash
   npx skills add switch-dimension/switch-dimension-skills --skill skill-name
  ```

### Approved External Skills


| Provider                           | Skill | Description | Status |
| ---------------------------------- | ----- | ----------- | ------ |
| *Submit PR to add external skills* |       |             |        |


See [CONTRIBUTING.md](./CONTRIBUTING.md) for the import process.

## Creating & Sharing Skills

See [SKILLS_WORKFLOW_GUIDE.md](./SKILLS_WORKFLOW_GUIDE.md) for the full workflow on creating, storing, and sharing skills via skills.sh.

## Versioning

`main` is the latest approved skill set. Stable snapshots are published with Git tags and GitHub Releases using Semantic Versioning:

- `major`: breaking changes to skill names, behavior, structure, or installation policy
- `minor`: new skills or backward-compatible skill capabilities
- `patch`: docs, CI, security scanning, typo fixes, or small skill corrections

Each skill also declares its own `metadata.version` in `SKILL.md`. Update the per-skill version when that skill's behavior changes. Deprecate skills before removing or renaming them, and document removals in the next major release.

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

1. Import it with `npm run skills:propose -- skill-name` or `npm run skills:propose -- owner/skill-repo --skill skill-name`
2. Review the Pull Request opened by the CLI
3. The skill will undergo security review
4. Once merged, install from this repo

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
