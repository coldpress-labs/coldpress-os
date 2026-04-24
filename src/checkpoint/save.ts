/**
 * Checkpoint writer (§6.5).
 *
 * Atomic single-file writes — `write to <path>.tmp, then rename`. No
 * partial-write corruption survives a crash.
 */

import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  type Checkpoint,
  CheckpointSchema,
  type InterruptKind,
} from "../../schemas/checkpoint.schema.js";

export interface SaveCheckpointOptions {
  projectDir: string;
  runId: string;
  lastEventSeq: number;
  interruptKind: InterruptKind;
  reason: string;
  state: unknown;
  /** Injected for deterministic tests. */
  now?: () => Date;
}

export async function saveCheckpoint(
  options: SaveCheckpointOptions,
): Promise<{ checkpoint: Checkpoint; path: string }> {
  const projectDir = resolve(options.projectDir);
  const path = join(
    projectDir,
    ".coldpress/runs",
    options.runId,
    "checkpoint.json",
  );
  const checkpoint: Checkpoint = {
    schema_version: 1,
    run_id: options.runId,
    created_at: (options.now?.() ?? new Date()).toISOString(),
    last_event_seq: options.lastEventSeq,
    interrupt_kind: options.interruptKind,
    reason: options.reason,
    state: options.state,
  };
  const validated = CheckpointSchema.parse(checkpoint);

  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(validated, null, 2), "utf8");
  await rename(tmp, path);

  return { checkpoint: validated, path };
}
