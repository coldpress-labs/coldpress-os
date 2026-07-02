/**
 * Routing lookup for `<NEED_INFO>` messages (§5.4).
 *
 * Maps each `NeedInfoKind` to its default upstream owner (a subagent
 * slug, or `"human"` for escalation). This table is the single source of
 * truth for need-info routing (the former prose table at
 * `orchestrator/engine/need-info-routing.md` was removed in v0.4 WS0 §8
 * item 2). Tests enforce the coverage invariant (every kind has a route).
 *
 * Budget-exhaustion ALWAYS routes to human, regardless of this table.
 */

import type { NeedInfoKind } from "../../schemas/need-info.schema.js";

/**
 * The eight canonical subagent slugs (post-v0.4 roster surgery, §4.5) + the
 * human-gate sentinel. `qa` → `verifier`; `scrum-master`/`communicator`/`valet`
 * removed (their work folded into pm-skills / forkable creative skills / the
 * framework repo loop).
 */
export type RouteTarget =
  | "analyst"
  | "pm"
  | "ux-designer"
  | "architect"
  | "developer"
  | "devops"
  | "verifier"
  | "reviewer"
  | "human";

export const NEED_INFO_ROUTES: Record<NeedInfoKind, RouteTarget> = {
  "prd-ambiguity": "pm",
  "architecture-unclear": "architect",
  "tech-stack-unclear": "architect",
  "scope-boundary-unclear": "pm",
  "acceptance-criteria-unclear": "pm", // was scrum-master (deleted); acceptance criteria are pm's story work
  "design-intent-unclear": "ux-designer",
  "process-step-unclear": "human", // was valet (deleted); orchestration ambiguity escalates to the human
  "credential-missing": "human",
  "handoff-shape-unclear": "human", // was valet (deleted); the handoff packet is Butler's — escalate
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
