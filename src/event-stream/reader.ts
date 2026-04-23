/**
 * EventStream reader (§6.4).
 *
 * Parses `.coldpress/runs/<run-id>/events.jsonl` into a typed
 * `Event[]`. Tolerates blank lines but surfaces malformed JSON /
 * schema-violating events as explicit errors — no silent skipping.
 *
 * The Project Dashboard (§6.10) Stats tab reads the stream via this
 * module. `coldpress run inspect` uses it for timeline rendering.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type Event, EventSchema } from "../../schemas/event-stream.schema.js";

export class EventStreamNotFoundError extends Error {
  constructor(public readonly path: string) {
    super(`Event stream not found at ${path}`);
    this.name = "EventStreamNotFoundError";
  }
}

export class EventStreamParseError extends Error {
  constructor(
    public readonly path: string,
    public readonly line: number,
    public readonly detail: string,
  ) {
    super(`Malformed event at ${path}:${line} — ${detail}`);
    this.name = "EventStreamParseError";
  }
}

export interface ReadOptions {
  projectDir?: string;
}

/**
 * Read every event in a run's events.jsonl. Events come back in seq
 * order (which matches file order by construction).
 */
export async function readRun(
  runId: string,
  options: ReadOptions = {},
): Promise<Event[]> {
  const projectDir = resolve(options.projectDir ?? process.cwd());
  const path = join(projectDir, ".coldpress/runs", runId, "events.jsonl");

  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new EventStreamNotFoundError(path);
    }
    throw err;
  }

  const events: Event[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (line.length === 0) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (err) {
      throw new EventStreamParseError(path, i + 1, (err as Error).message);
    }
    const result = EventSchema.safeParse(parsed);
    if (!result.success) {
      const detail = result.error.issues
        .map((ii) => `${ii.path.join(".") || "(root)"}: ${ii.message}`)
        .join("; ");
      throw new EventStreamParseError(path, i + 1, detail);
    }
    events.push(result.data);
  }
  return events;
}

/**
 * List every run in `<projectDir>/.coldpress/runs/` with at least one
 * events.jsonl on disk. Returned list is sorted lexicographically —
 * matches chronological order because `makeRunId()` uses a timestamp
 * prefix.
 */
export async function listRuns(options: ReadOptions = {}): Promise<string[]> {
  const projectDir = resolve(options.projectDir ?? process.cwd());
  const runsDir = join(projectDir, ".coldpress/runs");
  let entries: string[];
  try {
    entries = await readdir(runsDir);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const runs: string[] = [];
  for (const name of entries) {
    const candidate = join(runsDir, name, "events.jsonl");
    try {
      const s = await stat(candidate);
      if (s.isFile()) runs.push(name);
    } catch {
      /* skip non-runs */
    }
  }
  return runs.sort();
}

/**
 * Invariant check: `seq` values are contiguous (0, 1, 2, ...) and
 * strictly increasing. Used by tests + the inspector to detect
 * corruption / manual edits.
 */
export function assertSeqIntegrity(events: Event[]): void {
  for (let i = 0; i < events.length; i++) {
    if (events[i]!.seq !== i) {
      throw new Error(
        `Seq integrity violated: events[${i}].seq === ${events[i]!.seq} (expected ${i})`,
      );
    }
  }
}
