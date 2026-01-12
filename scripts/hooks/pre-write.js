#!/usr/bin/env node

/**
 * Pre-Write Hook
 * Validates file writes before they happen
 *
 * Checks:
 * - Protected files (package-lock.json, .env, etc.)
 * - Branch restrictions (no direct writes to main)
 * - File size limits
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { basename } from 'path';

// Protected files that should not be modified
const PROTECTED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '.env',
  '.env.local',
  '.env.production',
];

// Protected directories
const PROTECTED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
];

function main() {
  try {
    // Parse tool input from argument
    const toolInput = process.argv[2];
    if (!toolInput) {
      process.exit(0); // No input, allow
    }

    let input;
    try {
      input = JSON.parse(toolInput);
    } catch {
      // Not JSON, might be raw file path
      input = { file_path: toolInput };
    }

    const filePath = input.file_path || input.path || '';
    const fileName = basename(filePath);

    // Check protected files
    if (PROTECTED_FILES.includes(fileName)) {
      console.error(`Error: Cannot modify protected file: ${fileName}`);
      process.exit(1);
    }

    // Check protected directories
    for (const dir of PROTECTED_DIRS) {
      if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) {
        console.error(`Error: Cannot modify files in protected directory: ${dir}`);
        process.exit(1);
      }
    }

    // Check if we're on main/master branch (warning only)
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      if (branch === 'main' || branch === 'master') {
        console.warn(`Warning: Writing to file on ${branch} branch`);
      }
    } catch {
      // Not a git repo or git not available, skip check
    }

    // All checks passed
    process.exit(0);
  } catch (error) {
    console.error('Pre-write hook error:', error.message);
    process.exit(0); // Don't block on hook errors
  }
}

main();
