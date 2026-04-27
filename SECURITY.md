# Security Policy

This document outlines the security policy for the Switch Dimension Skills repository.

## Supported Versions

Only skills in the `main` branch or tagged releases of this repository (`switch-dimension/switch-dimension-skills`) are supported and approved for use within the organization. `main` is the latest approved skill set; tagged releases are stable snapshots for reproducibility and rollback.


| Version / Source        | Supported                        |
| ----------------------- | -------------------------------- |
| `main` branch (latest)  | ✅ Approved                       |
| Tagged releases         | ✅ Approved                       |
| Third-party skill repos | ❌ Not approved without PR review |
| Local modifications     | ❌ Not supported                  |


Tagged releases follow Semantic Versioning. Breaking skill changes, removals, renames, or policy changes require a major release. New skills and backward-compatible capability additions use minor releases. Documentation, CI, security scanning, typo fixes, and small corrections use patch releases.

## Skill Installation Policy

To maintain security and consistency across the organization:

1. **Only install skills from this repository**. Use:
  ```bash
   npx skills add switch-dimension/switch-dimension-skills
  ```
2. **Do not install skills directly from external repositories**. If a third-party skill is needed:
  - Import it with `npm run skills:propose -- skill-name` or `npm run skills:propose -- owner/skill-repo --skill skill-name`
  - Review the Pull Request opened by the CLI
  - The skill must pass security review before merging
  - Once merged, install from this repo
3. **Verify the source** after installation by checking `skills-lock.json`:
  - The `source` field should be `switch-dimension/switch-dimension-skills`
  - The `sourceType` should be `github`
4. **Pin to specific commits** when possible to ensure reproducibility.

## Reporting Security Vulnerabilities

If you discover a security vulnerability in any skill or repository configuration:

### Please do NOT:

- Open a public issue on GitHub
- Discuss the vulnerability in public channels
- Submit a PR that exposes the vulnerability details

### Please DO:

1. **Email security concerns to**: [security@switchdimension.com](mailto:security@switchdimension.com)
2. **Include**:
  - Description of the vulnerability
  - Steps to reproduce (if applicable)
  - Potential impact assessment
  - Any suggested remediation

### Response Timeline


| Severity | Acknowledgment | Initial Assessment | Resolution Target |
| -------- | -------------- | ------------------ | ----------------- |
| Critical | 24 hours       | 48 hours           | 7 days            |
| High     | 48 hours       | 72 hours           | 14 days           |
| Medium   | 72 hours       | 1 week             | 30 days           |
| Low      | 1 week         | 2 weeks            | 90 days           |


### Security Advisory Process

1. Report received and acknowledged
2. Initial assessment and severity classification
3. Investigation and fix development
4. Fix tested and validated
5. Security advisory published (if appropriate)
6. Reporter credited (with permission)

## Security Scanning

All changes to this repository undergo automated security scanning:

- **Secret Detection**: TruffleHog scans for committed credentials
- **Static Analysis**: Semgrep checks for dangerous code patterns
- **Skill Validation**: Custom linting validates SKILL.md format and content
- **Dependency Review**: Automated checks for vulnerable dependencies

## Skill Security Guidelines

When contributing new skills, ensure:

1. **No Secrets**: Never commit API keys, passwords, tokens, or credentials
2. **No Remote Execution**: Avoid patterns like `curl | sh` or `eval()`
3. **No Hardcoded Paths**: Use relative paths within the workspace
4. **No Unauthorized Network Calls**: Minimize external network requests
5. **Input Validation**: Sanitize any user input in scripts
6. **Least Privilege**: Skills should do only what they claim

## Incident Response

In the event of a security incident:

1. The skill or configuration will be immediately reviewed
2. If confirmed, the affected skill will be removed or patched
3. A security advisory will be issued to all users
4. Post-incident review will inform policy updates

## Contact

- Security inquiries: [security@switchdimension.com](mailto:security@switchdimension.com)
- Repository owner: @robshox
- General questions: Open an issue (for non-security topics)
