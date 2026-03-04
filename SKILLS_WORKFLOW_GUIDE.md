# Skills.sh Workflow Guide: Create, Store & Share Agent Skills

A research-backed guide for creating agent skills and sharing them via **skills.sh** (Vercel's open agent skills ecosystem).

---

## What is skills.sh?

**skills.sh** is Vercel's open ecosystem for AI agent skills—functioning like "npm for AI agents." Launched January 2026, it provides:

- **Directory & leaderboard** at [skills.sh](https://skills.sh) for discovering skills
- **One-command install**: `npx skills add owner/repo`
- **Cross-agent support**: Works with Cursor, Claude Code, Windsurf, GitHub Copilot, and 15+ other AI coding agents
- **100% free** — no auth required for installs; telemetry is anonymous and optional

---

## How skills.sh Works

### Installation (for your users)

```bash
# Install entire skill collection from a repo
npx skills add vercel-labs/agent-skills

# Install specific skill from a multi-skill repo
npx skills add owner/repo --skill skill-name
```

When users run `npx skills add`, the CLI:

1. Prompts to select target agent (Cursor, Claude, etc.)
2. Downloads skills from the specified GitHub repo
3. Installs them into the agent's skills directory
4. Sends anonymous telemetry (skill name, timestamp) to rank the leaderboard—opt out with `DISABLE_TELEMETRY=1`

### Discovery & leaderboard

- Skills appear on [skills.sh](https://skills.sh) automatically when users install them
- Leaderboard ranks by install count (all-time, 24h trending, hot)
- No registration or publishing step—just push to GitHub and share the install command

---

## Creating Your Skills Repository

### Option A: Multi-skill repo (recommended)

One repo, many skills—like `vercel-labs/agent-skills`:

```
your-username/switch-dimension-skills/
├── skills/                      # or at repo root
│   ├── my-domain-skill/
│   │   ├── SKILL.md            # Required
│   │   ├── scripts/            # Optional
│   │   │   └── helper.py
│   │   └── reference.md        # Optional
│   ├── another-skill/
│   │   └── SKILL.md
│   └── ...
├── README.md                   # Describe your skills, install instructions
├── AGENTS.md                   # Optional: agent-specific instructions
└── .gitignore
```

**Install command for users:**

```bash
npx skills add your-username/switch-dimension-skills
```

### Option B: Single-skill repo

One skill per repo:

```
your-username/my-awesome-skill/
├── SKILL.md
├── scripts/
├── README.md
└── ...
```

**Install:**

```bash
npx skills add your-username/my-awesome-skill
```

---

## SKILL.md Format

Each skill **must** have a `SKILL.md` file with YAML frontmatter and markdown body:

```markdown
---
name: skill-name                 # kebab-case, matches directory name
description: Brief description of what this skill does and when to use it. Be specific—include trigger terms. Write in third person.
license: MIT                     # Optional
metadata:                        # Optional
  author: your-name
  version: "1.0.0"
---

# Skill Title

## Instructions
Clear, step-by-step guidance for the agent.

## Examples
Concrete usage examples.
```

### Description best practices (critical for discovery)

- **Third person**: "Processes Excel files" not "I can help with Excel"
- **Include triggers**: "Use when working with PDFs, forms, or document extraction"
- **WHAT + WHEN**: What the skill does + when the agent should apply it

---

## Workflow: Save & Share Your Skills

### 1. Create a GitHub repository

```bash
# In your workspace
cd /Users/robshocks/Development/sd-core/switch-dimension-skills
git init
git remote add origin https://github.com/your-username/switch-dimension-skills.git
```

### 2. Add your first skill

```bash
mkdir -p skills/my-first-skill
# Create skills/my-first-skill/SKILL.md (see format above)
```

### 3. Push to GitHub

```bash
git add .
git commit -m "feat: add my-first-skill"
git push -u origin main
```

### 4. Share with others

Anyone can install with:

```bash
npx skills add your-username/switch-dimension-skills
```

### 5. Optional: Add to skills.sh discoverability

- Skills appear on the leaderboard automatically when users install
- Ensure your repo has a clear README with install instructions
- Good descriptions in SKILL.md help users find you via search on skills.sh

---

## Syncing Local Skills to Your Repo

If you already have skills in `~/.cursor/skills/` or `~/.codex/skills/`:

1. **Copy structure** to your repo:

   ```bash
   # Example: copy a Cursor skill into your repo
   cp -r ~/.cursor/skills/your-skill-name skills/
   ```

2. **Normalize structure** — ensure each skill has:
   - `SKILL.md` with valid frontmatter
   - `name` matches directory name
   - `description` is specific and third-person

3. **Commit and push** — your repo becomes the source of truth

---

## Commands Cheat Sheet

| Action              | Command                                          |
|---------------------|--------------------------------------------------|
| Install skill       | `npx skills add owner/repo`                       |
| Install one skill   | `npx skills add owner/repo --skill skill-name`    |
| Opt out telemetry   | `DISABLE_TELEMETRY=1 npx skills add ...`         |
| Browse directory    | Visit [skills.sh](https://skills.sh)             |

---

## References

- **skills.sh directory**: https://skills.sh
- **CLI docs**: https://skills.sh/docs/cli
- **FAQ**: https://skills.sh/docs/faq
- **Vercel announcement**: https://vercel.com/changelog/introducing-skills-the-open-agent-skills-ecosystem
- **Example repo**: https://github.com/vercel-labs/agent-skills
- **Skill format spec**: https://agentskills.io/ (referenced by Vercel)

---

## Next Steps for Your Repo

Your workspace `switch-dimension-skills` is ready to become a skills repo. Recommended:

1. Initialize git and create a GitHub repo (public or private)
2. Add a `skills/` folder with your first skill
3. Add a README with install instructions
4. Optionally migrate skills from `~/.cursor/skills` or `~/.codex/skills` into this repo
5. Share the install command with your team or community
