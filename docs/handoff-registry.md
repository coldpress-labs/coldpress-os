---
name: handoff-registry
description: Canonical enumeration of every inter-phase and high-stakes intra-phase handoff in coldpress-os
version: "1.4"
---

# Handoff Registry

> Every artefact that crosses a phase boundary in coldpress-os is a **handoff**. This registry enumerates all of them — inter-phase and high-stakes intra-phase — along with the skill that produces each one, the skill(s) that consume it, the content shape, and the typed-schema reference (for high-stakes handoffs).

Before this registry existed, 6 of 7 inter-phase handoffs were implicit — the producing skill emitted prose, the consuming skill read it, and the contract lived in English-language prose inside the two SKILL.md files. That was survivable when the framework had one author; it's not survivable at scale. This registry makes every handoff explicit, auditable, and — for the high-stakes four — typed.

**Stakes:**
- **high** — a schema mismatch breaks the downstream phase. Typed sidecar (`.meta.json`) validated by Zod schema in [`schemas/handoffs/`](../schemas/handoffs/); validation failure = gate failure.
- **med** — prose handoff with strong convention. No sidecar today; human review at phase boundary catches drift.
- **low** — prose handoff with loose convention. Skills tolerate missing / malformed content by falling back to direct-read or user prompts.

**Source decision:** [framework-audit-2026-04-23.md §3, §9](./framework-audit-2026-04-23.md) (framework-audit file lives at Lab HQ project level; registry here is the framework-internal canonical copy).

---

## Registry

| # | From phase | To phase | Artefact path | Type | Producing skill | Consuming skill(s) | Stakes | Schema |
|---|------------|----------|---------------|------|-----------------|--------------------|--------|--------|
| 1 | Phase 1 (Bootstrap) | Phase 2 (Discovery) | `_context/sacred/context.md` (seed) + `_context/handoffs/phase-1-to-phase-2-{date}.md` (written by `phase-transition`) | prose | `intake` → `phase-transition` | `pre-project-interview` | low | — |
| 2 | Phase 2 (Discovery) | Phase 3 (Tech Stack) | `_context/sacred/context.md` (status: authored) + `_context/planning/research-synthesis-v{N}.md` + `_context/planning/product-brief-v{N}.md` + `_context/planning/idea-validation-v{N}.md` (if ran) + `_context/planning/personas-*.md` (if ran) + `_context/planning/research/*.md` fragments + `_context/audit/supersessions-*.md` (if any) + `_context/handoffs/phase-2-to-phase-3-{date}.md` (written by `phase-transition`) | prose + structured (product-brief schema + research-output schema) | `pre-project-interview`, `domain-research`, `market-research`, `constraint-research`, `personas`, `validate-idea`, `synthesize-research`, `product-brief` → `phase-transition` | `stack-evaluation` | med | `schemas/distillates/product-brief.schema.json`, `schemas/research-output.schema.json` |
| 3 | Phase 3 (Tech Stack) | Phase 4 (Planning) | `_context/sacred/tech-stack.md` + `_context/planning/adrs/adr-*-v*.md` + `_context/planning/stack-selection-summary-v{N}.md` + `_context/planning/stack-shortlist-v{N}.md` + `_context/handoffs/phase-3-to-4-{date}.md` (written by `phase-transition`) + `_context/audit/stack-lock-decisions-{date}.md` (if applicable) + `_context/audit/supersessions-{date}.md` (if applicable) | prose + structured (tech-stack schema + ADR schema + shortlist schema + distillate schema) | `stack-discovery-sync`, `stack-evaluation`, `stack-locking` → `phase-transition` | `create-prd`, `create-architecture` | med | `schemas/sacred-docs/tech-stack.schema.json`, `schemas/planning-artefacts/adr.schema.json`, `schemas/planning-artefacts/stack-shortlist.schema.json`, `schemas/distillates/stack-selection-summary.schema.json` |
| 4 | Phase 4 (Planning) | Phase 6 (Architecture) | `_context/sacred/prd.md` + `_context/sacred/prd.meta.json` + `_context/planning/planning-scope-v{N}.md` + `_context/planning/legacy-migration-plan-v{N}.md` **(brownfield only — conditional on `_input/legacy/` non-empty; validated against `schemas/planning-artefacts/legacy-migration-plan.schema.json`; recorded in `prd.meta.json` as `brownfield_modules_count > 0`)** + `_context/planning/prd-validation-{date}.md` + `_context/handoffs/phase-4-to-5-{date}.md` (written by `phase-transition`) | prose + structured | `planning-entry-sync`, `create-prd`, `validate-prd`, `legacy-assessment` → `phase-transition` | `planning-entry-sync` (Phase 6 warm-handoff) | **high** | `schemas/handoffs/prd-to-architecture.schema.ts` |
| 5 | Phase 4 (Planning) | Phase 5 (Breakdown) | `_context/sacred/architecture.md` → `_context/sacred/pert-chart.md` | structured | `create-architecture` | `parallelization-strategy` | **high** | `architecture-to-pert.schema.ts` |
| 6 | Phase 5 (Breakdown) — intra | Phase 5 (Breakdown) — intra | `_context/sacred/pert-chart.md` → `_context/planning/stories/*.md` | structured | `parallelization-strategy` | `create-stories` | **high** | `pert-to-stories.schema.ts` |
| 7 | Phase 5 (Breakdown) | Phase 6 (Implementation) | `_context/planning/stories/*.md` → implementation files | structured + code | `create-stories` | `dev-story`, `quick-dev` | **high** | `stories-to-implementation.schema.ts` |
| 8 | Phase 6 (Implementation) | Phase 7 (Deployment) | `_context/implementation/*.md` + code → deployment gate | prose + code | `dev-story`, `code-review` | `readiness-check` | med | — |
| 9 | Phase 7 (Deployment) | Phase 8 (Operate) | deployment manifest + operational telemetry | structured | `deploy` | `correct-course`, `sprint-status` | med | — |
| 10 | Phase 8 (Operate) | Phase 9 (Evolve) | `_context/audit/retro-epic-*.md` inputs | prose | `sprint-status`, `correct-course` | `retrospective` | low | — |
| 11 | Phase 9 (Evolve) | Phase 4 (Planning) / Phase 2 (Discovery) | `_context/audit/retro-*.md` → next cycle inputs | prose | `retrospective`, `product-evolution` | `create-prd` (re-planning) or `pre-project-interview` (next epic) | low | — |
| 12 | Phase 3 (Tech Stack) | Phase 1 (Bootstrap) — re-invocation | `coldpress.yaml stack_pack` (now actually written by `stack-locking` Step 4 — Part 3 Wave 2.3) | structured | `stack-locking` | `intake` Step 5 graph-prime re-run (to re-index with stack-pack-aware context) | low | — |

**Count:** 12 handoffs total — 10 inter-phase (entries 1, 2, 3, 5, 7, 8, 9, 10, 11, 12) + 2 high-stakes intra-phase (entries 4, 6). Entry 12 is a *re-invocation* edge — Phase 3 completion reactivates part of Phase 1 rather than progressing forward. Matches the 9-phase post-split lifecycle (Wave 4 §4.11).

**Phase 2 → 3 expansion (Wave 4.8):** Entry 2 now lists the full artefact set produced by Phase 2 Discovery, including the synthesize-research + validate-idea + personas + product-brief outputs and the supersessions audit log. The `phase-transition` skill now writes the formal handoff artefact for entries 1 and 2 (replaces the manual intake step-06 prose handoff for entry 1).

### Non-handoff CLI companion

Entry 12 (Phase 3 → Phase 1 re-invocation) is a Butler skill handoff. It is *accompanied by* a mechanical CLI invocation that is **not** a skill-level handoff and therefore does not get its own registry row:

- **Phase 3 stack-lock exit hook → `coldpress update --post-phase-3`** (runs outside a Butler session). This CLI call regenerates stack-pack skill wrappers and runs `coldpress doctor --stack`; it's a mechanical step wired by the Phase 3 stack-locking exit hook. See [`src/commands/update.ts runPostPhase3`](../src/commands/update.ts). Wired 2026-04-24 in Part 3 Wave 4.9: `stack-locking` Step 6 exit-hook-prompt prompts the user to run the command; `coldpress update --post-phase-3` writes `post_phase_3_update_ran: true` to `.coldpress/local-config.yaml`; Butler detects the flag on next turn to unlock env-provision.

**High-stakes subset** (entries 4, 5, 6, 7) matches §3.8's v1 Zod whitelist:

- PRD → architecture
- architecture → PERT
- PERT → stories
- stories → implementation

---

## The `produced_by` convention

Every artefact produced by a subagent handoff carries a `produced_by` field in its frontmatter or metadata header:

```yaml
---
artefact: "Pre-Project Interview"
produced_by: "pre-project-interview"   # skill-id that emitted this file
produced_at: "2026-04-23T15:00:00Z"
---
```

`produced_by` enables:
- **Routing**: downstream subagents filter their inputs by upstream skill-id (port of MetaGPT's `cause_by`).
- **Dedup**: when multiple producers could have emitted a file, the consumer can disambiguate by producer.
- **Audit**: the registry + `produced_by` together form the complete provenance chain for every artefact.

Subagents that produce high-stakes handoffs (entries 4-7) additionally emit a typed sidecar — `<artefact>.meta.json` — validated against the schemas in [`schemas/handoffs/`](../schemas/handoffs/) on both write (by producer) and read (by consumer).

Implementation note: per-skill emission of `produced_by` is wired up in Wave 4 Lifecycle Alignment. Block L of Wave 3 publishes the registry + the 4 high-stakes schemas; Wave 4 threads the emission + validation through every producing + consuming skill's step-files.

---

## Validation gate

For high-stakes handoffs, validation failure is a **gate failure, not a warning**:

1. Producing skill writes `<artefact>.md` + `<artefact>.meta.json`.
2. Producing skill runs `coldpress validate-handoff <artefact>` — if the sidecar fails the schema, emission aborts; the producer must fix before marking the phase complete.
3. Consuming skill runs the same validation on read — if missing or invalid, the phase transition is blocked and the user is prompted to re-run the producer.

This mirrors the Wave 1 `governance/sacred-docs.md` §7 *Structural Migrations* pattern: validation failure blocks the transition rather than emitting a warning that gets ignored. Sacred-doc content governance and typed-payload handoff governance are complementary — sacred-doc workflows protect *what* can change; handoff validation protects *how* content moves between phases.

**Do NOT adopt pub/sub.** Coldpress-os's DAG orchestrator already subsumes MetaGPT's broadcast-plus-local-filter model and is more auditable. Port of `cause_by` + `instruct_content` is convention-only.

---

## Open question resolution

**Open Question #4** (brief-sourced, Wave 3 scoping): "which handoffs qualify as high-stakes?"

**Resolution:** the v1 whitelist is the four artefact transitions listed above (entries 4-7). Criteria used:

1. **Downstream non-obviousness.** A schema drift in these handoffs propagates to artefacts that are themselves sacred or near-sacred — catching at the boundary is far cheaper than catching mid-implementation.
2. **Machine-readability feasible.** Each of these handoffs produces a structured artefact (PRD, architecture, PERT, stories) that a Zod schema can meaningfully validate. The prose-only inter-phase handoffs (entries 1-3, 8-11) don't benefit from machine validation yet — human review at the phase boundary remains the gate.
3. **Expand only if demand proves out.** Adding schemas is cheaper than retracting them; start tight.

This resolves the question. Any future high-stakes additions need their own registry entry + schema + reference here.

---

## Updating this registry

When a new handoff surfaces (new phase, new sacred artefact, new cross-cutting skill):

1. Add a registry row with all 8 columns filled.
2. If it's high-stakes, add a Zod schema at `schemas/handoffs/<name>.schema.ts` + wire `coldpress validate-handoff` to it.
3. If the producing / consuming skill is new, cross-reference its SKILL.md.
4. Update the inter-phase count at the top.
5. Version-bump this document.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.4 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 7 (task 7.7). Row 4 updated: `legacy-migration-plan-v{N}.md` added as a conditional artefact (brownfield only — `_input/legacy/` non-empty). Schema reference added: `schemas/planning-artefacts/legacy-migration-plan.schema.json`. Link to `prd.meta.json` `brownfield_modules_count` field documented. |
| 1.3 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 4.8. Row 3 expanded: Phase 3 → Phase 4 artefact set now enumerates all 7 artefact types (tech-stack, ADRs, shortlist, stack-selection-summary, phase-transition handoff, stack-lock-decisions log, supersessions log) + 4 schema references. Producing skills list: stack-discovery-sync, stack-evaluation, stack-locking. Row 12 wiring note updated: `coldpress.yaml stack_pack` is now actually written (Wave 2.3, not deferred). Non-handoff CLI companion note updated: exit hook wired 2026-04-24 (Part 3 Wave 4.9) — `post_phase_3_update_ran` flag now written by `coldpress update --post-phase-3`. |
| 1.2 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 4.8. Rows 1–2 expanded: Row 1 producing skill now routes through `phase-transition`; handoff path updated to phase-transition naming convention. Row 2 expanded to list all 8 Phase 2 Discovery artefact types (context, synthesis, product-brief, idea-validation, personas, research fragments, supersessions log, phase-transition handoff) + two new schema references (`product-brief.schema.json`, `research-output.schema.json`). Phase 2→3 expansion note added. |
| 1.1 | 2026-04-24 | Cadbury-hq | Phase II Part 1 Wave 3.4. Row 1 producing skill updated: `project-init` (retired in Wave 4) → `intake` (new in Wave 3.2). Row 12 added: Phase 3 stack-lock → Phase 1 intake re-invocation edge (stakes: low). Total count 11 → 12. Non-handoff CLI companion noted for `coldpress update --post-phase-3` — mechanical invocation, not a Butler skill handoff, so no registry row; wiring follow-up tracked in phase-ii-implementation-plan Forward carries (target Part 3). |
| 1.0 | 2026-04-23 | Cadbury-hq | Initial registry — 11 handoffs (9 inter-phase + 2 high-stakes intra-phase). Resolves Open Question #4. Produced as part of Wave 3 Block L (§3.0). |
