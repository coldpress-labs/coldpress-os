---
step_number: 2
step_name: "Stories"
step_goal: "Slice epics into atomic ST-*.md story contracts with the full v0.4 metadata"
halts_for_input: false
next_step: "step-03-stubs.md"
---

## Goal

Slice each epic into **atomic stories that are contracts** — ~½–2 dev-sessions
each, sized so `dev-story` can take one red-to-green inside a boundary.

## Instructions

For each story, write `_context/implementation/stories/ST-<n>-<slug>.md` carrying
**all** of the contract metadata:

1. **Identity + scope:** requirement IDs satisfied (keying for `trace orphans`);
   the epic it belongs to; a one-line user-value statement.
2. **Ownership boundary** — derived from the **architecture's component→file
   mapping** (not invented per story), which is what keeps waves disjoint:
   - `owns` — globs this story may edit, taken from the architecture component it
     implements (dev-story's boundary-guard enforces these).
   - `produces` — files/interfaces it creates that others consume.
   - `consumes` — files/interfaces it depends on (typed edges for `story-graph`).
   Honour the ADRs bearing on this component — a story must not reopen a locked
   decision (out-of-scope → DLT at P8, never a silent divergence).
3. **Estimates:** `o` / `m` / `p` (optimistic / most-likely / pessimistic dev-sessions) — `coldpress waves` computes the critical path from these.
4. **Risk:** `low` / `med` / `high`. **Force `high`** when any `owns`/`consumes`
   glob intersects a `security-registry.yaml` path (→ P8 solo dispatch + opus verify).
5. **UI stories:** reference the **styleguide.md components** + tokens.json roles the
   story must match (what `visual-verify` will assert clean-room).
6. **Analytics:** attach the P6 analytics-plan events this story must emit (→ P9 smoke).
7. **Acceptance criteria:** BDD (Given/When/Then) or numbered ACs, each testable —
   these become the acceptance stubs in Step 3.

**Special story kinds:**
- **Contract stories** — for every `interface` surface in the P6 `api-contract`,
  emit a contract story that defines the shared type/route; it merges to main
  before its wave (the wave-safety mechanism, G4).
- **Content-population stories** (content-led sites) — from the PRD content
  inventory: page × section × who-writes × migration source, with owner + deadline.
- **Migration stories** (persistence) — from `data-model`; forward + rollback both required.

## Output

Atomic `ST-*.md` story contracts under `_context/implementation/stories/`. →
[step-03-stubs.md](step-03-stubs.md).
