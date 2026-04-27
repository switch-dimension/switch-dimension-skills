#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPANY_REPO = 'switch-dimension/switch-dimension-skills';
const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SKILLS_DIR = join(REPO_ROOT, 'skills');

const args = process.argv.slice(2);

function usage(exitCode = 0) {
  const output = `
Usage:
  sd-skills list [--json] [--remote]
  sd-skills info <skill> [--json] [--remote]
  sd-skills install <skill> [--dry-run]
  sd-skills install --all [--dry-run]
  sd-skills propose <source> [--skill <skill>] [--branch <branch>] [--dry-run] [--force] [--keep-worktree]

Options:
  --json       Print machine-readable JSON for list/info.
  --remote     Read skill metadata through GitHub CLI instead of local files.
  --dry-run    Print install command(s) without running them.
  --skill      Select a skill from a source repository with multiple skills.
  --branch     Use a custom branch name for the proposal PR.
  --force      Replace an existing official skill during propose.
  --keep-worktree
               Keep the temporary skills repo checkout after propose.
  --color      Force colored output.
  --no-color   Disable colored output.
  -h, --help   Show this help.

Examples:
  sd-skills list
  sd-skills info project-log
  sd-skills install project-log
  sd-skills install --all --dry-run
  sd-skills propose my-skill
  sd-skills propose ~/work/my-skill-repo --skill my-skill
  sd-skills propose owner/skill-repo
`;

  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write(output.trimStart());
  process.exit(exitCode);
}

function fail(message, exitCode = 1) {
  console.error(`Error: ${message}`);
  process.exit(exitCode);
}

function hasFlag(flag) {
  return args.includes(flag);
}

function hasValueFlag(values, flag) {
  return values.includes(flag);
}

function getFlagValue(values, flag) {
  const index = values.indexOf(flag);
  if (index === -1) return null;

  const value = values[index + 1];
  if (!value || value.startsWith('-')) {
    fail(`${flag} requires a value`);
  }

  return value;
}

function color(value, code) {
  if (!shouldColor()) return value;
  return `\u001b[${code}m${value}\u001b[0m`;
}

function shouldColor() {
  if (hasFlag('--no-color')) return false;
  if (hasFlag('--color') || process.env.FORCE_COLOR) return true;
  if (process.env.NO_COLOR) return false;
  return Boolean(process.stdout.isTTY);
}

function stripFlags(values) {
  return values.filter(value => !value.startsWith('-'));
}

function parseFrontmatter(content, source) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) {
    fail(`${source} is missing YAML frontmatter`);
  }

  const metadata = {};
  const frontmatter = { metadata };
  let currentSection = null;

  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;

    const nestedMatch = line.match(/^  ([^:]+):\s*(.*)$/);
    if (nestedMatch && currentSection === 'metadata') {
      metadata[nestedMatch[1].trim()] = cleanValue(nestedMatch[2]);
      continue;
    }

    const topLevelMatch = line.match(/^([^:\s][^:]*):\s*(.*)$/);
    if (topLevelMatch) {
      const key = topLevelMatch[1].trim();
      const value = topLevelMatch[2];
      currentSection = value === '' ? key : null;

      if (key === 'metadata') {
        currentSection = 'metadata';
      } else {
        frontmatter[key] = cleanValue(value);
      }
    }
  }

  return frontmatter;
}

function cleanValue(value) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function readLocalSkills() {
  if (!existsSync(SKILLS_DIR)) {
    fail(`skills directory not found at ${SKILLS_DIR}`);
  }

  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => readLocalSkill(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readLocalSkill(skillName) {
  const skillPath = join(SKILLS_DIR, skillName, 'SKILL.md');
  if (!existsSync(skillPath)) {
    fail(`skill "${skillName}" does not exist in ${COMPANY_REPO}`);
  }

  const content = readFileSync(skillPath, 'utf8');
  return skillFromContent(content, skillName);
}

function readRemoteSkills() {
  const directories = ghJson(`repos/${COMPANY_REPO}/contents/skills`)
    .filter(entry => entry.type === 'dir')
    .map(entry => entry.name);

  return directories
    .map(skillName => readRemoteSkill(skillName))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readRemoteSkill(skillName) {
  const response = ghJson(`repos/${COMPANY_REPO}/contents/skills/${skillName}/SKILL.md`);
  const content = Buffer.from(response.content, 'base64').toString('utf8');
  return skillFromContent(content, skillName);
}

function ghJson(endpoint) {
  try {
    const output = execFileSync('gh', ['api', endpoint], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output);
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    fail(
      `could not read ${COMPANY_REPO} through GitHub CLI. Run "gh auth login" and try again.${stderr ? `\n${stderr}` : ''}`
    );
  }
}

function skillFromContent(content, fallbackName) {
  const frontmatter = parseFrontmatter(content, fallbackName);

  return {
    name: frontmatter.name || fallbackName,
    version: frontmatter.metadata?.version || '',
    description: frontmatter.description || '',
    deprecated: frontmatter.metadata?.deprecated || 'false',
  };
}

function getSkills() {
  return hasFlag('--remote') ? readRemoteSkills() : readLocalSkills();
}

function getSkill(skillName) {
  return hasFlag('--remote') ? readRemoteSkill(skillName) : readLocalSkill(skillName);
}

function printSkills(skills) {
  if (hasFlag('--json')) {
    console.log(JSON.stringify(skills, null, 2));
    return;
  }

  printSkillList(skills);
}

function printSkill(skill) {
  if (hasFlag('--json')) {
    console.log(JSON.stringify(skill, null, 2));
    return;
  }

  console.log(`${color(skill.name, '36;1')}@${color(skill.version || 'unknown', '32')}`);
  console.log('');
  console.log(skill.description || 'No description provided.');
}

function printSkillList(skills) {
  if (skills.length === 0) {
    console.log('No skills found.');
    return;
  }

  const nameWidth = Math.max('Skill'.length, ...skills.map(skill => skill.name.length));
  const versionWidth = Math.max('Version'.length, ...skills.map(skill => (skill.version || '-').length));
  const terminalWidth = process.stdout.columns || Number(process.env.COLUMNS) || 100;
  const gapWidth = 4;
  const descriptionWidth = Math.max(
    30,
    terminalWidth - nameWidth - versionWidth - gapWidth
  );

  console.log('');
  console.log(
    `${color('Skill'.padEnd(nameWidth), '36;1')}  ${color('Version'.padEnd(versionWidth), '32;1')}  ${color('Description', '1')}`
  );
  console.log(color(`${'-'.repeat(nameWidth)}  ${'-'.repeat(versionWidth)}  ${'-'.repeat(descriptionWidth)}`, '90'));

  for (const skill of skills) {
    const descriptionLines = wrapText(skill.description || 'No description provided.', descriptionWidth);
    const firstDescription = descriptionLines.shift() || '';

    console.log(
      `${color(skill.name.padEnd(nameWidth), '36')}  ${color((skill.version || '-').padEnd(versionWidth), '32')}  ${firstDescription}`
    );

    for (const line of descriptionLines) {
      console.log(`${''.padEnd(nameWidth)}  ${''.padEnd(versionWidth)}  ${line}`);
    }
  }
}

function wrapText(value, width) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    if (word.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(word);
      continue;
    }

    const nextLine = line ? `${line} ${word}` : word;
    if (nextLine.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function installSkills(skillNames) {
  const dryRun = hasFlag('--dry-run');

  for (const skillName of skillNames) {
    const command = ['npx', 'skills', 'add', COMPANY_REPO, '--skill', skillName];
    console.log(color(command.join(' '), '36'));

    if (dryRun) continue;

    const result = spawnSync(command[0], command.slice(1), {
      stdio: 'inherit',
      shell: false,
    });

    if (result.status !== 0) {
      fail(`install failed for "${skillName}"`, result.status || 1);
    }
  }
}

function parseProposeArgs(values) {
  const positional = [];
  const valueFlags = new Set(['--skill', '--branch']);

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value.startsWith('-')) {
      if (valueFlags.has(value)) index += 1;
      continue;
    }

    positional.push(value);
  }

  if (positional.length !== 1) usage(1);

  return {
    source: positional[0],
    requestedSkill: getFlagValue(values, '--skill'),
    branch: getFlagValue(values, '--branch'),
    dryRun: hasValueFlag(values, '--dry-run'),
    force: hasValueFlag(values, '--force'),
    keepWorktree: hasValueFlag(values, '--keep-worktree'),
  };
}

function proposeSkill(options) {
  const sourceTempDir = shouldCloneSource(options.source) ? cloneSource(options.source) : null;
  const sourceRoot = resolveSourceRoot(options.source, sourceTempDir);
  let proposalTempDir = null;

  try {
    const skillDir = resolveSkillDirectory(sourceRoot, options.requestedSkill);
    const skillName = readSkillName(skillDir);
    const branchName = options.branch || `feat/add-${skillName}`;

    if (options.dryRun) {
      printProposalPlan(skillDir, skillName, branchName);
      return;
    }

    proposalTempDir = mkdtempSync(join(tmpdir(), 'sd-skills-propose-'));
    const proposalRepoDir = join(proposalTempDir, 'repo');

    cloneCompanyRepo(proposalRepoDir);
    runCommand('git', ['checkout', '-b', branchName], proposalRepoDir);
    importSkill(skillDir, proposalRepoDir, skillName, options.force);
    runSkillValidation(proposalRepoDir);
    commitProposal(proposalRepoDir, skillName);

    const prUrl = publishProposal(proposalRepoDir, branchName, skillName);
    console.log(color(`Created proposal PR: ${prUrl}`, '32'));

    if (options.keepWorktree) {
      console.log(`Temporary checkout kept at ${proposalRepoDir}`);
    }
  } finally {
    if (sourceTempDir) {
      rmSync(sourceTempDir, { recursive: true, force: true });
    }

    if (proposalTempDir && !options.keepWorktree) {
      rmSync(proposalTempDir, { recursive: true, force: true });
    }
  }
}

function resolveSourceRoot(source, sourceTempDir) {
  if (sourceTempDir) return sourceTempDir;

  const sourcePath = resolve(expandHome(source));
  if (existsSync(sourcePath)) return sourcePath;

  const installedSkillPath = findInstalledSkill(source);
  if (installedSkillPath) return installedSkillPath;

  return sourcePath;
}

function findInstalledSkill(skillName) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(skillName)) return null;

  const candidates = [
    join(process.cwd(), '.cursor', 'skills', skillName),
    join(process.cwd(), '.claude', 'skills', skillName),
    join(process.cwd(), '.codex', 'skills', skillName),
    join(process.cwd(), 'skills', skillName),
    join(homedir(), '.cursor', 'skills', skillName),
    join(homedir(), '.claude', 'skills', skillName),
    join(homedir(), '.codex', 'skills', skillName),
  ];

  return candidates.find(candidate => existsSync(join(candidate, 'SKILL.md'))) || null;
}

function shouldCloneSource(source) {
  if (existsSync(resolve(expandHome(source)))) return false;
  return isRemoteSource(source);
}

function isRemoteSource(source) {
  return (
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source) ||
    source.startsWith('https://') ||
    source.startsWith('http://') ||
    source.startsWith('git@') ||
    source.endsWith('.git')
  );
}

function cloneSource(source) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'sd-skills-'));

  try {
    if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source)) {
      runCommand('gh', ['repo', 'clone', source, tempRoot, '--', '--depth=1']);
    } else {
      runCommand('git', ['clone', '--depth=1', source, tempRoot]);
    }
  } catch (error) {
    rmSync(tempRoot, { recursive: true, force: true });
    throw error;
  }

  return tempRoot;
}

function cloneCompanyRepo(destination) {
  runCommand('gh', ['repo', 'clone', COMPANY_REPO, destination, '--', '--depth=1']);
}

function importSkill(skillDir, proposalRepoDir, skillName, force) {
  const destination = join(proposalRepoDir, 'skills', skillName);

  if (existsSync(destination) && !force) {
    fail(`skill "${skillName}" already exists in ${COMPANY_REPO}. Use --force to replace it.`);
  }

  mkdirSync(join(proposalRepoDir, 'skills'), { recursive: true });

  if (existsSync(destination)) {
    rmSync(destination, { recursive: true, force: true });
  }

  cpSync(skillDir, destination, {
    recursive: true,
    filter: source => !source.split(/[\\/]/).includes('.git'),
  });

  console.log(color(`Imported skill "${skillName}" to skills/${skillName}`, '32'));
}

function expandHome(value) {
  if (value === '~') return homedir();
  if (value.startsWith('~/')) return join(homedir(), value.slice(2));
  return value;
}

function resolveSkillDirectory(sourceRoot, requestedSkill) {
  if (!existsSync(sourceRoot)) {
    fail(`source path not found: ${sourceRoot}`);
  }

  const sourcePath = statSync(sourceRoot).isFile() ? dirname(sourceRoot) : sourceRoot;
  if (existsSync(join(sourcePath, 'SKILL.md'))) {
    return sourcePath;
  }

  const candidatePaths = requestedSkill
    ? [join(sourcePath, 'skills', requestedSkill), join(sourcePath, requestedSkill)]
    : [];

  for (const candidatePath of candidatePaths) {
    if (existsSync(join(candidatePath, 'SKILL.md'))) {
      return candidatePath;
    }
  }

  const skillsRoot = join(sourcePath, 'skills');
  if (!existsSync(skillsRoot)) {
    fail(
      requestedSkill
        ? `could not find skill "${requestedSkill}" in ${sourcePath}`
        : `could not find SKILL.md or skills/ in ${sourcePath}`
    );
  }

  const skillDirs = readdirSync(skillsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(skillsRoot, entry.name, 'SKILL.md')))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (requestedSkill) {
    fail(`could not find skill "${requestedSkill}" in ${skillsRoot}`);
  }

  if (skillDirs.length === 0) {
    fail(`no skill directories with SKILL.md found in ${skillsRoot}`);
  }

  if (skillDirs.length > 1) {
    fail(`source has multiple skills: ${skillDirs.join(', ')}. Re-run with --skill <skill>.`);
  }

  return join(skillsRoot, skillDirs[0]);
}

function readSkillName(skillDir) {
  const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
  const frontmatter = parseFrontmatter(content, join(skillDir, 'SKILL.md'));
  return frontmatter.name || basename(skillDir);
}

function runSkillValidation(repoRoot) {
  const result = spawnSync(process.execPath, ['scripts/lint-skills.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    fail('skill validation failed', result.status || 1);
  }
}

function commitProposal(repoRoot, skillName) {
  runCommand('git', ['add', join('skills', skillName)], repoRoot);

  const diffResult = spawnSync('git', ['diff', '--cached', '--quiet'], {
    cwd: repoRoot,
    stdio: 'ignore',
    shell: false,
  });

  if (diffResult.status === 0) {
    fail(`no changes to propose for skill "${skillName}"`);
  }

  const message = `feat(skills): add ${skillName} skill\n\nProposes ${skillName} for review and inclusion in ${COMPANY_REPO}.`;
  runCommand('git', ['commit', '-m', message], repoRoot);
}

function publishProposal(repoRoot, branchName, skillName) {
  let head = branchName;
  console.log(`Pushing proposal branch to ${COMPANY_REPO}...`);

  const pushResult = tryRunCommand('git', ['push', '-u', 'origin', 'HEAD'], repoRoot);

  if (pushResult.status !== 0) {
    console.log('Direct push failed. Falling back to a personal fork.');
    head = pushToFork(repoRoot, branchName);
  }

  console.log(`Opening pull request from ${head} into ${COMPANY_REPO}:main...`);

  const title = `feat(skills): add ${skillName} skill`;
  const body = `Adds ${skillName} for review and inclusion in ${COMPANY_REPO}.\n\nGenerated with \`sd-skills propose\`.`;

  return commandOutput(
    'gh',
    ['pr', 'create', '--repo', COMPANY_REPO, '--base', 'main', '--head', head, '--title', title, '--body', body],
    repoRoot
  );
}

function pushToFork(repoRoot, branchName) {
  const login = commandOutput('gh', ['api', 'user', '--jq', '.login'], repoRoot);
  const repoName = COMPANY_REPO.split('/')[1];
  const forkRepo = `${login}/${repoName}`;

  ensureFork(repoRoot, forkRepo);
  setForkRemote(repoRoot, forkRepo);
  runCommand('git', ['push', '-u', 'fork', `HEAD:${branchName}`], repoRoot);

  return `${login}:${branchName}`;
}

function ensureFork(repoRoot, forkRepo) {
  if (tryRunCommandSilent('gh', ['repo', 'view', forkRepo], repoRoot).status === 0) {
    console.log(`Using existing fork ${forkRepo}.`);
    return;
  }

  console.log(`Creating fork ${forkRepo}...`);
  runCommand('gh', ['repo', 'fork', COMPANY_REPO, '--clone=false'], repoRoot);

  if (tryRunCommandSilent('gh', ['repo', 'view', forkRepo], repoRoot).status !== 0) {
    fail(`could not verify fork ${forkRepo}`);
  }
}

function setForkRemote(repoRoot, forkRepo) {
  const forkUrl = `https://github.com/${forkRepo}.git`;

  if (tryRunCommandSilent('git', ['remote', 'get-url', 'fork'], repoRoot).status === 0) {
    runCommand('git', ['remote', 'set-url', 'fork', forkUrl], repoRoot);
    return;
  }

  runCommand('git', ['remote', 'add', 'fork', forkUrl], repoRoot);
}

function printProposalPlan(skillDir, skillName, branchName) {
  console.log('');
  console.log(color('Proposal plan', '36;1'));
  console.log(`1. Read skill from ${skillDir}`);
  console.log(`2. Clone ${COMPANY_REPO} into a temporary checkout`);
  console.log(`3. Create branch ${branchName}`);
  console.log(`4. Copy the skill to skills/${skillName}/`);
  console.log('5. Run node scripts/lint-skills.mjs');
  console.log('6. Commit the proposal');
  console.log('7. Push to the official repo, or fall back to a personal fork if needed');
  console.log('8. Open a pull request, then delete the temporary checkout');
}

function runCommand(command, commandArgs, cwd = process.cwd()) {
  const result = tryRunCommand(command, commandArgs, cwd);

  if (result.status !== 0) {
    fail(`${command} ${commandArgs.join(' ')} failed`, result.status || 1);
  }

  return result;
}

function tryRunCommand(command, commandArgs, cwd = process.cwd()) {
  return spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });
}

function tryRunCommandSilent(command, commandArgs, cwd = process.cwd()) {
  return spawnSync(command, commandArgs, {
    cwd,
    stdio: 'ignore',
    shell: false,
  });
}

function commandOutput(command, commandArgs, cwd = process.cwd()) {
  try {
    return execFileSync(command, commandArgs, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    fail(`${command} ${commandArgs.join(' ')} failed${stderr ? `\n${stderr}` : ''}`);
  }
}

function main() {
  if (args.length === 0 || hasFlag('--help') || hasFlag('-h')) {
    usage(0);
  }

  const [command] = args;
  const positional = stripFlags(args.slice(1));

  if (command === 'list') {
    printSkills(getSkills());
    return;
  }

  if (command === 'info') {
    const [skillName] = positional;
    if (!skillName) usage(1);
    printSkill(getSkill(skillName));
    return;
  }

  if (command === 'install') {
    const installAll = hasFlag('--all');
    const skillNames = installAll ? getSkills().map(skill => skill.name) : positional;

    if (skillNames.length === 0) usage(1);
    installSkills(skillNames);
    return;
  }

  if (command === 'propose') {
    proposeSkill(parseProposeArgs(args.slice(1)));
    return;
  }

  if (command === 'repo') {
    console.log(COMPANY_REPO);
    return;
  }

  fail(`unknown command "${command}"`);
}

main();
