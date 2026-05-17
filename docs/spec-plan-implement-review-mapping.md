---
name: spec-plan-implement-review-mapping
description: Maps coldpress-os's 11-phase Shape A lifecycle onto the industry-standard Spec → Plan → Implement → Review spine
version: "2.0"
---

# Spec → Plan → Implement → Review — Coldpress-os Mapping

> **GitHub Copilot Workspace** popularised a 4-stage spine: **Spec → Plan → Implement → Review.** Coldpress-os groups its 11 Shape A phases under the same spine, so teams that already think in those terms can see how coldpress-os's granularity fits. Externally we speak the industry language; internally the 11 phases remain the implementation detail that justifies sacred-doc governance, typed handoffs, wave orchestration, and the forward-carry quartet.

**Source decision:** [bmad-family-positioning-brief-2026-04-23.md §"Positioning threats — ranked"](../../../lab-hq-projects/hq-p001-coldpress-os/docs/bmad-family-positioning-brief-2026-04-23.md) — threat #1 was Copilot Workspace capturing the SDLC-shorthand mindshare. Reconcile externally, stay distinctive internally.

> **Hello Butler — where are we?** Butler is the main orchestrator (your default Claude Code session, see [`butler.md`](butler.md)). Butler dispatches subagents per phase and runs the gates that separate the four stages below.

---

## One-line positioning

> **coldpress-os implements the Spec → Plan → Implement → Review spine, expanded to 11 phases (Shape A) with sacred-doc governance, typed inter-phase handoffs, and a forward-carry quartet for late-surfacing constraints.**

This line lands in the README intro and every public-facing positioning doc.

---

## The mapping

```
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌─────────┐
│  Spec   │  →  │   Plan   │  →  │ Implement │  →  │ Review  │
└─────────┘     └──────────┘     └───────────┘     └─────────┘
    │                │                  │                │
┌───┴───┐      ┌─────┴─────┐       ┌────┴────┐    ┌──────┴──────┐
│ 1. P1 │      │ 3. P3     │       │ 8. P8   │    │ 9. P9       │
│ 2. P2 │      │ 4. P4     │       │         │    │ 10. P10     │
│       │      │ 5. P5 NEW │       │         │    │ 11. P11 *   │
│       │      │ 6. P6 NEW │       │         │    │             │
│       │      │ 7. P7     │       │         │    │             │
└───────┘      └───────────┘       └─────────┘    └─────────────┘
```

`*` Phase 11 is the final phase; closure copies outputs to `_input/prior-iteration/` for the next iteration's Phase 1 entry.

| Industry stage | Coldpress-os phases | What lands in each |
|---------------|---------------------|--------------------|
| **Spec** | 1 — Bootstrap<br>2 — Discovery | Project scaffold + initial context. Discovery produces the first sacred doc (`context.md`) + constraint / domain / market / persona research + product brief. |
| **Plan** | 3 — Tech Stack<br>4 — Planning *(PRD-only)*<br>5 — **Design** *(NEW)*<br>6 — **Architecture** *(NEW)*<br>7 — Breakdown | Stack evaluation + locking; PRD; UX-design-spec + brand-guidelines + prototype; sacred architecture + ADRs (with silent-divergence guard for flagged design-deltas); epics + stories + PERT chart. Four of the five sacred docs land here (tech-stack, PRD, architecture, PERT). |
| **Implement** | 8 — Implementation | Code. Dev-story workflow, wave orchestration, code review + audit, QA automation, testing skills. |
| **Review** | 9 — Deployment<br>10 — Operate<br>11 — Evolve *(final)* | Deployment readiness gates + rollout, in-flight operations + course correction + incident response, post-release retrospectives + product evolution + innovation strategy. |

---

## Why 11 phases instead of 4 stages

The 4-stage Spec / Plan / Implement / Review model is a communication primitive — easy to teach, easy to agree on, easy to draw. It's not a delivery primitive. Coldpress-os's Shape A 11-phase expansion makes five things concrete that the 4-stage model conflates:

1. **Bootstrap is not the same as Discovery.** Scaffolding a project (Phase 1) is mechanical; understanding the problem (Phase 2) is interpretive. Different skills, different subagents (butler vs @analyst), different artefacts.
2. **Tech-stack-locking is not the same as Product-Planning.** Locking the stack (Phase 3) is an architectural decision with its own rubric, ADRs, and sacred-doc; the PRD (Phase 4) is a product artefact. Conflating them encourages PRDs that quietly assume infrastructure.
3. **Design is not the same as Architecture** *(Shape A)*. UX/IA/brand decisions (Phase 5) precede and constrain system architecture (Phase 6). The Phase 5 → 6 boundary is the silent-divergence guard: design-deltas flagged `flag_for_architecture_ADR` become REQUIRED ADRs at the Phase 6 exit gate — design intent and architecture cannot silently drift.
4. **Breakdown is not the same as Planning.** A PRD + UX spec + architecture (Phases 4–6) is a different deliverable from epics + stories + a wave plan (Phase 7). Different subagents own each, different governance rules apply, typed handoffs carry structured payloads.
5. **Operate is not the same as Evolve.** In-flight course correction during a release (Phase 10) is a different activity from post-release retrospectives and product-evolution planning (Phase 11). Owner changes from @devops (continuous) to @reviewer (final phase) at the P10 → P11 boundary.

Each Shape A expansion is load-bearing: a sacred-doc boundary, a typed handoff, or a subagent-ownership transition that doesn't make sense to collapse.

---

## The forward-carry quartet — why Shape A handles change better

The 4-stage model assumes work flows in one direction. Real projects don't. Coldpress-os makes late-surfacing constraints first-class via four delta instances:

| Instance | Surfaces in | Reconciles at |
|---|---|---|
| `design-deltas` | Phase 5 (Design) | Phase 5 exit (in @pm scope) |
| `architecture-deltas` | Phase 6 (Architecture) | Phase 7 entry (`breakdown-entry-sync` Step 1) |
| `implementation-deltas` | Phase 8 (Implementation) | Phase 11 retrospective (deferred batch) |
| `ops-deltas` | Phase 10 (Operate) | Phase 11 retrospective |

Each delta resolves via four options: `accept_into_prd` (lightweight PRD amendment via `validate-prd --sections`), `reject` (source skill loops back), `flag_for_architecture_ADR` (silent-divergence-guard target), `park_for_phase_11` (Evolve revisits).

---

## When the 4-stage model is enough

Not every project needs the 11-phase spine. Small, time-boxed work (a bug-fix, a one-week spike, a throwaway prototype) moves through Spec → Plan → Implement → Review as a single loop, often in a single session. Coldpress-os's `quick-dev` skill in Phase 8 is that compressed path.

The 11-phase spine earns its complexity when:

- Multiple people or subagents need to own different parts of the work.
- The work outlives a single focused session, so decisions need to persist in sacred docs rather than chat history.
- Downstream work (breakdown, implementation, deployment) depends on a specific artefact shape — typed handoffs catch drift at the boundary.
- The project has explicit design discipline — Shape A's Phase 5 → 6 silent-divergence guard is only worth its weight when you have UX scope AND system scope simultaneously.

For everything else: quick-dev through Phase 8 is fine. The Spec → Plan → Implement → Review shorthand is the right mental model for a small job.

---

## Cross-references

- **README intro** — carries the one-line positioning statement.
- [`butler.md`](butler.md) — the orchestrator reference (Butler dispatches subagents per phase, runs gates between stages).
- [`docs/quick-start.md`](quick-start.md) — links to this doc under "how does coldpress-os compare to Copilot Workspace / Cursor / etc."
- [`docs/architecture.md`](architecture.md) §Lifecycle — expanded narrative on the 11 phases.
- [`docs/flow-map.md`](flow-map.md) — visual phase-by-phase flow.
- [`docs/agent-skills-compatibility.md`](agent-skills-compatibility.md) — complementary positioning vs Anthropic's Agent Skills catalogue.

---

## See also

- [`butler.md`](butler.md) — Hello Butler / orchestrator reference.
- [`docs/agent-skills-compatibility.md`](agent-skills-compatibility.md) — the companion external-positioning doc for Anthropic's Agent Skills ecosystem.
- Copilot Workspace (GitHub) — the industry primitive this doc reconciles against.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-17 | ColdPress Labs | Shape A v0.3.0-alpha rewrite. Lifecycle expanded 9 → 11 (added Design + Architecture as dedicated phases; cascade-renamed old 5-9 to 7-11). Stage grouping refreshed: Plan now spans P3–P7 (was P3–P5); Implement is P8 (was P6); Review is P9–P11 (was P7–P9). Added Hello Butler kickoff. New §"forward-carry quartet" documents design/architecture/implementation/ops deltas. Updated rationale sections to call out the silent-divergence guard at P5 → P6 and the owner change at P10 → P11. Bumped `quick-dev` phase reference 6 → 8. |
| 1.0 | 2026-04 | Cadbury-hq | Initial 9-phase mapping. |
