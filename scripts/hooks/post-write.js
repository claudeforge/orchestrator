#!/usr/bin/env node

/**
 * Post-Write Hook
 * Runs after file writes to maintain code quality
 *
 * Actions:
 * - Format code with Prettier
 * - Run ESLint with auto-fix
 * - Type-check TypeScript files
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { extname, dirname } from 'path';

// File extensions to process
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const STYLE_EXTENSIONS = ['.css', '.scss', '.less'];
const DATA_EXTENSIONS = ['.json', '.yaml', '.yml'];
const DOC_EXTENSIONS = ['.md', '.mdx'];

function runCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 30000 // 30 second timeout
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

function findProjectRoot(startPath) {
  let current = startPath;
  while (current !== dirname(current)) {
    if (existsSync(`${current}/package.json`)) {
      return current;
    }
    current = dirname(current);
  }
  return process.cwd();
}

function main() {
  try {
    // Parse tool input from argument
    const toolInput = process.argv[2];
    if (!toolInput) {
      process.exit(0);
    }

    let input;
    try {
      input = JSON.parse(toolInput);
    } catch {
      input = { file_path: toolInput };
    }

    const filePath = input.file_path || input.path || '';
    if (!filePath || !existsSync(filePath)) {
      process.exit(0);
    }

    const ext = extname(filePath).toLowerCase();
    const projectRoot = findProjectRoot(dirname(filePath));
    const results = [];

    // Check if Prettier is available
    const hasPrettier = existsSync(`${projectRoot}/node_modules/.bin/prettier`);

    // Check if ESLint is available
    const hasESLint = existsSync(`${projectRoot}/node_modules/.bin/eslint`);

    // Format code files
    if ([...CODE_EXTENSIONS, ...STYLE_EXTENSIONS, ...DATA_EXTENSIONS, ...DOC_EXTENSIONS].includes(ext)) {
      if (hasPrettier) {
        const result = runCommand(`npx prettier --write "${filePath}"`, projectRoot);
        if (result.success) {
          results.push('Formatted with Prettier');
        }
      }
    }

    // Lint JavaScript/TypeScript files
    if (CODE_EXTENSIONS.includes(ext)) {
      if (hasESLint) {
        const result = runCommand(`npx eslint --fix "${filePath}"`, projectRoot);
        if (result.success) {
          results.push('Linted with ESLint');
        } else if (result.stderr) {
          console.warn('ESLint warnings:', result.stderr);
        }
      }
    }

    // Type-check TypeScript files (non-blocking)
    if (['.ts', '.tsx'].includes(ext)) {
      const hasTsc = existsSync(`${projectRoot}/node_modules/.bin/tsc`);
      if (hasTsc) {
        const result = runCommand(`npx tsc --noEmit`, projectRoot);
        if (!result.success && result.stderr) {
          console.warn('TypeScript errors detected (non-blocking)');
        } else {
          results.push('TypeScript check passed');
        }
      }
    }

    // Log results
    if (results.length > 0) {
      console.log(`Post-write: ${results.join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Post-write hook error:', error.message);
    process.exit(0); // Don't block on hook errors
  }
}

main();
