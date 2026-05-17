---
name: phase-2-orchestration-notes
description: Butler orchestration-layer decisions for Phase 2 — parallel-research failure handling and partial-completion markers
phase_authored: 2
status: reference
version: "1.0"
---

# Phase 2 — Butler Orchestration Notes

Two Butler-side behaviours don't live inside any single skill. Documented here so the orchestration layer and the step files agree on what Butler does between skill invocations.

## Parallel-research failure handling (FP2)

**Context:** after `pre-project-interview` completes, Butler dispatches the research lane — 2-4 skills selected from `domain-research` / `market-research` / `constraint-research` / `personas` — in parallel.

**Behaviour on individual skill failure** (Python missing, Graphify error, web-fetch timeout, etc.):

- **Continue with the successful skills.** Do not abort the whole research lane because one skill died.
- **Flag the failure** in `_context/tracking/phase-2-{date}.md` with skill name + error reason + timestamp.
- **Per-skill timeout default: 5 minutes.** Configurable via `coldpress.yaml phase_2.parallel_research_timeout_minutes` (override). Over-timeout is treated as a failure.
- **Gate severity:** Phase 2 gate treats the missing research as `warn` severity (not block) if at least one other research doc succeeded. Zero-succeeding triggers block.
- **User notification:** Butler surfaces the failure in the transition prose *before* moving to `validate-idea` / `synthesize-research`:
  > I ran 3 research skills in parallel. `market-research` timed out after 5 minutes — I've logged it to phase-2 tracking. Want to retry now, or carry on with what we have?

- **Retry is a skill re-invocation**, not an orchestration concern — user re-triggers `@analyst market-research` and Butler dispatches fresh.

## Partial-completion mechanic — Phase 2 step_ids (FP5)

**Extends** the Part 1 Wave 3.3 pattern already in `.coldpress/local-config.yaml` (`partial_completion: { step_id, at }`).

**Convention:** every Phase 2 step file writes a `partial_completion` marker to `.coldpress/local-config.yaml` **before** starting its work, and clears it on clean exit. On session resumption, orient Step 0 reads the marker and resumes at that step.

**Step ID format:**
```
phase-2.<skill-name>.<step-file-basename-without-extension>
```

Examples:
```
phase-2.pre-project-interview.step-01-vision
phase-2.pre-project-interview.step-02-users
phase-2.personas.step-03-accessibility-targets
phase-2.validate-idea.step-09-validation-summary
phase-2.synthesize-research.step-02-identify-tensions
```

### Parallel-research special case

Step 4 of the `pre-project-interview`-downstream orchestration (parallel research dispatch) uses per-sub-skill markers so a mid-parallel death resumes only the incomplete skills:

```
phase-2.parallel-research.domain-in-progress
phase-2.parallel-research.market-in-progress
phase-2.parallel-research.constraint-in-progress
phase-2.parallel-research.personas-in-progress
```

Any marker cleared = that sub-skill completed. Any marker still set = resume that sub-skill only on next session.

### Resume semantics

When orient Step 0 finds a `phase-2.*` marker:
- **Single marker** → prompt: *"Last session ended during {step_id}. Resume there, or restart the skill from its first step?"*
- **Multiple parallel-research markers** → prompt: *"Last session was mid-parallel research — {N} skills didn't finish. Want me to re-run just the incomplete ones, or re-run the whole research lane?"*

### Validator enum

`src/utils/local-config-validator.ts` intentionally accepts any string as a `partial_completion.step_id` — no enum narrowing. Reason: enumerating every possible step_id in the validator would require syncing the validator with every skill edit, which is fragile. The convention-over-configuration contract lives here, not in the validator.

Acceptance on this file: when a fixture project drops a well-formed `partial_completion: { step_id: "phase-2.pre-project-interview.step-01-vision", at: <ISO> }`, the validator passes and orient's resume logic routes correctly.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial orchestration notes per Phase II Part 2 Wave 3.8 (FP2 + FP5). Codifies parallel-research failure handling (continue-and-flag, 5-min default timeout, warn-severity at gate) and Phase 2 step_id naming convention for partial-completion markers extending the Part 1 schema. |
