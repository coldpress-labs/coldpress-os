/**
 * EventStream inspector (§6.4).
 *
 * Renders a run's event log as a human-readable timeline. Pure function —
 * takes `Event[]`, returns a multi-line string with colour-friendly
 * markers and aggregate stats at the bottom. CLI caller decides
 * whether to strip ANSI when not writing to a TTY.
 */

import pc from "picocolors";
import type { Event } from "../../schemas/event-stream.schema.js";

export interface InspectOptions {
  /** When true, emit no ANSI colour codes. Default: auto (colour). */
  monochrome?: boolean;
  /**
   * Absolute-time prefix style. "delta" (default) shows `+Nms` from
   * run start; "absolute" shows the raw ISO timestamp.
   */
  timeStyle?: "delta" | "absolute";
}

interface ResolvedOptions {
  colour: (c: string, text: string) => string;
  timeStyle: "delta" | "absolute";
}

const COLOUR_NOOP = (_c: string, text: string) => text;

function resolveColour(monochrome: boolean): ResolvedOptions["colour"] {
  if (monochrome) return COLOUR_NOOP;
  return (c, text) => {
    switch (c) {
      case "dim":
        return pc.dim(text);
      case "red":
        return pc.red(text);
      case "green":
        return pc.green(text);
      case "yellow":
        return pc.yellow(text);
      case "cyan":
        return pc.cyan(text);
      case "magenta":
        return pc.magenta(text);
      default:
        return text;
    }
  };
}

export function renderTimeline(
  events: Event[],
  options: InspectOptions = {},
): string {
  const opts: ResolvedOptions = {
    colour: resolveColour(options.monochrome === true),
    timeStyle: options.timeStyle ?? "delta",
  };

  if (events.length === 0) {
    return opts.colour("dim", "(no events)") + "\n";
  }

  const runStart = new Date(events[0]!.timestamp).getTime();
  const lines: string[] = [];
  lines.push(
    opts.colour("dim", `run: ${events[0]!.run_id}    events: ${events.length}`),
  );
  lines.push("");

  for (const e of events) {
    lines.push(renderEvent(e, runStart, opts));
  }

  lines.push("");
  lines.push(renderSummary(events, opts));
  return lines.join("\n") + "\n";
}

function renderEvent(
  event: Event,
  runStart: number,
  opts: ResolvedOptions,
): string {
  const time = renderTime(event.timestamp, runStart, opts);
  const badge = renderBadge(event, opts);
  const body = renderBody(event, opts);
  const seq = opts.colour("dim", `#${String(event.seq).padStart(3, "0")}`);
  return `${seq} ${time} ${badge} ${body}`;
}

function renderTime(
  iso: string,
  runStart: number,
  opts: ResolvedOptions,
): string {
  if (opts.timeStyle === "absolute") {
    return opts.colour("dim", iso);
  }
  const delta = new Date(iso).getTime() - runStart;
  return opts.colour("dim", `+${String(delta).padStart(6, " ")}ms`);
}

function renderBadge(event: Event, opts: ResolvedOptions): string {
  switch (event.kind) {
    case "wave-start":
      return opts.colour("cyan", "▶ WAVE ");
    case "wave-end":
      if (event.status === "success") return opts.colour("green", "■ WAVE ");
      if (event.status === "interrupted")
        return opts.colour("yellow", "⏸ WAVE ");
      return opts.colour("red", "✗ WAVE ");
    case "skill-invoke":
      return opts.colour("cyan", "→ skill");
    case "skill-result":
      return event.exit_code === 0
        ? opts.colour("green", "← skill")
        : opts.colour("red", "← skill");
    case "gate-evaluate":
      return opts.colour("cyan", "→ gate ");
    case "gate-pass":
      return opts.colour("green", "✓ gate ");
    case "gate-fail":
      return opts.colour("red", "✗ gate ");
    case "condensation":
      return opts.colour("magenta", "◈ cond ");
    case "session-boundary":
      return opts.colour("dim", "◌ stop ");
    default:
      return "      ";
  }
}

function renderBody(event: Event, opts: ResolvedOptions): string {
  switch (event.kind) {
    case "wave-start":
      return `P${event.phase} ${event.wave_id}${event.label ? ` — ${event.label}` : ""}`;
    case "wave-end":
      return `P${event.phase} ${event.wave_id} — ${event.status}${event.duration_ms !== undefined ? ` (${event.duration_ms}ms)` : ""}`;
    case "skill-invoke":
      return `${event.skill_id}${event.caller ? opts.colour("dim", ` [by ${event.caller}]`) : ""}`;
    case "skill-result": {
      const parts: string[] = [event.skill_id];
      parts.push(opts.colour("dim", `exit=${event.exit_code}`));
      if (event.duration_ms !== undefined) {
        parts.push(opts.colour("dim", `${event.duration_ms}ms`));
      }
      if (event.artifact_path) {
        parts.push(opts.colour("dim", `→ ${event.artifact_path}`));
      }
      if (event.message) parts.push(opts.colour("dim", event.message));
      return parts.join(" ");
    }
    case "gate-evaluate":
      return `P${event.phase} ${event.gate_id}`;
    case "gate-pass":
      return `P${event.phase} ${event.gate_id}`;
    case "gate-fail":
      return `P${event.phase} ${event.gate_id} — ${opts.colour("red", `${event.blockers.length} blocker${event.blockers.length === 1 ? "" : "s"}`)}`;
    case "condensation":
      return `${event.wave_id} — ${event.summary}${opts.colour("dim", ` (seq ${event.from_seq}..${event.to_seq})`)}`;
    case "session-boundary":
      return `${event.boundary}${event.agent ? opts.colour("dim", ` [${event.agent}]`) : ""}${event.phase !== undefined ? ` P${event.phase}` : ""}${event.lane ? opts.colour("dim", ` ${event.lane}`) : ""}`;
  }
}

function renderSummary(events: Event[], opts: ResolvedOptions): string {
  const counts: Record<string, number> = {};
  let skillPass = 0;
  let skillFail = 0;
  let gatePass = 0;
  let gateFail = 0;
  for (const e of events) {
    counts[e.kind] = (counts[e.kind] ?? 0) + 1;
    if (e.kind === "skill-result") {
      if (e.exit_code === 0) skillPass++;
      else skillFail++;
    }
    if (e.kind === "gate-pass") gatePass++;
    if (e.kind === "gate-fail") gateFail++;
  }

  const parts: string[] = [opts.colour("dim", "summary:")];
  for (const kind of Object.keys(counts).sort()) {
    parts.push(opts.colour("dim", `${kind}=${counts[kind]}`));
  }
  parts.push("");
  parts.push(
    opts.colour(skillFail === 0 ? "green" : "red", `skills: ${skillPass}✓ / ${skillFail}✗`),
  );
  parts.push(
    opts.colour(gateFail === 0 ? "green" : "red", `gates: ${gatePass}✓ / ${gateFail}✗`),
  );
  return parts.join("  ");
}
