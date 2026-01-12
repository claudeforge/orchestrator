import { z } from 'zod';

// Phase definitions
export const PhaseSchema = z.enum([
  'ideation',
  'specification',
  'architecture',
  'planning',
  'implementation',
  'testing',
  'deployment',
  'complete',
]);
export type Phase = z.infer<typeof PhaseSchema>;

// Task status
export const TaskStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'blocked',
  'skipped',
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Task priority
export const TaskPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

// Agent types
export const AgentTypeSchema = z.enum([
  'orchestrator',
  'spec-writer',
  'architect',
  'task-planner',
  'frontend-dev',
  'backend-dev',
  'database-expert',
  'api-designer',
  'devops-engineer',
  'test-engineer',
  'code-reviewer',
  'security-auditor',
  'performance-analyst',
  'bug-fixer',
  'documentation',
  'refactorer',
]);
export type AgentType = z.infer<typeof AgentTypeSchema>;

// Phase status
export const PhaseStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'complete', 'skipped']),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
});
export type PhaseStatus = z.infer<typeof PhaseStatusSchema>;

// Tech stack
export const TechStackSchema = z.object({
  frontend: z
    .object({
      framework: z.string(),
      version: z.string().optional(),
      buildTool: z.string().optional(),
      styling: z.string().optional(),
      stateManagement: z.string().optional(),
      router: z.string().optional(),
      componentLibrary: z.string().optional(),
    })
    .optional(),
  backend: z
    .object({
      runtime: z.string(),
      version: z.string().optional(),
      framework: z.string().optional(),
      orm: z.string().optional(),
      database: z.string().optional(),
    })
    .optional(),
  testing: z
    .object({
      unit: z.string().optional(),
      integration: z.string().optional(),
      e2e: z.string().optional(),
    })
    .optional(),
  deployment: z
    .object({
      platform: z.string().optional(),
      ci: z.string().optional(),
      containerization: z.string().optional(),
    })
    .optional(),
});
export type TechStack = z.infer<typeof TechStackSchema>;

// Task definition
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  agent: AgentTypeSchema,
  epic: z.string().optional(),
  story: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
  estimatedMinutes: z.number().optional(),
  actualMinutes: z.number().optional(),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  startedAt: z.string().datetime().nullable().default(null),
  completedAt: z.string().datetime().nullable().default(null),
  error: z.string().nullable().default(null),
});
export type Task = z.infer<typeof TaskSchema>;

// Blocker definition
export const BlockerSchema = z.object({
  taskId: z.string(),
  reason: z.string(),
  since: z.string().datetime(),
  attempts: z.number(),
});
export type Blocker = z.infer<typeof BlockerSchema>;

// Decision record
export const DecisionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  decision: z.string(),
  rationale: z.string(),
  alternatives: z.array(z.string()).optional(),
  decidedAt: z.string().datetime(),
  decidedBy: AgentTypeSchema,
});
export type Decision = z.infer<typeof DecisionSchema>;

// Checkpoint
export const CheckpointSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  phase: PhaseSchema,
  tasksCompleted: z.number(),
  gitCommit: z.string().optional(),
  description: z.string().optional(),
});
export type Checkpoint = z.infer<typeof CheckpointSchema>;

// History entry
export const HistoryEntrySchema = z.object({
  timestamp: z.string().datetime(),
  action: z.string(),
  agent: AgentTypeSchema.optional(),
  taskId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

// Progress metrics
export const ProgressSchema = z.object({
  total: z.number(),
  completed: z.number(),
  inProgress: z.number(),
  blocked: z.number(),
  skipped: z.number(),
  percentage: z.number(),
});
export type Progress = z.infer<typeof ProgressSchema>;

// Current task info
export const CurrentTaskSchema = z.object({
  id: z.string(),
  agent: AgentTypeSchema,
  startedAt: z.string().datetime(),
  attempt: z.number(),
});
export type CurrentTask = z.infer<typeof CurrentTaskSchema>;

// Metrics
export const MetricsSchema = z.object({
  totalTime: z.string().optional(),
  avgTaskTime: z.string().optional(),
  retryRate: z.number().optional(),
  testCoverage: z.number().optional(),
  lintErrors: z.number().optional(),
  typeErrors: z.number().optional(),
});
export type Metrics = z.infer<typeof MetricsSchema>;

// Main project state
export const ProjectStateSchema = z.object({
  $schema: z.literal('orchestrator-state-v1').default('orchestrator-state-v1'),

  project: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    created: z.string().datetime(),
    updated: z.string().datetime(),
    version: z.string().default('0.1.0'),
  }),

  phase: PhaseSchema,
  phases: z.record(PhaseSchema, PhaseStatusSchema),

  techStack: TechStackSchema.optional(),

  tasks: z.array(TaskSchema).default([]),

  currentTasks: z.array(CurrentTaskSchema).default([]),

  progress: ProgressSchema,

  blockers: z.array(BlockerSchema).default([]),

  decisions: z.array(DecisionSchema).default([]),

  checkpoints: z.array(CheckpointSchema).default([]),

  history: z.array(HistoryEntrySchema).default([]),

  metrics: MetricsSchema.optional(),

  config: z
    .object({
      autonomyLevel: z.enum(['low', 'medium', 'high', 'full']).default('high'),
      checkpointFrequency: z.number().default(5),
      autoCommit: z.boolean().default(true),
      maxParallelTasks: z.number().default(3),
      maxRetries: z.number().default(3),
    })
    .optional(),
});
export type ProjectState = z.infer<typeof ProjectStateSchema>;

// Task file schema (tasks.json)
export const TaskFileSchema = z.object({
  $schema: z.literal('orchestrator-tasks-v1').default('orchestrator-tasks-v1'),
  projectId: z.string().uuid(),
  generatedAt: z.string().datetime(),
  epics: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      stories: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          tasks: z.array(TaskSchema),
        })
      ),
    })
  ),
  tasks: z.array(TaskSchema),
  dependencyGraph: z.record(z.array(z.string())).optional(),
});
export type TaskFile = z.infer<typeof TaskFileSchema>;
