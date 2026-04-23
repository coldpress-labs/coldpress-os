/**
 * Routing lookup for `<NEED_INFO>` messages (§5.4).
 *
 * Maps each `NeedInfoKind` to its default upstream owner (a subagent
 * slug, or `"human"` for escalation). Kept in lockstep with the prose
 * table at `orchestrator/engine/need-info-routing.md` — when you change
 * one, change the other. Tests enforce the coverage invariant (every
 * kind has a route).
 *
 * Budget-exhaustion ALWAYS routes to human, regardless of this table.
 */

import type { NeedInfoKind } from "../../schemas/need-info.schema.js";

/** The nine canonical subagent slugs + the human-gate sentinel. */
export type RouteTarget =
  | "analyst"
  | "pm"
  | "ux-designer"
  | "architect"
  | "developer"
  | "qa"
  | "scrum-master"
  | "communicator"
  | "valet"
  | "human";

export const NEED_INFO_ROUTES: Record<NeedInfoKind, RouteTarget> = {
  "prd-ambiguity": "pm",
  "architecture-unclear": "architect",
  "tech-stack-unclear": "architect",
  "scope-boundary-unclear": "pm",
  "acceptance-criteria-unclear": "scrum-master",
  "design-intent-unclear": "ux-designer",
  "process-step-unclear": "valet",
  "credential-missing": "human",
  "handoff-shape-unclear": "valet",
  "other": "human",
};

export interface RouteDecision {
  target: RouteTarget;
  reason: "kind-lookup" | "budget-exhausted";
}

export function routeNeedInfo(
  kind: NeedInfoKind,
  opts: { budgetExhausted?: boolean } = {},
): RouteDecision {
  if (opts.budgetExhausted === true) {
    return { target: "human", reason: "budget-exhausted" };
  }
  return { target: NEED_INFO_ROUTES[kind], reason: "kind-lookup" };
}
