/**
 * `coldpress run` — EventStream CLI surface (§6.4).
 *
 * Two subcommands for v1:
 *   - `coldpress run list`               — enumerate runs in the project
 *   - `coldpress run inspect <run-id>`   — render timeline for a run
 *
 * No write-side CLI — orchestrator code writes via `EventStreamWriter`.
 */

import pc from "picocolors";
import {
  EventStreamNotFoundError,
  EventStreamParseError,
  listRuns,
  readRun,
} from "../event-stream/reader.js";
import { renderTimeline } from "../event-stream/inspect.js";

export const RUN_EXIT_OK = 0;
export const RUN_EXIT_NOT_FOUND = 2;
export const RUN_EXIT_ERROR = 1;

export interface RunListOptions {
  projectDir?: string;
}

export async function runRunList(options: RunListOptions = {}): Promise<number> {
  const runs = await listRuns({ projectDir: options.projectDir });
  if (runs.length === 0) {
    console.error(pc.dim("no runs found in .coldpress/runs/"));
    return RUN_EXIT_OK;
  }
  for (const runId of runs) {
    console.log(runId);
  }
  return RUN_EXIT_OK;
}

export interface RunInspectOptions {
  runId: string;
  projectDir?: string;
  timeStyle?: "delta" | "absolute";
  /** Strip ANSI colour; auto-detected from TTY status when unset. */
  monochrome?: boolean;
}

export async function runRunInspect(
  options: RunInspectOptions,
): Promise<number> {
  try {
    const events = await readRun(options.runId, {
      projectDir: options.projectDir,
    });
    const monochrome =
      options.monochrome ?? (process.stdout.isTTY ? false : true);
    const out = renderTimeline(events, {
      monochrome,
      timeStyle: options.timeStyle,
    });
    process.stdout.write(out);
    return RUN_EXIT_OK;
  } catch (err) {
    if (err instanceof EventStreamNotFoundError) {
      console.error(pc.red(`✗ run not found: ${options.runId}`));
      console.error(pc.dim(`  looked at: ${err.path}`));
      return RUN_EXIT_NOT_FOUND;
    }
    if (err instanceof EventStreamParseError) {
      console.error(pc.red(`✗ malformed event stream`));
      console.error(pc.dim(`  ${err.message}`));
      return RUN_EXIT_ERROR;
    }
    throw err;
  }
}
