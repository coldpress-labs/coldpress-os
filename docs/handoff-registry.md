---
name: handoff-registry
description: Canonical enumeration of every inter-phase and high-stakes intra-phase handoff in coldpress-os
version: "1.0"
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
| 1 | Phase 1 (Bootstrap) | Phase 2 (Discovery) | `_context/sacred/context.md` (seed) | prose | `project-init` | `pre-project-interview` | low | — |
| 2 | Phase 2 (Discovery) | Phase 3 (Tech Stack) | `_context/sacred/context.md` + discovery outputs | prose | `pre-project-interview`, `domain-research`, `market-research`, `constraint-research` | `stack-evaluation` | med | — |
| 3 | Phase 3 (Tech Stack) | Phase 4 (Planning) | `_context/sacred/tech-stack.md` | prose + structured | `stack-locking` | `create-prd`, `create-architecture` | med | — |
| 4 | Phase 4 (Planning) — intra | Phase 4 (Planning) — intra | `_context/sacred/prd.md` → `_context/sacred/architecture.md` | structured | `create-prd` | `create-architecture` | **high** | `prd-to-architecture.schema.ts` |
| 5 | Phase 4 (Planning) | Phase 5 (Breakdown) | `_context/sacred/architecture.md` → `_context/sacred/pert-chart.md` | structured | `create-architecture` | `parallelization-strategy` | **high** | `architecture-to-pert.schema.ts` |
| 6 | Phase 5 (Breakdown) — intra | Phase 5 (Breakdown) — intra | `_context/sacred/pert-chart.md` → `_context/planning/stories/*.md` | structured | `parallelization-strategy` | `create-stories` | **high** | `pert-to-stories.schema.ts` |
| 7 | Phase 5 (Breakdown) | Phase 6 (Implementation) | `_context/planning/stories/*.md` → implementation files | structured + code | `create-stories` | `dev-story`, `quick-dev` | **high** | `stories-to-implementation.schema.ts` |
| 8 | Phase 6 (Implementation) | Phase 7 (Deployment) | `_context/implementation/*.md` + code → deployment gate | prose + code | `dev-story`, `code-review` | `readiness-check` | med | — |
| 9 | Phase 7 (Deployment) | Phase 8 (Operate) | deployment manifest + operational telemetry | structured | `deploy` | `correct-course`, `sprint-status` | med | — |
| 10 | Phase 8 (Operate) | Phase 9 (Evolve) | `_context/audit/retro-epic-*.md` inputs | prose | `sprint-status`, `correct-course` | `retrospective` | low | — |
| 11 | Phase 9 (Evolve) | Phase 4 (Planning) / Phase 2 (Discovery) | `_context/audit/retro-*.md` → next cycle inputs | prose | `retrospective`, `product-evolution` | `create-prd` (re-planning) or `pre-project-interview` (next epic) | low | — |

**Count:** 11 handoffs total — 9 inter-phase (entries 1, 2, 3, 5, 7, 8, 9, 10, 11) + 2 high-stakes intra-phase (entries 4, 6). Matches the 9-phase post-split lifecycle (Wave 4 §4.11).

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
| 1.0 | 2026-04-23 | Cadbury-hq | Initial registry — 11 handoffs (9 inter-phase + 2 high-stakes intra-phase). Resolves Open Question #4. Produced as part of Wave 3 Block L (§3.0). |
