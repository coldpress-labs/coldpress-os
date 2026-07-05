---
name: governance
description: Sacred-doc governance layer — Ajv structural validation + phase-gate semantic policies + ADR/RFC scaffolding
version: "1.0"
---

# Governance (§5.2)

> The sacred docs (`context.md`, `tech-stack.md`, `prd.md`, `architecture.md`) are the load-bearing artefacts of a coldpress-os project — downstream skills consume them as contracts. (The lite lane collapses these to a single `spec.md`.) Before this protocol, their frontmatter was prose-regulated. This doc specifies the governance layer: Ajv validates shape; phase-gate checks validate semantics; ADRs anchor decisions; RFCs propose them.

**Source decision:** framework-audit-2026-04-23.md §9 + oss-integration-survey-2026-04-22.md Tier 1 §1.5.

---

## Two validators

### 1. `validate-schema` — structural (Ajv, in-process)

`skills/governance/validate-schema` validates sacred-doc YAML frontmatter against per-doc JSON Schemas. Runs in-process via [Ajv](https://github.com/ajv-validator/ajv) (MIT) — no subprocess, no install.

**Four schemas shipped** at `schemas/sacred-docs/`:

| Sacred doc | Schema |
|------------|--------|
| `_context/sacred/context.md` | `context.schema.json` |
| `_context/sacred/tech-stack.md` | `tech-stack.schema.json` |
| `_context/sacred/prd.md` | `prd.schema.json` |
| `_context/sacred/architecture.md` | `architecture.schema.json` |

(The `pert-chart` sacred doc + schema were retired in v0.4 — the computed story graph + `coldpress waves` superseded PERT.)

Each schema requires at minimum:
- `sacred: true` (const — the marker)
- `version: "X.Y"` (semver-ish)
- `governance: "requires-review" | "locked" | "draft"`
- `workflowType` pinned to the doc kind (`"prd"`, `"architecture"`, etc.)

Doc-specific fields (PRD's `adr_references[]`, architecture's `approvers[]`) layer on top. `additionalProperties: true` leaves room for project-specific extensions.

### 2. Phase-gate semantic policy checks

**Cross-field** semantic policies — "the array must be non-empty" rules that the
always-on structural schema deliberately can't enforce (the schema-validate hook
*blocks* writes, so requiring them would reject an in-progress doc) — run at the
**phase-exit gates** via `coldpress validate-frontmatter-min`:

- "PRDs must reference ≥1 ADR" — Phase-4 exit gate (`validate-frontmatter-min _context/sacred/prd.md adr_references --min 1`)
- "Architecture.md must name ≥1 approver" — Phase-6 exit gate (`validate-frontmatter-min _context/sacred/architecture.md approvers --min 1`)

This is the WS11 fold of the retired Conftest/Rego policies: same rules, enforced
at the right moment (phase completion), with no external policy-engine dependency
for consumers to install.

**Run order:** structural first (the schema-validate hook, on every write),
semantic at the gate (phase exit).

---

## ADRs — anchoring decisions

Every coldpress-os project ships with `docs/adr/` seeded by `coldpress init`:

- `0000-use-adr.md` — the Nygard seed ADR explaining the decision to use ADRs
- `README.md` — format, link to [adr-tools](https://github.com/npryce/adr-tools) (BSD-2, optional)

### The enforcement loop

1. PRD frontmatter carries `adr_references: ["ADR-NNNN", …]`.
2. Ajv's `prd.schema.json` requires each entry to match `^ADR-\d{4}$` (structural).
3. The Phase-4 gate (`lifecycle/4-planning/gate.json`) runs `validate-frontmatter-min … adr_references --min 1` as a block-severity `acceptance_check` — the array must be non-empty at phase exit.

Outcome: a PRD can never land without anchoring to at least one ADR. Re-litigating a PRD's direction means re-examining the linked ADR — no lost context.

---

## RFCs — proposing decisions

RFCs live at `docs/rfc/` in consumer projects. They're for **larger proposals that need space to think** before reaching a decision. Once an RFC resolves, distill the outcome into a new ADR and cross-link.

Template shipped at [`authoring/governance/rfc-amendment.md`](../authoring/governance/rfc-amendment.md):

- Status, author(s), started / resolved dates, target release, discussion link
- Motivation, detailed design, drawbacks, alternatives, open questions, references

Status values: `Draft | Proposed | Accepted | Rejected | Superseded`.

### ADR vs RFC

- **ADR** = record. Short, stable, immutable. Decided.
- **RFC** = proposal. Longer, evolving, versioned. Undecided.

An accepted RFC produces an ADR; the RFC itself stays in `docs/rfc/` as the extended rationale.

---

## What's NOT in this protocol

- **Commit-trailer enforcement** (`ADR: NNNN` trailer required on sacred-doc mutations) — deferred to a follow-up when the pre-commit hook infrastructure stabilises. Plan §5.2 bullet.
- **Sigstore-signed ADRs** — post-v1.0. Same tracker as security-gate SBOM signing.
- **Auto-generation of ADRs from code changes** — out of scope. ADRs are a human decision artefact.

---

## Extending

### Adding a sixth sacred doc

1. Author `schemas/sacred-docs/<id>.schema.json` (JSON Schema draft 2020-12).
2. Register it in `SACRED_DOC_SCHEMAS` in `src/governance/validate-schema.ts`.
3. Add a row to `validate-schema/SKILL.md` "registered sacred-doc schemas" table.
4. Optional: add a phase-gate semantic check (below) enforcing a non-empty array.

### Adding a semantic policy

Add a check to the owning phase's `lifecycle/<phase>/gate.json` — for a "field
must have ≥N items" rule, use `coldpress validate-frontmatter-min <doc> <field> --min <N>`
(block-severity). The check runs at phase exit, so it enforces completion without
blocking in-progress edits. (This replaced the earlier Conftest/Rego layer in
WS11 — same enforcement, no external policy-engine dependency.)

No policy in coldpress-os is load-bearing in a way a project can't override.

---

## See also

- [phase-gate-protocol.md](phase-gate-protocol.md) — governance checks plug in as `acceptance_check` entries.
- [sacred-docs.md](../governance/sacred-docs.md) — sacred-doc **content** governance (complements this doc's **shape** + **semantics**).
- [security-gate.md](security-gate.md) — §5.1 security, sibling gate.
- [handoff-schema-spec.md](handoff-schema-spec.md) — typed inter-phase handoffs use the same Zod-based validation pattern (Wave 2 Block L).

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

