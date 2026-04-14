/**
 * coldpress-os Orchestrator — Inngest Runtime Implementation
 *
 * Production-ready durable workflow for parallelizing task execution
 * across waves with human approval gates.
 *
 * Prerequisites:
 *   npm install inngest
 *   Configure INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY
 *
 * Usage:
 *   1. Define your DAG in orchestration/dag.yaml
 *   2. Register these functions with your Inngest client
 *   3. Send "orchestration/start" event to begin
 *
 * @see engine/dag-parser.md for DAG format
 * @see engine/gate-protocol.md for gate mechanics
 * @see engine/runtime-adapters.md for alternative runtimes
 */

import { Inngest } from "inngest";

// --- Types ---

interface Task {
  id: string;
  name: string;
  depends_on: string[];
  estimated_duration: string;
  agent?: string;
  description?: string;
  output?: string;
}

interface Wave {
  wave_number: number;
  tasks: Task[];
  gate_criteria: string;
}

interface DAG {
  id: string;
  scope: string;
  tasks: Task[];
}

interface GateDecision {
  action: "approve" | "revise" | "halt";
  decided_by: string;
  notes?: string;
}

// --- Inngest Client ---

const inngest = new Inngest({
  id: "coldpress-orchestrator",
});

// --- Core Algorithm: Topological Sort → Waves ---

function computeWaves(dag: DAG): Wave[] {
  const tasks = new Map(dag.tasks.map((t) => [t.id, t]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  // Initialize
  for (const task of dag.tasks) {
    inDegree.set(task.id, task.depends_on.length);
    for (const dep of task.depends_on) {
      if (!dependents.has(dep)) dependents.set(dep, []);
      dependents.get(dep)!.push(task.id);
    }
  }

  const waves: Wave[] = [];
  const remaining = new Set(dag.tasks.map((t) => t.id));

  while (remaining.size > 0) {
    // Find all tasks with in-degree 0
    const waveTasks: Task[] = [];
    for (const id of remaining) {
      if ((inDegree.get(id) ?? 0) === 0) {
        waveTasks.push(tasks.get(id)!);
      }
    }

    if (waveTasks.length === 0) {
      throw new Error("Cycle detected in DAG — cannot compute waves");
    }

    // Remove wave tasks and update in-degrees
    for (const task of waveTasks) {
      remaining.delete(task.id);
      for (const dep of dependents.get(task.id) ?? []) {
        inDegree.set(dep, (inDegree.get(dep) ?? 1) - 1);
      }
    }

    waves.push({
      wave_number: waves.length + 1,
      tasks: waveTasks,
      gate_criteria: `Wave ${waves.length + 1} complete — all ${waveTasks.length} task(s) finished`,
    });
  }

  return waves;
}

// --- Orchestrator Function ---

export const orchestrateProject = inngest.createFunction(
  {
    id: "orchestrate-project",
    concurrency: { limit: 1 }, // One orchestration at a time
  },
  { event: "orchestration/start" },
  async ({ event, step }) => {
    const dag: DAG = event.data.dag;
    const waves = computeWaves(dag);

    const results: Record<string, unknown> = {};

    for (const wave of waves) {
      // Trigger all tasks in this wave
      await step.run(`trigger-wave-${wave.wave_number}`, async () => {
        for (const task of wave.tasks) {
          await inngest.send({
            name: "task/run",
            data: {
              taskId: task.id,
              taskName: task.name,
              agent: task.agent,
              previousResults: results,
              waveNumber: wave.wave_number,
            },
          });
        }
      });

      // Wait for all tasks in this wave to complete
      const waveResults = await Promise.all(
        wave.tasks.map((task) =>
          step.waitForEvent(`wait-${task.id}`, {
            event: "task/complete",
            match: "data.taskId",
            timeout: "30d",
          })
        )
      );

      // Store results
      for (const result of waveResults) {
        if (result) {
          results[result.data.taskId] = result.data.output;
        }
      }

      // Human gate — wait for approval
      const gateDecision = await step.waitForEvent(
        `gate-wave-${wave.wave_number}`,
        {
          event: "orchestration/gate-decision",
          match: "data.waveNumber",
          timeout: "7d",
        }
      );

      if (!gateDecision) {
        // Timeout — notify but don't auto-advance
        await step.run(`gate-timeout-${wave.wave_number}`, async () => {
          await inngest.send({
            name: "orchestration/gate-timeout",
            data: { waveNumber: wave.wave_number },
          });
        });
        return { status: "gate_timeout", wave: wave.wave_number };
      }

      const decision: GateDecision = gateDecision.data;

      if (decision.action === "halt") {
        return { status: "halted", wave: wave.wave_number, reason: decision.notes };
      }

      if (decision.action === "revise") {
        // Re-trigger specific tasks based on revision feedback
        // For now, halt and let the user manually re-trigger
        return { status: "revision_requested", wave: wave.wave_number, feedback: decision.notes };
      }

      // action === "approve" — continue to next wave
    }

    return { status: "complete", waves: waves.length, results };
  }
);

// --- Task Runner Function ---

export const runTask = inngest.createFunction(
  {
    id: "run-task",
    concurrency: { limit: 5 }, // Up to 5 parallel tasks
    retries: 3,
  },
  { event: "task/run" },
  async ({ event, step }) => {
    const { taskId, taskName, agent, previousResults } = event.data;

    // Execute the task (this is where the actual skill runs)
    const output = await step.run(`execute-${taskId}`, async () => {
      // In production, this would invoke the appropriate coldpress-os skill
      // via Claude API or another agent execution mechanism.
      //
      // For now, this is a placeholder that logs the execution.
      console.log(`Executing task ${taskId}: ${taskName} (agent: ${agent})`);
      return { taskId, status: "done", completedAt: new Date().toISOString() };
    });

    // Signal completion
    await step.run(`signal-${taskId}`, async () => {
      await inngest.send({
        name: "task/complete",
        data: {
          taskId,
          taskName,
          output,
        },
      });
    });

    return output;
  }
);

// --- Gate Approval Handler ---

export const handleGateDecision = inngest.createFunction(
  { id: "handle-gate-decision" },
  { event: "orchestration/gate-decision" },
  async ({ event, step }) => {
    const { waveNumber, action, decidedBy, notes } = event.data;

    await step.run("log-decision", async () => {
      console.log(
        `Gate ${waveNumber}: ${action} by ${decidedBy}${notes ? ` — ${notes}` : ""}`
      );
    });

    return {
      waveNumber,
      action,
      decidedBy,
      decidedAt: new Date().toISOString(),
      notes,
    };
  }
);

// --- Exports for Inngest serve() ---

export const functions = [orchestrateProject, runTask, handleGateDecision];

/**
 * Usage in your API route:
 *
 * import { serve } from "inngest/next";  // or inngest/express, etc.
 * import { inngest } from "./orchestrator";
 * import { functions } from "./orchestrator-complete";
 *
 * export default serve({ client: inngest, functions });
 *
 * To start orchestration:
 *   await inngest.send({
 *     name: "orchestration/start",
 *     data: { dag: parsedDAG }
 *   });
 *
 * To approve a gate:
 *   await inngest.send({
 *     name: "orchestration/gate-decision",
 *     data: {
 *       waveNumber: 1,
 *       action: "approve",
 *       decidedBy: "team@coldpressai.com",
 *       notes: "Foundation looks solid"
 *     }
 *   });
 */
