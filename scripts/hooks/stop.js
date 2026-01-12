#!/usr/bin/env node

/**
 * Stop Hook
 * Handles orchestrator session end
 *
 * Actions:
 * - Save final state
 * - Create checkpoint if needed
 * - Log session summary
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const STATE_PATH = '.claude/orchestrator/state/project.json';
const CHECKPOINTS_PATH = '.claude/orchestrator/checkpoints';

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
  const dir = dirname(fullPath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  state.project.updated = new Date().toISOString();
  writeFileSync(fullPath, JSON.stringify(state, null, 2));
}

function createCheckpoint(state) {
  const checkpointsDir = join(process.cwd(), CHECKPOINTS_PATH);

  if (!existsSync(checkpointsDir)) {
    mkdirSync(checkpointsDir, { recursive: true });
  }

  const checkpointId = `cp-${Date.now()}`;
  const checkpointPath = join(checkpointsDir, `${checkpointId}.json`);

  const checkpoint = {
    id: checkpointId,
    timestamp: new Date().toISOString(),
    phase: state.phase,
    tasksCompleted: state.progress?.completed || 0,
    state: JSON.parse(JSON.stringify(state))
  };

  writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

  // Update state with checkpoint reference
  state.checkpoints = state.checkpoints || [];
  state.checkpoints.push({
    id: checkpointId,
    timestamp: checkpoint.timestamp,
    tasksCompleted: checkpoint.tasksCompleted
  });

  return checkpointId;
}

function main() {
  try {
    const state = loadState();
    if (!state) {
      // No orchestrator state, nothing to do
      console.log('No active orchestrator session');
      process.exit(0);
    }

    // Check if session was active
    if (state.status !== 'running' && state.status !== 'paused') {
      process.exit(0);
    }

    // Update status
    state.status = 'stopped';

    // Add history entry
    state.history = state.history || [];
    state.history.push({
      timestamp: new Date().toISOString(),
      action: 'session_stopped',
      details: {
        phase: state.phase,
        progress: state.progress
      }
    });

    // Create checkpoint on stop
    const checkpointId = createCheckpoint(state);
    console.log(`Checkpoint created: ${checkpointId}`);

    // Save final state
    saveState(state);

    // Log summary
    const progress = state.progress || { completed: 0, total: 0, percentage: 0 };
    console.log('\n=== Orchestrator Session Summary ===');
    console.log(`Phase: ${state.phase}`);
    console.log(`Progress: ${progress.completed}/${progress.total} tasks (${progress.percentage}%)`);
    console.log(`Status: Stopped`);
    console.log('====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Stop hook error:', error.message);
    process.exit(0);
  }
}

main();
