---
step_number: 3
step_name: "Synthesise Constraints"
step_goal: "Classify, de-duplicate, and tag severity across gathered evidence"
halts_for_input: false
next_step: "step-04-report.md"
---

## Instructions

1. **Group constraints by axis** (compliance / protocol / performance / accessibility / regulatory / locale / device).
2. **De-duplicate overlapping sources** — one constraint may surface from multiple authorities; keep the most authoritative, cite the rest.
3. **Tag severity:**
   - **Blocking** — violation means the product cannot ship or cannot serve a key audience.
   - **Preferred** — violation degrades quality but doesn't block.
   - **Aspirational** — stretch target for later phases.
4. **Surface conflicts** — when two constraints pull in opposite directions (e.g., local-first latency vs multi-region residency), flag explicitly for Phase 3 to resolve.
5. **Draft implications** — for each blocking constraint, note the downstream phase most affected (Phase 3 stack / Phase 4 architecture / Phase 4 UX).

## Output

Constraints synthesised into a tagged, de-duplicated set with conflict flags. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-report.md](step-04-report.md)
