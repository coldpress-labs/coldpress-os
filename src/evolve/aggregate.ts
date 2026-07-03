/**
 * `coldpress evolve` aggregation (WS7-D, §4.8). Pure reduction over EventStream
 * events (across ≥1 project run-logs) into the evolution report: failure
 * leaderboard (which taxonomy classes recur), cost leaderboard (tokens by model
 * / agent), an estimation-bias signal, an override leaderboard (which gates get
 * bypassed most), and top-3 patch proposals (the most frequent failure classes →
 * where to patch). Consumes what WS7-A/B/C produce.
 */

import type { Event } from "../../schemas/event-stream.schema.js";

/** Minimal taxonomy lookup for proposal text (id → category + description). */
export type TaxonomyLookup = Map<string, { category: string; description: string }>;

export interface EvolveReport {
  projects: number;
  runs: number;
  events: number;
  /** Failure classes ranked by frequency (from session-boundary taxonomy_tags). */
  failure_leaderboard: { tag: string; count: number }[];
  /** Token cost, where the EventStream exposed it. */
  cost: { total_tokens: number; by_model: Record<string, number>; by_agent: Record<string, number> };
  /** Estimation bias (G8) — `estimate-blown` frequency; full estimate-vs-actual is a follow-up. */
  estimation_bias: { estimate_blown: number; note: string };
  /**
   * Override leaderboard — enforcement gates bypassed via COLDPRESS_OVERRIDE,
   * ranked by frequency, with the reasons given. A gate that is overridden often
   * is a mis-designed gate (too strict, wrong trigger) — the valet-loop +
   * framework-feedback read this to decide whether to relax or re-scope it.
   */
  override_leaderboard: { gate: string; count: number; reasons: string[] }[];
  /** Top-3 patch proposals — the highest-frequency failure classes to fix first. */
  top_patches: { rank: number; failure_class: string; count: number; proposal: string }[];
}

function bump(map: Record<string, number>, key: string, by: number): void {
  map[key] = (map[key] ?? 0) + by;
}

export interface AggregateInput {
  /** Events per project run-log (one array per run; project count passed separately). */
  events: Event[];
  projects: number;
  runs: number;
  taxonomy?: TaxonomyLookup;
}

export function aggregateEvolve(input: AggregateInput): EvolveReport {
  const { events, taxonomy } = input;
  const failureCounts: Record<string, number> = {};
  const byModel: Record<string, number> = {};
  const byAgent: Record<string, number> = {};
  const overrideCounts: Record<string, number> = {};
  const overrideReasons: Record<string, string[]> = {};
  let totalTokens = 0;

  for (const e of events) {
    if (e.kind === "session-boundary") {
      for (const tag of e.taxonomy_tags ?? []) bump(failureCounts, tag, 1);
      const t = e.tokens?.total ?? (e.tokens ? (e.tokens.input ?? 0) + (e.tokens.output ?? 0) : 0);
      if (t) {
        totalTokens += t;
        if (e.model) bump(byModel, e.model, t);
        if (e.agent) bump(byAgent, e.agent, t);
      }
    }
    // gate-fail blockers are a distinct failure signal — count them as `skipped-gate` proxies.
    if (e.kind === "gate-fail") bump(failureCounts, "skipped-gate", 0); // presence-only; ranked below by taxonomy_tags
    // gate-override — a bypassed enforcement gate. Rank by gate + keep the reasons.
    if (e.kind === "gate-override") {
      bump(overrideCounts, e.gate_id, 1);
      (overrideReasons[e.gate_id] ??= []).push(e.reason);
    }
  }

  const override_leaderboard = Object.entries(overrideCounts)
    .map(([gate, count]) => ({ gate, count, reasons: overrideReasons[gate] ?? [] }))
    .sort((a, b) => b.count - a.count || a.gate.localeCompare(b.gate));

  const failure_leaderboard = Object.entries(failureCounts)
    .filter(([, c]) => c > 0)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  const proposalFor = (tag: string): string => {
    const info = taxonomy?.get(tag);
    const cat = info ? ` (${info.category})` : "";
    return `Recurring \`${tag}\`${cat} — review the skill/hook that guards against it; add or tighten a golden eval so a regression is caught.`;
  };

  const top_patches = failure_leaderboard.slice(0, 3).map((f, i) => ({
    rank: i + 1,
    failure_class: f.tag,
    count: f.count,
    proposal: proposalFor(f.tag),
  }));

  return {
    projects: input.projects,
    runs: input.runs,
    events: events.length,
    failure_leaderboard,
    cost: { total_tokens: totalTokens, by_model: byModel, by_agent: byAgent },
    estimation_bias: {
      estimate_blown: failureCounts["estimate-blown"] ?? 0,
      note: "Frequency of the estimate-blown tag. Full estimate-vs-actual (o/m/p vs actual duration, G8) wires in when client-timeline records land.",
    },
    override_leaderboard,
    top_patches,
  };
}
