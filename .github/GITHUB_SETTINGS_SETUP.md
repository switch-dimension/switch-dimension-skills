# GitHub Repository Settings Setup

This document outlines the manual steps required to fully secure the repository. These settings can only be configured through the GitHub web interface.

## 1. Branch Protection Rules

Navigate to: **Settings -> Branches -> Add rule**

Apply to: `main`

### Protection Settings


| Setting                                                | Value                                                     | Notes                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Require a pull request before merging                  | ✅ Enabled                                                 | All changes must go through PR                                                     |
| Require approvals                                      | 1                                                         | Minimum 1 approval required                                                        |
| Require review from Code Owners                        | ✅ Enabled                                                 | Enforces CODEOWNERS file                                                           |
| Dismiss stale PR approvals when new commits are pushed | ✅ Enabled                                                 | Ensures fresh review after changes                                                 |
| Require conversation resolution before merging         | ✅ Enabled                                                 | All review threads must be resolved                                                |
| Require status checks to pass before merging           | ✅ Enabled                                                 | CI must pass                                                                       |
| Required checks                                        | `Secret Detection`, `Static Analysis`, `Skill Validation` | As defined by job names in security.yml                                            |
| Require branches to be up to date before merging       | ✅ Recommended                                             | Prevents conflicts                                                                 |
| Do not allow bypassing the above settings              | ❌ Disabled                                                | Allows the designated owner/admin to bypass when merging their own maintenance PRs |
| Restrict who can push to matching branches             | Optional                                                  | Can restrict to specific users                                                     |


### Save the rule

Click "Create" or "Save changes" to apply.

### Admin/Owner Bypass

GitHub does not allow pull request authors to approve their own PRs. For owner-authored maintenance changes, configure a bypass allowance for the designated owner (`@robshox`) so they can merge after required checks pass while keeping review requirements active for contributor PRs.

## 2. Code Security Settings

Navigate to: **Settings -> Code security and analysis**

### Dependency Graph

- ✅ Enable: Dependency graph
- ✅ Enable: Dependabot alerts

### Secret Scanning

- ✅ Enable: Secret scanning
- ✅ Enable: Push protection

This will block commits that contain patterns matching known secret types (API keys, tokens, etc.).

### CodeQL Analysis (if available)

- ✅ Enable: CodeQL analysis (if on a plan that supports it)

## 3. Repository Settings

Navigate to: **Settings -> General**

### Features

- ✅ Issues: Enable (for non-security questions)
- ✅ Discussions: Optional (can disable if not using)
- ❌ Wikis: Disable (use repository docs instead)
- ❌ Projects: Optional (disable if not using)

### Pull Requests

- ✅ Allow merge commits: Optional
- ✅ Allow squash merging: Recommended (cleaner history)
- ✅ Allow rebase merging: Optional
- ✅ Automatically delete head branches: Recommended

## 4. Team/Access Settings

Navigate to: **Settings -> Manage access**

### Direct Access

- Remove any individual collaborators (use teams instead)
- Ensure only the designated owner has admin access

### Teams (if using GitHub Teams)

- Create a team for skill contributors (read/write access)
- Designated owner remains as individual admin
- CODEOWNERS file will enforce owner review regardless of team access

## 5. Environments (if using deployments)

If you add deployment workflows later:

Navigate to: **Settings -> Environments**

- Create `production` environment
- Add required reviewers (designated owner)
- Set protection rules as needed

## Verification Checklist

After completing setup, verify:

- Branch protection rule is active on `main`
- Secret scanning is enabled
- Push protection is enabled
- Dependabot alerts are enabled
- CODEOWNERS file is recognized (check it shows up in file browser with shield icon)
- Create a test PR to ensure CI checks run and owner review is required

## Maintenance

### Quarterly Review

- Review CODEOWNERS accuracy (if team changes)
- Check branch protection rules are still appropriate
- Review Dependabot alert settings
- Ensure required status checks are up to date

### Annual Review

- Review all security settings against GitHub's latest features
- Update documentation if workflow changes
- Audit access permissions

## Questions

For issues with these settings:

- GitHub Docs: [https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- GitHub Security: [https://docs.github.com/en/code-security](https://docs.github.com/en/code-security)

