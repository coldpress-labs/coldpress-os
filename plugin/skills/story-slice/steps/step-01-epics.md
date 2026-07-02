---
step_number: 1
step_name: "Epics"
step_goal: "Decompose PRD + architecture + ADRs into user-value epics (requirement IDs ↔ components ↔ UX flows)"
halts_for_input: false
next_step: "step-02-stories.md"
---

## Goal

Group the work into **user-value epics** — but derive them from the **PRD *and* the
architecture *and* the ADRs together**, because by Phase 7 those are one keyed
structure, not separate inputs.

## Why PRD + Architecture + ADRs (not PRD alone)

Phase 6 produced a **three-way-keyed architecture**: PRD requirement IDs ↔
components ↔ styleguide components — that keying exists *precisely* so Phase 7 can
slice mechanically. The PRD says **what** (requirements + priority); the
architecture says **how it decomposes** into components with real file boundaries;
the **ADRs** say **which decisions are already locked** (and must not be reopened
or silently diverged from — the silent-divergence guard). An epic is a user-value
grouping laid over that keyed structure — so epics fall along component seams, and
the stories under them can own real file globs. Slicing from the PRD alone would
produce epics that don't map to buildable, ownable units.

## Instructions

1. **Walk the keyed architecture, not just the PRD.** For each PRD requirement,
   read the components it maps to (architecture) and the decisions constraining it
   (ADRs). Requirements that share components / a coherent user journey cluster
   together.
2. **Form epics by user value along component seams** — each epic delivers a
   coherent slice of user-facing capability AND sits on a clean architectural
   boundary (so its stories can own disjoint file globs downstream). Brainstorming
   / design-thinking define-stage wire-ins help with the value framing.
3. **Record the three-way keying per epic:** requirement IDs × architecture
   components × UX flows, plus the **ADRs it must honour**. This keying is what
   `trace` and `story-graph` consume.
4. **Flag epic-level risk + dependencies** — security-registry components, ADR
   constraints, and cross-epic dependencies (feeds Step 2 ownership globs + the
   `story-graph` typed edges).
5. **Write `_context/planning/epics-v{N}.md`** — validated-distillate: epic name,
   user value, requirement/component/UX/ADR mappings, risk + dependency notes.

## Output

`epics-v{N}.md` with every P0/P1 requirement assigned to an epic that sits on an
architectural seam. Coverage gap → halt and resolve. → [step-02-stories.md](step-02-stories.md).
