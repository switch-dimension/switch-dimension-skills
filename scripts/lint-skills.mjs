#!/usr/bin/env node
/**
 * Skill linting script for CI
 * Validates SKILL.md files and checks for security issues in skill content
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const SKILLS_DIR = './skills';
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Patterns that indicate unsafe operations in skills
const UNSAFE_PATTERNS = [
  // Remote execution patterns
  { pattern: /curl\s+[^|]*\|\s*(sh|bash|zsh)/i, desc: 'curl | shell execution' },
  { pattern: /wget\s+[^|]*\|\s*(sh|bash|zsh)/i, desc: 'wget | shell execution' },
  { pattern: /fetch\s*\(.*\)\s*\.then.*eval/i, desc: 'fetch + eval pattern' },
  // Code execution
  { pattern: /eval\s*\(/i, desc: 'eval() usage' },
  { pattern: /new\s+Function\s*\(/i, desc: 'new Function() usage' },
  { pattern: /child_process/, desc: 'child_process import' },
  { pattern: /exec\s*\(/i, desc: 'exec() usage' },
  { pattern: /execSync/i, desc: 'execSync usage' },
  { pattern: /spawn/i, desc: 'spawn usage' },
  // Network requests without context
  { pattern: /fetch\s*\(\s*['"`]/i, desc: 'fetch() call' },
  { pattern: /axios|request\s*\(/i, desc: 'HTTP client usage' },
  // Potentially dangerous file operations
  { pattern: /fs\.writeFile.*process\.env/i, desc: 'writing env vars to files' },
  { pattern: /rm\s+-rf/i, desc: 'rm -rf command' },
];

// Secret/credential patterns to flag
const SECRET_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"`][a-zA-Z0-9_-]{16,}/i,
  /password\s*[:=]\s*['"`][^'"`]{8,}/i,
  /token\s*[:=]\s*['"`][a-zA-Z0-9_-]{16,}/i,
  /secret\s*[:=]\s*['"`][a-zA-Z0-9_-]{8,}/i,
  /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/, // AWS access key
  /gh[pousr]_[A-Za-z0-9_]{36,}/, // GitHub token
];

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

let exitCode = EXIT_SUCCESS;
const errors = [];
const warnings = [];

function reportError(message) {
  errors.push(message);
  exitCode = EXIT_FAILURE;
}

function reportWarning(message) {
  warnings.push(message);
}

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * Check if content contains unsafe patterns
 */
function checkUnsafePatterns(content, skillPath) {
  for (const { pattern, desc } of UNSAFE_PATTERNS) {
    if (pattern.test(content)) {
      reportWarning(`${skillPath}: Potentially unsafe pattern detected - ${desc}`);
      reportWarning(`  Review manually: ${pattern.toString()}`);
    }
  }
}

/**
 * Check for potential secrets in content
 */
function checkSecrets(content, skillPath) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      reportError(`${skillPath}: Potential secret/credential detected matching ${pattern.toString()}`);
    }
  }
}

/**
 * Validate a single skill directory
 */
function validateSkill(skillDir) {
  const skillName = basename(skillDir);
  const skillPath = join(skillDir, 'SKILL.md');

  console.log(`\n📋 Validating skill: ${skillName}`);

  // Check SKILL.md exists
  if (!existsSync(skillPath)) {
    reportError(`${skillPath}: SKILL.md not found`);
    return;
  }

  // Read and parse SKILL.md
  const content = readFileSync(skillPath, 'utf8');

  // Check for secrets
  checkSecrets(content, skillPath);

  // Check for unsafe patterns
  checkUnsafePatterns(content, skillPath);

  // Parse frontmatter
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) {
    reportError(`${skillPath}: Missing or invalid YAML frontmatter`);
    return;
  }

  // Validate required fields
  if (!frontmatter.name) {
    reportError(`${skillPath}: Missing required field 'name' in frontmatter`);
  } else if (frontmatter.name !== skillName) {
    reportError(
      `${skillPath}: Frontmatter 'name' (${frontmatter.name}) does not match directory name (${skillName})`
    );
  }

  if (!frontmatter.description) {
    reportError(`${skillPath}: Missing required field 'description' in frontmatter`);
  } else {
    // Check description format (should be third person)
    if (frontmatter.description.match(/\b(I|me|my)\b/i)) {
      reportWarning(
        `${skillPath}: Description should be third person (avoid 'I', 'me', 'my')`
      );
    }

    // Check description includes trigger terms
    if (frontmatter.description.length < 20) {
      reportWarning(`${skillPath}: Description seems too short, consider adding trigger terms`);
    }
  }

  if (!frontmatter.version) {
    reportError(`${skillPath}: Missing required field 'metadata.version' in frontmatter`);
  } else if (!SEMVER_PATTERN.test(frontmatter.version)) {
    reportError(
      `${skillPath}: metadata.version must use SemVer format like "1.0.0"`
    );
  }

  // Check for scripts directory and validate any scripts
  const scriptsDir = join(skillDir, 'scripts');
  if (existsSync(scriptsDir)) {
    try {
      const scripts = readdirSync(scriptsDir);
      for (const script of scripts) {
        const scriptPath = join(scriptsDir, script);
        const scriptContent = readFileSync(scriptPath, 'utf8');
        checkSecrets(scriptContent, scriptPath);
        checkUnsafePatterns(scriptContent, scriptPath);
      }
    } catch (err) {
      reportWarning(`${scriptsDir}: Could not read scripts directory`);
    }
  }

  console.log(`  ✓ ${skillName} validated`);
}

/**
 * Main entry point
 */
function main() {
  console.log('🔍 Running skill validation...\n');

  // Check if skills directory exists
  if (!existsSync(SKILLS_DIR)) {
    console.log('ℹ️  No skills directory found, skipping validation');
    process.exit(EXIT_SUCCESS);
  }

  // Get all skill directories
  let skillDirs;
  try {
    skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => join(SKILLS_DIR, dirent.name));
  } catch (err) {
    console.error('❌ Error reading skills directory:', err.message);
    process.exit(EXIT_FAILURE);
  }

  if (skillDirs.length === 0) {
    console.log('ℹ️  No skills found in directory');
    process.exit(EXIT_SUCCESS);
  }

  // Validate each skill
  for (const skillDir of skillDirs) {
    validateSkill(skillDir);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Summary');
  console.log('='.repeat(50));
  console.log(`Skills checked: ${skillDirs.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (exitCode === EXIT_SUCCESS) {
    console.log('\n✅ All skills passed validation!');
  } else {
    console.log('\n❌ Validation failed. Please fix errors above.');
  }

  process.exit(exitCode);
}

main();
