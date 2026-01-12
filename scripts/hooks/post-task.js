#!/usr/bin/env node

/**
 * Post-Task Hook
 * Updates orchestrator state after task delegation completes
 *
 * Actions:
 * - Log task completion
 * - Update progress metrics
 * - Check if checkpoint needed
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const STATE_PATH = '.claude/orchestrator/state/project.json';

function loadState() {
  const fullPath = join(process.cwd(), STATE_PATH);
  if (!existsSync(fullPath)) {
    return null;
  }

  try {
    const raw = readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  const fullPath = join(process.cwd(), STATE_PATH);
  state.project.updated = new Date().toISOString();
  writeFileSync(fullPath, JSON.stringify(state, null, 2));
}

function updateProgress(state) {
  const tasks = state.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const skipped = tasks.filter(t => t.status === 'skipped').length;

  state.progress = {
    total,
    completed,
    inProgress,
    blocked,
    skipped,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

function main() {
  try {
    const state = loadState();
    if (!state) {
      // No orchestrator state, nothing to update
      process.exit(0);
    }

    // Update progress
    updateProgress(state);

    // Add history entry
    state.history = state.history || [];
    state.history.push({
      timestamp: new Date().toISOString(),
      action: 'task_delegation_completed',
      details: {
        progress: state.progress
      }
    });

    // Check if checkpoint needed
    const checkpointFreq = state.config?.checkpointFrequency || 5;
    const lastCheckpoint = state.checkpoints?.[state.checkpoints.length - 1];
    const tasksSinceCheckpoint = lastCheckpoint
      ? state.progress.completed - lastCheckpoint.tasksCompleted
      : state.progress.completed;

    if (tasksSinceCheckpoint >= checkpointFreq) {
      console.log(`Checkpoint recommended: ${state.progress.completed} tasks completed`);
    }

    // Save updated state
    saveState(state);

    // Log progress
    console.log(`Progress: ${state.progress.completed}/${state.progress.total} (${state.progress.percentage}%)`);

    process.exit(0);
  } catch (error) {
    console.error('Post-task hook error:', error.message);
    process.exit(0);
  }
}

main();
