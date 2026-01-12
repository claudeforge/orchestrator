import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  type ProjectState,
  type Task,
  type TaskStatus,
  type Phase,
  type Decision,
  type Checkpoint,
  type HistoryEntry,
  type Progress,
  type TechStack,
  type CurrentTask,
  type Blocker,
  ProjectStateSchema,
  TaskFileSchema,
  type TaskFile,
} from './types.js';

// Default paths
const STATE_DIR = '.claude/orchestrator/state';
const PROJECT_STATE_FILE = 'project.json';
const TASKS_FILE = 'tasks.json';
const CHECKPOINTS_DIR = '.claude/orchestrator/checkpoints';

/**
 * State Manager - Core state persistence for the orchestrator
 */
export class StateManager {
  private basePath: string;
  private statePath: string;
  private tasksPath: string;
  private checkpointsPath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
    this.statePath = join(basePath, STATE_DIR, PROJECT_STATE_FILE);
    this.tasksPath = join(basePath, STATE_DIR, TASKS_FILE);
    this.checkpointsPath = join(basePath, CHECKPOINTS_DIR);
  }

  /**
   * Check if a project state exists
   */
  exists(): boolean {
    return existsSync(this.statePath);
  }

  /**
   * Initialize a new project state
   */
  initialize(
    name: string,
    description: string,
    slug?: string
  ): ProjectState {
    const now = new Date().toISOString();
    const projectSlug = slug || this.slugify(name);

    const state: ProjectState = {
      $schema: 'orchestrator-state-v1',
      project: {
        id: uuidv4(),
        name,
        slug: projectSlug,
        description,
        created: now,
        updated: now,
        version: '0.1.0',
      },
      phase: 'ideation',
      phases: {
        ideation: { status: 'in_progress', startedAt: now, completedAt: null },
        specification: { status: 'pending', startedAt: null, completedAt: null },
        architecture: { status: 'pending', startedAt: null, completedAt: null },
        planning: { status: 'pending', startedAt: null, completedAt: null },
        implementation: { status: 'pending', startedAt: null, completedAt: null },
        testing: { status: 'pending', startedAt: null, completedAt: null },
        deployment: { status: 'pending', startedAt: null, completedAt: null },
        complete: { status: 'pending', startedAt: null, completedAt: null },
      },
      tasks: [],
      currentTasks: [],
      progress: {
        total: 0,
        completed: 0,
        inProgress: 0,
        blocked: 0,
        skipped: 0,
        percentage: 0,
      },
      blockers: [],
      decisions: [],
      checkpoints: [],
      history: [
        {
          timestamp: now,
          action: 'project_initialized',
          details: { name, description },
        },
      ],
      config: {
        autonomyLevel: 'high',
        checkpointFrequency: 5,
        autoCommit: true,
        maxParallelTasks: 3,
        maxRetries: 3,
      },
    };

    this.save(state);
    return state;
  }

  /**
   * Load project state from disk
   */
  load(): ProjectState {
    if (!this.exists()) {
      throw new Error(
        'No project state found. Run /orchestrator:start to initialize a project.'
      );
    }

    const raw = readFileSync(this.statePath, 'utf-8');
    const data = JSON.parse(raw);
    return ProjectStateSchema.parse(data);
  }

  /**
   * Save project state to disk
   */
  save(state: ProjectState): void {
    // Update timestamp
    state.project.updated = new Date().toISOString();

    // Ensure directory exists
    const dir = dirname(this.statePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Validate before saving
    const validated = ProjectStateSchema.parse(state);
    writeFileSync(this.statePath, JSON.stringify(validated, null, 2));
  }

  /**
   * Load tasks file
   */
  loadTasks(): TaskFile | null {
    if (!existsSync(this.tasksPath)) {
      return null;
    }

    const raw = readFileSync(this.tasksPath, 'utf-8');
    const data = JSON.parse(raw);
    return TaskFileSchema.parse(data);
  }

  /**
   * Save tasks file
   */
  saveTasks(tasks: TaskFile): void {
    const dir = dirname(this.tasksPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const validated = TaskFileSchema.parse(tasks);
    writeFileSync(this.tasksPath, JSON.stringify(validated, null, 2));
  }

  // ============================================
  // Phase Management
  // ============================================

  /**
   * Transition to a new phase
   */
  transitionPhase(state: ProjectState, newPhase: Phase): ProjectState {
    const now = new Date().toISOString();
    const currentPhase = state.phase;

    // Complete current phase
    if (state.phases[currentPhase]) {
      state.phases[currentPhase].status = 'complete';
      state.phases[currentPhase].completedAt = now;
    }

    // Start new phase
    state.phase = newPhase;
    if (state.phases[newPhase]) {
      state.phases[newPhase].status = 'in_progress';
      state.phases[newPhase].startedAt = now;
    }

    // Log transition
    this.addHistory(state, 'phase_transition', undefined, undefined, {
      from: currentPhase,
      to: newPhase,
    });

    return state;
  }

  // ============================================
  // Task Management
  // ============================================

  /**
   * Get the next task to execute
   */
  getNextTask(state: ProjectState): Task | null {
    const pendingTasks = state.tasks.filter(
      (t) => t.status === 'pending' && this.areDependenciesMet(state, t)
    );

    if (pendingTasks.length === 0) return null;

    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    pendingTasks.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return pendingTasks[0];
  }

  /**
   * Get tasks that can be executed in parallel
   */
  getParallelizableTasks(
    state: ProjectState,
    maxTasks: number = 3
  ): Task[] {
    const pendingTasks = state.tasks.filter(
      (t) => t.status === 'pending' && this.areDependenciesMet(state, t)
    );

    // Group by agent to prefer task diversity
    const byAgent = new Map<string, Task[]>();
    for (const task of pendingTasks) {
      const tasks = byAgent.get(task.agent) || [];
      tasks.push(task);
      byAgent.set(task.agent, tasks);
    }

    // Pick one task per agent type (for diversity)
    const selected: Task[] = [];
    for (const [, tasks] of byAgent) {
      if (selected.length >= maxTasks) break;

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      tasks.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      // Check for file conflicts with already selected
      const task = tasks.find((t) => !this.hasFileConflict(selected, t));
      if (task) {
        selected.push(task);
      }
    }

    return selected;
  }

  /**
   * Check if task dependencies are met
   */
  private areDependenciesMet(state: ProjectState, task: Task): boolean {
    for (const depId of task.dependencies) {
      const dep = state.tasks.find((t) => t.id === depId);
      if (!dep || dep.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  /**
   * Check for potential file conflicts
   */
  private hasFileConflict(selectedTasks: Task[], newTask: Task): boolean {
    const newOutputs = new Set(newTask.outputs);
    for (const task of selectedTasks) {
      for (const output of task.outputs) {
        if (newOutputs.has(output)) return true;
      }
    }
    return false;
  }

  /**
   * Start a task
   */
  startTask(state: ProjectState, taskId: string): Task | null {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const now = new Date().toISOString();
    task.status = 'in_progress';
    task.startedAt = now;
    task.attempts += 1;

    // Add to current tasks
    state.currentTasks.push({
      id: taskId,
      agent: task.agent,
      startedAt: now,
      attempt: task.attempts,
    });

    this.updateProgress(state);
    this.addHistory(state, 'task_started', task.agent, taskId, {
      attempt: task.attempts,
    });

    return task;
  }

  /**
   * Complete a task
   */
  completeTask(state: ProjectState, taskId: string): Task | null {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const now = new Date().toISOString();
    task.status = 'completed';
    task.completedAt = now;
    task.error = null;

    // Calculate actual time
    if (task.startedAt) {
      const start = new Date(task.startedAt).getTime();
      const end = new Date(now).getTime();
      task.actualMinutes = Math.round((end - start) / 60000);
    }

    // Remove from current tasks
    state.currentTasks = state.currentTasks.filter((ct) => ct.id !== taskId);

    this.updateProgress(state);
    this.addHistory(state, 'task_completed', task.agent, taskId, {
      actualMinutes: task.actualMinutes,
    });

    return task;
  }

  /**
   * Fail a task
   */
  failTask(
    state: ProjectState,
    taskId: string,
    error: string
  ): Task | null {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.error = error;

    // Check if max attempts reached
    if (task.attempts >= task.maxAttempts) {
      task.status = 'blocked';
      state.blockers.push({
        taskId,
        reason: error,
        since: new Date().toISOString(),
        attempts: task.attempts,
      });
    } else {
      // Reset to pending for retry
      task.status = 'pending';
    }

    // Remove from current tasks
    state.currentTasks = state.currentTasks.filter((ct) => ct.id !== taskId);

    this.updateProgress(state);
    this.addHistory(state, 'task_failed', task.agent, taskId, {
      error,
      attempt: task.attempts,
      willRetry: task.status === 'pending',
    });

    return task;
  }

  /**
   * Add tasks to state
   */
  addTasks(state: ProjectState, tasks: Task[]): void {
    state.tasks.push(...tasks);
    this.updateProgress(state);
  }

  // ============================================
  // Progress & Metrics
  // ============================================

  /**
   * Update progress metrics
   */
  updateProgress(state: ProjectState): void {
    const tasks = state.tasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const blocked = tasks.filter((t) => t.status === 'blocked').length;
    const skipped = tasks.filter((t) => t.status === 'skipped').length;

    state.progress = {
      total,
      completed,
      inProgress,
      blocked,
      skipped,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  // ============================================
  // Decisions
  // ============================================

  /**
   * Record a decision
   */
  addDecision(
    state: ProjectState,
    topic: string,
    decision: string,
    rationale: string,
    decidedBy: Task['agent'],
    alternatives?: string[]
  ): Decision {
    const record: Decision = {
      id: `DEC-${String(state.decisions.length + 1).padStart(3, '0')}`,
      topic,
      decision,
      rationale,
      alternatives,
      decidedAt: new Date().toISOString(),
      decidedBy,
    };

    state.decisions.push(record);
    this.addHistory(state, 'decision_made', decidedBy, undefined, {
      topic,
      decision,
    });

    return record;
  }

  // ============================================
  // Checkpoints
  // ============================================

  /**
   * Create a checkpoint
   */
  createCheckpoint(
    state: ProjectState,
    gitCommit?: string,
    description?: string
  ): Checkpoint {
    const checkpoint: Checkpoint = {
      id: `CP-${String(state.checkpoints.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      phase: state.phase,
      tasksCompleted: state.progress.completed,
      gitCommit,
      description,
    };

    state.checkpoints.push(checkpoint);

    // Save checkpoint state
    if (!existsSync(this.checkpointsPath)) {
      mkdirSync(this.checkpointsPath, { recursive: true });
    }
    const checkpointFile = join(this.checkpointsPath, `${checkpoint.id}.json`);
    writeFileSync(checkpointFile, JSON.stringify(state, null, 2));

    this.addHistory(state, 'checkpoint_created', undefined, undefined, {
      checkpointId: checkpoint.id,
      tasksCompleted: checkpoint.tasksCompleted,
    });

    return checkpoint;
  }

  /**
   * Restore from checkpoint
   */
  restoreCheckpoint(checkpointId: string): ProjectState {
    const checkpointFile = join(this.checkpointsPath, `${checkpointId}.json`);
    if (!existsSync(checkpointFile)) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    const raw = readFileSync(checkpointFile, 'utf-8');
    const data = JSON.parse(raw);
    const state = ProjectStateSchema.parse(data);

    // Log restoration
    this.addHistory(state, 'checkpoint_restored', undefined, undefined, {
      checkpointId,
    });

    this.save(state);
    return state;
  }

  // ============================================
  // Tech Stack
  // ============================================

  /**
   * Set tech stack
   */
  setTechStack(state: ProjectState, techStack: TechStack): void {
    state.techStack = techStack;
    this.addHistory(state, 'tech_stack_set', 'architect', undefined, techStack);
  }

  // ============================================
  // History
  // ============================================

  /**
   * Add history entry
   */
  addHistory(
    state: ProjectState,
    action: string,
    agent?: Task['agent'],
    taskId?: string,
    details?: Record<string, unknown>
  ): void {
    const entry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      action,
      agent,
      taskId,
      details,
    };
    state.history.push(entry);
  }

  // ============================================
  // Utilities
  // ============================================

  /**
   * Convert string to slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Check if all tasks are complete
   */
  isComplete(state: ProjectState): boolean {
    return (
      state.tasks.length > 0 &&
      state.tasks.every(
        (t) => t.status === 'completed' || t.status === 'skipped'
      )
    );
  }

  /**
   * Should create checkpoint based on completed task count
   */
  shouldCheckpoint(state: ProjectState): boolean {
    const freq = state.config?.checkpointFrequency || 5;
    const lastCheckpoint = state.checkpoints[state.checkpoints.length - 1];
    const tasksSinceCheckpoint = lastCheckpoint
      ? state.progress.completed - lastCheckpoint.tasksCompleted
      : state.progress.completed;

    return tasksSinceCheckpoint >= freq;
  }

  /**
   * Get state summary for display
   */
  getSummary(state: ProjectState): string {
    const lines: string[] = [
      `## ${state.project.name}`,
      '',
      `**Phase:** ${state.phase}`,
      `**Progress:** ${state.progress.completed}/${state.progress.total} tasks (${state.progress.percentage}%)`,
      '',
    ];

    if (state.progress.inProgress > 0) {
      lines.push(`**In Progress:** ${state.progress.inProgress} tasks`);
    }
    if (state.progress.blocked > 0) {
      lines.push(`**Blocked:** ${state.progress.blocked} tasks`);
    }

    if (state.currentTasks.length > 0) {
      lines.push('', '### Current Tasks');
      for (const ct of state.currentTasks) {
        const task = state.tasks.find((t) => t.id === ct.id);
        if (task) {
          lines.push(`- [${ct.id}] ${task.title} (${ct.agent})`);
        }
      }
    }

    if (state.blockers.length > 0) {
      lines.push('', '### Blockers');
      for (const blocker of state.blockers) {
        lines.push(`- [${blocker.taskId}] ${blocker.reason}`);
      }
    }

    return lines.join('\n');
  }
}

// Export singleton for convenience
export const stateManager = new StateManager();
