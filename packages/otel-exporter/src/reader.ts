/**
 * EventStream JSONL reader.
 *
 * Parses `.coldpress/runs/<run-id>/events.jsonl` and lists runs. Mirrors
 * the reader shipped in `@coldpress/core/src/event-stream/reader.ts` but
 * depends only on the JSONL protocol — never on the core package itself.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type Event, EventSchema } from "./event-schema.js";

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
