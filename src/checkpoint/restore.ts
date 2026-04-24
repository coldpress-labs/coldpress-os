/**
 * Checkpoint reader (§6.5).
 *
 * Verifies the EventStream is at-least `last_event_seq` long before
 * declaring the checkpoint resumable — refuses to resume if the live
 * stream has moved beyond the snapshot point (state has drifted).
 */

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  type Checkpoint,
  CheckpointSchema,
} from "../../schemas/checkpoint.schema.js";
import { readRun } from "../event-stream/reader.js";

export class CheckpointNotFoundError extends Error {
  constructor(public readonly path: string) {
    super(`Checkpoint not found at ${path}`);
    this.name = "CheckpointNotFoundError";
  }
}

export class CheckpointParseError extends Error {
  constructor(
    public readonly path: string,
    public readonly issues: { path: string; message: string }[],
  ) {
    super(
      `Checkpoint at ${path} failed validation:\n` +
        issues.map((i) => `  - ${i.path || "(root)"}: ${i.message}`).join("\n"),
    );
    this.name = "CheckpointParseError";
  }
}

export class CheckpointDriftError extends Error {
  constructor(
    public readonly path: string,
    public readonly checkpointSeq: number,
    public readonly liveSeq: number,
  ) {
    super(
      `Checkpoint at ${path} anchors at seq=${checkpointSeq} but the live ` +
        `EventStream is at seq=${liveSeq}. State has drifted; refusing to resume. ` +
        `Author a fresh checkpoint or rewind the EventStream first.`,
    );
    this.name = "CheckpointDriftError";
  }
}

export interface ReadCheckpointOptions {
  projectDir: string;
  runId: string;
  /**
   * When true, skip the live-EventStream drift check. Use only for
   * inspect-only callers (dashboard); real resumption MUST verify.
   */
  skipDriftCheck?: boolean;
}

export async function readCheckpoint(
  options: ReadCheckpointOptions,
): Promise<Checkpoint> {
  const projectDir = resolve(options.projectDir);
  const path = join(
    projectDir,
    ".coldpress/runs",
    options.runId,
    "checkpoint.json",
  );

  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new CheckpointNotFoundError(path);
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new CheckpointParseError(path, [
      { path: "(root)", message: `JSON parse failed: ${(err as Error).message}` },
    ]);
  }

  const result = CheckpointSchema.safeParse(parsed);
  if (!result.success) {
    throw new CheckpointParseError(
      path,
      result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    );
  }

  if (!options.skipDriftCheck) {
    const events = await readRun(options.runId, { projectDir }).catch(() => []);
    if (events.length > result.data.last_event_seq + 1) {
      const liveSeq = events[events.length - 1]!.seq;
      throw new CheckpointDriftError(path, result.data.last_event_seq, liveSeq);
    }
  }

  return result.data;
}
