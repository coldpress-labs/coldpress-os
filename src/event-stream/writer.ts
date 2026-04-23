/**
 * Append-only EventStream writer (§6.4).
 *
 * Opens `.coldpress/runs/<run-id>/events.jsonl` in append mode and exposes
 * `append(event)` which fills `schema_version` / `seq` / `run_id` /
 * `timestamp`, validates against `EventSchema`, and writes one line.
 *
 * Resumption-safe: when the file already exists, the writer reads the
 * last line to rehydrate the `seq` counter so a subsequent run doesn't
 * emit duplicate seq ids.
 *
 * Single-writer assumption: only one `EventStreamWriter` should be open
 * against a given run at a time. Concurrent writers are not supported in
 * v1 — the Project Dashboard (§6.10) reads independently and does NOT
 * hold a writer handle.
 */

import { type FileHandle, mkdir, open, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  type Event,
  type EventInput,
  EventSchema,
  makeRunId,
} from "../../schemas/event-stream.schema.js";

export interface OpenOptions {
  /** Override the run id; otherwise a fresh one is generated. */
  runId?: string;
  /** Injected for deterministic tests; otherwise `new Date()`. */
  now?: () => Date;
}

export class EventStreamWriter {
  private handle: FileHandle | undefined;
  private seq: number;
  private closed = false;

  private constructor(
    public readonly runId: string,
    public readonly runDir: string,
    public readonly eventsPath: string,
    handle: FileHandle,
    startingSeq: number,
    private readonly nowFn: () => Date,
  ) {
    this.handle = handle;
    this.seq = startingSeq;
  }

  /**
   * Open (or resume) a writer for `<projectDir>/.coldpress/runs/<runId>/`.
   * Creates the directory on first use. If `events.jsonl` already exists
   * the writer rehydrates the `seq` counter to one past the last line.
   */
  static async open(
    projectDir: string,
    options: OpenOptions = {},
  ): Promise<EventStreamWriter> {
    const runId = options.runId ?? makeRunId(options.now?.());
    const runDir = resolve(projectDir, ".coldpress/runs", runId);
    await mkdir(runDir, { recursive: true });
    const eventsPath = join(runDir, "events.jsonl");

    let startingSeq = 0;
    try {
      const s = await stat(eventsPath);
      if (s.isFile() && s.size > 0) {
        startingSeq = (await readLastSeq(eventsPath)) + 1;
      }
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }

    const handle = await open(eventsPath, "a");
    return new EventStreamWriter(
      runId,
      runDir,
      eventsPath,
      handle,
      startingSeq,
      options.now ?? (() => new Date()),
    );
  }

  /**
   * Append one event. Fills `schema_version` / `seq` / `run_id` /
   * `timestamp`, validates, writes one JSON line + `\n`. Returns the
   * full persisted event.
   */
  async append(input: EventInput): Promise<Event> {
    if (this.closed || !this.handle) {
      throw new Error("EventStreamWriter is closed");
    }
    const full = {
      schema_version: 1 as const,
      seq: this.seq++,
      run_id: this.runId,
      timestamp: this.nowFn().toISOString(),
      ...input,
    };
    const parsed = EventSchema.safeParse(full);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      throw new Error(`EventStream: refusing to append malformed event — ${details}`);
    }
    const line = `${JSON.stringify(parsed.data)}\n`;
    await this.handle.write(line);
    return parsed.data;
  }

  async close(): Promise<void> {
    if (this.closed || !this.handle) return;
    this.closed = true;
    await this.handle.close();
    this.handle = undefined;
  }

  /** Current next-seq — exposed for test assertions. */
  get nextSeq(): number {
    return this.seq;
  }
}

/**
 * Read the `seq` field from the last non-empty line of an events.jsonl
 * file. Returns `-1` when the file has no parseable lines (fresh writer
 * starts at 0).
 */
async function readLastSeq(path: string): Promise<number> {
  const content = await readFile(path, "utf8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return -1;
  const last = lines[lines.length - 1]!;
  try {
    const parsed = JSON.parse(last) as { seq?: unknown };
    if (typeof parsed.seq === "number" && Number.isInteger(parsed.seq)) {
      return parsed.seq;
    }
  } catch {
    /* fall through */
  }
  // Trailing line is malformed — start from the next integer so we
  // don't overwrite anything even if the existing line is unreadable.
  // Conservative: count the lines, use that.
  return lines.length - 1;
}
