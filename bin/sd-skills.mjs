#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPANY_REPO = 'switch-dimension/switch-dimension-skills';
const SKILLS_DIR = resolve(fileURLToPath(new URL('../skills', import.meta.url)));

const args = process.argv.slice(2);

function usage(exitCode = 0) {
  const output = `
Usage:
  sd-skills list [--json] [--remote]
  sd-skills info <skill> [--json] [--remote]
  sd-skills install <skill> [--dry-run]
  sd-skills install --all [--dry-run]

Options:
  --json       Print machine-readable JSON for list/info.
  --remote     Read skill metadata through GitHub CLI instead of local files.
  --dry-run    Print install command(s) without running them.
  -h, --help   Show this help.

Examples:
  sd-skills list
  sd-skills info project-log
  sd-skills install project-log
  sd-skills install --all --dry-run
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

  const rows = skills.map(skill => ({
    name: skill.name,
    version: skill.version || '-',
    description: summarize(skill.description, 100),
  }));

  printTable(rows, ['name', 'version', 'description']);
}

function printSkill(skill) {
  if (hasFlag('--json')) {
    console.log(JSON.stringify(skill, null, 2));
    return;
  }

  console.log(`${skill.name}@${skill.version || 'unknown'}`);
  console.log('');
  console.log(skill.description || 'No description provided.');
}

function printTable(rows, columns) {
  if (rows.length === 0) {
    console.log('No skills found.');
    return;
  }

  const widths = Object.fromEntries(
    columns.map(column => [
      column,
      Math.max(column.length, ...rows.map(row => String(row[column] ?? '').length)),
    ])
  );

  console.log(columns.map(column => column.padEnd(widths[column])).join('  '));
  console.log(columns.map(column => '-'.repeat(widths[column])).join('  '));

  for (const row of rows) {
    console.log(columns.map(column => String(row[column] ?? '').padEnd(widths[column])).join('  '));
  }
}

function summarize(value, maxLength) {
  if (!value || value.length <= maxLength) return value || '';
  return `${value.slice(0, maxLength - 3)}...`;
}

function installSkills(skillNames) {
  const dryRun = hasFlag('--dry-run');

  for (const skillName of skillNames) {
    const command = ['npx', 'skills', 'add', COMPANY_REPO, '--skill', skillName];
    console.log(command.join(' '));

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

  if (command === 'repo') {
    console.log(COMPANY_REPO);
    return;
  }

  fail(`unknown command "${command}"`);
}

main();
