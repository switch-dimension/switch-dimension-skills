## Summary

Brief description of the changes and motivation.

## Type of Change

- [ ] New skill
- [ ] Skill update
- [ ] Documentation
- [ ] Infrastructure/CI
- [ ] Bug fix
- [ ] Other: ___________

---

## Skill Submission Checklist

**Complete this section only if adding or modifying a skill:**

### SKILL.md Validation
- [ ] `SKILL.md` has valid YAML frontmatter with `name` and `description` fields
- [ ] `SKILL.md` includes `metadata.version` using SemVer
- [ ] Directory name matches the frontmatter `name` (kebab-case)
- [ ] Description is written in third person ("Processes files" not "I can help")
- [ ] Description includes trigger terms for when the agent should use this skill

### Security Review
- [ ] No secrets, API keys, passwords, or tokens in any skill files
- [ ] No internal URLs, IP addresses, or infrastructure details exposed
- [ ] No network calls (`fetch`, `curl`, `wget`, etc.) without explicit justification
- [ ] No shell commands that pipe remote content directly to execution (`curl | sh`, `eval`, etc.)
- [ ] No `child_process` or `exec` calls without explicit justification and input validation
- [ ] No hardcoded file paths outside the workspace
- [ ] Scripts are read and reviewed for unsafe operations

### Functionality
- [ ] Skill instructions are clear and actionable for the agent
- [ ] Examples provided are concrete and cover common use cases
- [ ] Skill does not duplicate existing functionality in the repo

---

## General Security Checklist

- [ ] Changes tested locally before opening PR
- [ ] No new npm/pip dependencies added without justification
- [ ] All CI checks are expected to pass
- [ ] Commits follow Conventional Commits format

---

## Additional Notes

Any additional context, screenshots, or concerns for the reviewer.
