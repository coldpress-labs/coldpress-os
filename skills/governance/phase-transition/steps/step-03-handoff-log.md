---
step_number: 3
step_name: "Handoff Log"
step_goal: "Write the durable handoff artefact; detect product-brief staleness on Phase 2→3 transition"
severity: "block"
halts_for_input: false
next_step: null
---

## Goal

Produce a durable, human-readable record of what was completed in the outgoing phase, what was deferred, and what open questions the incoming phase must resolve. This is the canonical cross-phase provenance chain.

## Instructions

### 1. Collect artefact inventory

For the outgoing phase, list all artefacts produced:

- **Phase 1 → 2**: `_context/sacred/context.md`, `.coldpress/local-config.yaml` (project_shape), graph prime status
- **Phase 2 → 3**: `_context/sacred/context.md` (status: authored), research outputs in `_context/planning/research/`, `_context/planning/idea-validation-v{N}.md`, `_context/planning/research-synthesis-v{N}.md`, `_context/planning/product-brief-v{N}.md` (if exists), `_context/planning/personas-*.md` (if exists)
- **Other phases**: equivalent phase artefact list (maintained per phase's gate.json `acceptance_checks`)

### 2. Distillate regen detect (generalised)

For each versioned distillate file matching `_context/planning/*-v{N}.md`:
1. Determine the schema path for this file by routing through `validate-schema` `PATH_PATTERN_SCHEMAS`.
2. If the file validates as a distillate schema (has `regeneratable: true` in frontmatter): collect its upstream `derived_from[]` paths.
3. Compare mtime of this distillate against mtime of each file in `derived_from[]`.
4. If any upstream is newer than the distillate: prompt regen.

**Known distillates and their upstream sources:**

| Distillate | Upstream artefacts |
|---|---|
| `product-brief-v{N}.md` | `_context/sacred/context.md`, `_context/planning/research-synthesis-v{N}.md` |
| `stack-selection-summary-v{N}.md` | `_context/sacred/tech-stack.md`, `_context/planning/adrs/adr-*-v*.md` |

Prompt per distillate (one at a time, blocking):

> The `{distillate-name}` (`{path}`) was authored before updates to `{upstream-name}`. It may be stale. Want to regenerate it before Phase {to_phase} starts, or proceed with the current version?

This is a warn — user can dismiss. Log the decision in the handoff artefact under `deferred:`. Adding a new distillate schema does **not** require editing this step — it is picked up automatically via the schema path-pattern loop above.

### 2a. Flush Pattern 7 transition buffer

Before writing the handoff artefact, locate and flush the Pattern 7 transition buffer for the outgoing phase:

```
_context/handoffs/pattern-7-transitions-wip-{date}.yaml
```

The buffer is a YAML list populated incrementally during the phase by skills that performed agent transitions (see `docs/cross-cutting/pattern-7-agent-personas.md` "Where transitions are recorded"). Each entry conforms to the canonical transition shape (8 fields).

If buffer exists:
1. Parse the YAML; extract `transitions[]`.
2. Validate each record (required fields: `trigger`, `from_agent`, `to_agent`, `rationale`, `recorded_at`).
3. Render as a markdown sub-list to be inserted under the `## Agent transitions (Pattern 7)` section in the handoff artefact (Step 3 below).
4. After the handoff artefact is written, archive the buffer: rename to `pattern-7-transitions-{date}-archived.yaml` (do NOT delete — audit-trail integrity).

If buffer is missing or empty:
- For from_phase ≤ 4 (pre-Pattern-7-sustained): proceed with empty section.
- For from_phase ≥ 5: emit a warn to user — "Pattern 7 transition buffer empty for Phase {N} — at minimum the phase_entry transition should have been recorded." Proceed with empty section. Log warning in handoff artefact under `## Gate warnings`.

Then write the entry transition to the NEXT phase's buffer (cross-buffer write):

```
_context/handoffs/pattern-7-transitions-wip-{next-date}.yaml
```

with this transition block (rendered after Step 3 completes the handoff artefact path):

```yaml
- trigger: phase_entry
  from_agent: phase-transition
  to_agent: <next-phase-primary-agent>
  rationale: "<Phase {to_phase} {to_phase_name} is @{to_agent}'s domain>"
  warm_handoff: "_context/handoffs/phase-{from}-to-{to}-{date}.md"
  deferred_inputs: <forward-carries from this handoff (architecture_adrs_required, parked_for_phase_11, etc.)>
  resumes_to: null
  recorded_at: <ISO>
```

This keeps each phase's buffer self-contained for that phase's transitions, with the entry transition initialising the next phase's buffer.

### 3. Write handoff artefact

Create `_context/handoffs/phase-{from}-to-phase-{to}-{date}.md`:

```markdown
---
from_phase: {from_phase}
to_phase: {to_phase}
transitioned_at: "{ISO-8601}"
gate_result: "pass" | "pass-with-warnings"
graph_rebuilt: true | false
graph_rebuild_error: null | "{error}"
artefact_type: "phase-transition-handoff"
---

# Phase {from_phase} → Phase {to_phase} Handoff

## Completed in Phase {from_phase}

{list artefacts produced, one line each with path + one-line summary}

## Deferred

{items that were warn-not-block — skipped with user approval}
- None | {list of deferred items with disposition}

## Open questions for Phase {to_phase}

{open questions Butler captured during Phase {from_phase} that Phase {to_phase} must resolve}

## Gate warnings

{any warn-severity gate failures surfaced at exit; user acknowledged}

## Supersessions recorded

{list of supersession log entry IDs that fire during Phase {from_phase}; empty if none}

## Agent transitions (Pattern 7)

{Render each transition record from the buffer file flushed in Step 2a as a list item. Each entry MUST include: trigger, from_agent, to_agent, rationale, recorded_at. Optional: warm_handoff, deferred_inputs, resumes_to. For from_phase ≤ 4: list `_None — Pattern 7 sustained from Phase 5 forward._` if buffer empty.}

Example rendered shape:

```markdown
- **#1 — phase_entry** | from: pm → to: ux-designer | recorded_at: 2026-04-30T10:14:00Z
  - rationale: Phase 5 Design is @ux-designer's domain.
  - warm_handoff: _context/handoffs/phase-4-to-5-2026-04-30.md
- **#2 — reconciliation_handoff (out)** | from: ux-designer → to: pm | recorded_at: 2026-04-30T17:22:00Z
  - rationale: PRD amendment is @pm's domain.
  - resumes_to: phase-transition
```

## Design deltas (Phase 5 only — emitted by step 2a reconciliation)

{Required when from_phase == 5. Each delta entry includes: id, source_skill, source_step, prd_section, delta_type, description, evidence, recommendation, user_decision, user_rationale, applied_at. Schema: `schemas/handoffs/design-delta.schema.json`. Empty list `[]` if no deltas surfaced.}

## Architecture ADRs required (Phase 5 only — silent-divergence guard)

{Required when from_phase == 5 AND any delta resolved as flag_for_architecture_ADR. Each entry: delta_id, prd_section_affected, design_decision_taken, architecture_implication, prd_amendment_deferred_reason. Phase 6 entry skill MUST consume this section; Phase 6 exit gate REQUIRES corresponding ADRs. Empty/absent if no flagged deltas.}

## Parked for Phase 11 Evolve (when applicable)

{List of delta IDs parked via `park_for_phase_11`. Cross-references entries in `_context/audit/product-evolution-backlog.md`.}

## Next skill

{first skill to invoke in Phase {to_phase}}
```

### 3a. Phase 11 inter-iteration cycle (conditional)

If `from_phase == 11` (final-phase exit), the lifecycle has no `to_phase`. Instead of writing a `phase-11-to-12-{date}.md` handoff (which doesn't exist), execute the **inter-iteration cycle** — copy Phase 11 outputs to `_input/prior-iteration/` so the NEXT iteration's Phase 1 `intake` skill can detect and read them (brownfield-style branching).

Trigger condition: `gate.json` for Phase 11 has `is_final_phase: true` (added in Phase 11 implementation; verify on entry).

Execute the file copy:

```bash
mkdir -p _input/prior-iteration

# Latest retrospective
RETRO=$(ls -t _context/audit/retrospective-v*.md 2>/dev/null | head -1)
if [ -n "$RETRO" ]; then
  cp "$RETRO" _input/prior-iteration/retrospective.md
fi

# Latest product-evolution-backlog
PE_BACKLOG=$(ls -t _context/audit/product-evolution-backlog-v*.md 2>/dev/null | head -1)
if [ -n "$PE_BACKLOG" ]; then
  cp "$PE_BACKLOG" _input/prior-iteration/product-evolution-backlog.md
fi

# Latest innovation-strategy (optional — Phase 11 gate is warn-severity for this artefact)
INNOV=$(ls -t _context/audit/innovation-strategy-v*.md 2>/dev/null | head -1)
if [ -n "$INNOV" ]; then
  cp "$INNOV" _input/prior-iteration/innovation-strategy.md
fi
```

Also write a manifest at `_input/prior-iteration/_manifest.yaml`:

```yaml
iteration_closed_at: <ISO-8601>
from_phase_11_handoff: _context/handoffs/phase-11-closure-{date}.md
copied:
  - retrospective.md (from <retrospective-vN.md>)
  - product-evolution-backlog.md (from <pe-backlog-vN.md>)
  - innovation-strategy.md (from <innovation-strategy-vN.md>)  # only if exists
next_iteration_phase_1_entry: pending
```

Then write a closure log (instead of a phase-N-to-N+1 handoff) at:
`_context/handoffs/phase-11-closure-{date}.md` — same structure as a regular handoff log but with `to_phase: null` and a `## Inter-iteration cycle` section listing the copied files + their source versions.

The next iteration's Phase 1 `intake` skill detects `_input/prior-iteration/_manifest.yaml` on Step 0 and reads the three files as context — same pattern as `_input/legacy/` brownfield branching.

Skip §3a entirely if `to_phase != null` (i.e., this is a normal phase boundary, not Phase 11 closure).

### 4. Mark transition complete in local-config

```yaml
transitions:
  - from_phase: {from_phase}
    to_phase: {to_phase}
    gate_evaluated_at: "{ISO-8601}"
    gate_result: "pass" | "pass-with-warnings"
    handoff_written_at: "{ISO-8601}"
    handoff_path: "_context/handoffs/phase-{from}-to-phase-{to}-{date}.md"
```

### 5. Clean step marker

```ts
await clearStepMarker(projectRoot);
```

### 6. Transition prose

Butler delivers:

> Phase {from_phase} is complete. [Summary of what was built.] [Any warnings/deferrals.] Starting Phase {to_phase} — first up: `{next-skill}`.

## Halts For Input

Product-brief regen prompt (Phase 2→3 only) — one halt, user can dismiss in a single reply.

## Navigation

→ Transition complete. Butler dispatches the first skill of Phase {to_phase}.
