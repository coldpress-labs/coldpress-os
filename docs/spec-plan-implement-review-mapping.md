---
name: spec-plan-implement-review-mapping
description: Maps coldpress-os's 9-phase lifecycle onto the industry-standard Spec → Plan → Implement → Review spine
version: "1.0"
---

# Spec → Plan → Implement → Review — Coldpress-os Mapping

> **GitHub Copilot Workspace** popularised a 4-stage spine: **Spec → Plan → Implement → Review.** Coldpress-os groups its 9 phases under the same spine, so teams that already think in those terms can see how coldpress-os's granularity fits. Externally we speak the industry language; internally the 9 phases remain the implementation detail that justifies sacred-doc governance, typed handoffs, and wave orchestration.

**Source decision:** [bmad-family-positioning-brief-2026-04-23.md §"Positioning threats — ranked"](../../../lab-hq-projects/hq-p001-coldpress-os/docs/bmad-family-positioning-brief-2026-04-23.md) — threat #1 was Copilot Workspace capturing the SDLC-shorthand mindshare. Reconcile externally, stay distinctive internally.

---

## One-line positioning

> **coldpress-os implements the Spec → Plan → Implement → Review spine, expanded to 9 phases with sacred-doc governance and typed inter-phase handoffs.**

This line lands in the README intro and every public-facing positioning doc. It acknowledges the shared vocabulary without pretending 4 stages is enough for production-grade delivery.

---

## The mapping

```
┌─────────┐     ┌──────┐     ┌───────────┐     ┌────────┐
│  Spec   │  →  │ Plan │  →  │ Implement │  →  │ Review │
└─────────┘     └──────┘     └───────────┘     └────────┘
    │              │               │                │
    │              │               │                │
┌───┴───┐     ┌────┴────┐     ┌────┴────┐    ┌─────┴─────┐
│ 1. P1 │     │ 3. P3   │     │ 6. P6   │    │ 7. P7     │
│ 2. P2 │     │ 4. P4   │     │         │    │ 8. P8     │
│       │     │ 5. P5   │     │         │    │ 9. P9     │
└───────┘     └─────────┘     └─────────┘    └───────────┘
```

| Industry stage | Coldpress-os phases | What lands in each |
|---------------|---------------------|--------------------|
| **Spec** | 1 — Bootstrap<br>2 — Discovery | Project scaffold + initial context. Discovery produces the first sacred doc (`context.md`) + constraint / domain / market research + product brief. |
| **Plan** | 3 — Tech Stack<br>4 — Planning<br>5 — Breakdown | Stack evaluation + locking, PRD, architecture, UX spec, epics + stories, PERT chart. Four of the five sacred docs land here (tech-stack, PRD, architecture, PERT). |
| **Implement** | 6 — Implementation | Code. Dev-story workflow, wave orchestration, code review + audit, testing skills. |
| **Review** | 7 — Deployment<br>8 — Operate<br>9 — Evolve | Deployment readiness gates + rollout, in-flight course correction during release, post-release retrospectives + product evolution + innovation strategy. |

---

## Why 9 phases instead of 4 stages

The 4-stage Spec / Plan / Implement / Review model is a communication primitive — easy to teach, easy to agree on, easy to draw. It's not a delivery primitive. Coldpress-os's 9-phase expansion makes three things concrete that the 4-stage model conflates:

1. **Bootstrap is not the same as Discovery.** Scaffolding a project (Phase 1) is mechanical; understanding the problem (Phase 2) is interpretive. Different skills, different subagents, different artefacts.
2. **Breakdown is not the same as Planning.** A PRD + architecture (Phase 4) is a different deliverable from epics + stories + a wave plan (Phase 5). Different subagents own each, different governance rules apply, typed handoffs carry structured payloads between them.
3. **Operate is not the same as Evolve.** In-flight course correction during a release (Phase 8) is a different activity from post-release retrospectives and product-evolution planning (Phase 9). Fusing them — as coldpress-os did through v0.2 — blurred "what do I do now" with "what should we learn next." Wave 4 §4.11 split them.

Each 9-phase expansion is load-bearing: a sacred-doc boundary, a typed handoff, or a subagent-ownership transition that doesn't make sense to collapse.

---

## When the 4-stage model is enough

Not every project needs the 9-phase spine. Small, time-boxed work (a bug-fix, a one-week spike, a throwaway prototype) moves through Spec → Plan → Implement → Review as a single loop, often in a single session. Coldpress-os's `quick-dev` skill in Phase 6 is that compressed path.

The 9-phase spine earns its complexity when:

- Multiple people or subagents need to own different parts of the work.
- The work outlives a single focused session, so decisions need to persist in sacred docs rather than chat history.
- Downstream work (breakdown, implementation, deployment) depends on a specific artefact shape — typed handoffs catch drift at the boundary.

For everything else: quick-dev through Phase 6 is fine. The Spec → Plan → Implement → Review shorthand is the right mental model for a small job.

---

## Cross-references

- **README intro** — carries the one-line positioning statement.
- [`docs/quick-start.md`](quick-start.md) — links to this doc under "how does coldpress-os compare to Copilot Workspace / Cursor / etc."
- [`docs/architecture.md`](architecture.md) §Lifecycle — expanded narrative on the 9 phases.
- [`docs/flow-map.md`](flow-map.md) — visual phase-by-phase flow.
- [`docs/agent-skills-compatibility.md`](agent-skills-compatibility.md) — complementary positioning vs Anthropic's Agent Skills catalogue.

---

## Early-move trigger (monitored)

If Copilot Workspace's Spec / Plan / Implement / Review vocabulary starts appearing in Anthropic Claude Code docs or BMAD upstream releases, the spec→review doc becomes load-bearing for positioning and this mapping doc moves earlier in the onboarding path (e.g., into the quick-start table). Tracked via the scheduled Anthropic-docs watch (Cross-Cutting Concerns in the Phase I plan).

---

## See also

- [`docs/agent-skills-compatibility.md`](agent-skills-compatibility.md) — the companion external-positioning doc for Anthropic's Agent Skills ecosystem.
- Copilot Workspace (GitHub) — the industry primitive this doc reconciles against. No citation link intentionally; this mapping stands on coldpress-os's own terms.
