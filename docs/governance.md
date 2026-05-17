---
name: governance
description: Sacred-doc governance layer — Ajv structural validation + Conftest semantic policies + ADR/RFC scaffolding
version: "1.0"
---

# Governance (§5.2)

> The sacred docs (`context.md`, `tech-stack.md`, `prd.md`, `architecture.md`, `pert-chart.md`) are the load-bearing artefacts of a coldpress-os project — downstream skills consume them as contracts. Before this protocol, their frontmatter was prose-regulated. This doc specifies the governance layer: Ajv validates shape; Conftest validates semantics; ADRs anchor decisions; RFCs propose them.

**Source decision:** [framework-audit-2026-04-23.md §9](../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md) + [oss-integration-survey-2026-04-22.md Tier 1 §1.5](../../../lab-hq-projects/hq-p001-coldpress-os/docs/oss-integration-survey-2026-04-22.md).

---

## Two validators

### 1. `validate-schema` — structural (Ajv, in-process)

`skills/governance/validate-schema` validates sacred-doc YAML frontmatter against per-doc JSON Schemas. Runs in-process via [Ajv](https://github.com/ajv-validator/ajv) (MIT) — no subprocess, no install.

**Five schemas shipped** at `schemas/sacred-docs/`:

| Sacred doc | Schema |
|------------|--------|
| `_context/sacred/context.md` | `context.schema.json` |
| `_context/sacred/tech-stack.md` | `tech-stack.schema.json` |
| `_context/sacred/prd.md` | `prd.schema.json` |
| `_context/sacred/architecture.md` | `architecture.schema.json` |
| `_context/sacred/pert-chart.md` | `pert-chart.schema.json` |

Each schema requires at minimum:
- `sacred: true` (const — the marker)
- `version: "X.Y"` (semver-ish)
- `governance: "requires-review" | "locked" | "draft"`
- `workflowType` pinned to the doc kind (`"prd"`, `"architecture"`, etc.)

Doc-specific fields (PRD's `adr_references[]`, architecture's `approvers[]`, pert's `waves[]`) layer on top. `additionalProperties: true` leaves room for project-specific extensions.

### 2. `validate-sacred-doc` — semantic (Conftest + Rego)

`skills/governance/validate-sacred-doc` enforces **cross-field** and **cross-document** policies via [Conftest](https://github.com/open-policy-agent/conftest) (Apache-2.0) running [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/). Examples:

- "PRDs must reference ≥1 ADR" (`prd_has_adr.rego`)
- "Architecture.md changes must list ≥1 approver" (`architecture_has_approvers.rego`)
- "PERT chart must reference architecture.md as an input" (`pert_references_architecture.rego`)

Policies ship at `templates/governance/policies/`. Adding one: drop a new `.rego` file; no registry update needed.

**Run order:** structural first, semantic second. A doc that fails structural validation can't be meaningfully checked for semantics.

---

## ADRs — anchoring decisions

Every coldpress-os project ships with `docs/adr/` seeded by `coldpress init`:

- `0000-use-adr.md` — the Nygard seed ADR explaining the decision to use ADRs
- `README.md` — format, link to [adr-tools](https://github.com/npryce/adr-tools) (BSD-2, optional)

### The enforcement loop

1. PRD frontmatter carries `adr_references: ["ADR-NNNN", …]`.
2. Ajv's `prd.schema.json` requires each entry to match `^ADR-\d{4}$`.
3. Conftest's `prd_has_adr.rego` requires the array to be non-empty.
4. Phase-4 gate (`lifecycle/4-planning/gate.json`) runs both as `acceptance_check` entries.

Outcome: a PRD can never land without anchoring to at least one ADR. Re-litigating a PRD's direction means re-examining the linked ADR — no lost context.

---

## RFCs — proposing decisions

RFCs live at `docs/rfc/` in consumer projects. They're for **larger proposals that need space to think** before reaching a decision. Once an RFC resolves, distill the outcome into a new ADR and cross-link.

Template shipped at [`templates/governance/rfc-amendment.md`](../templates/governance/rfc-amendment.md):

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
4. Optional: ship Rego policies enforcing semantics.

### Adding a semantic policy

Drop a new `.rego` file under `templates/governance/policies/`. Use `package sacred_doc`; any `deny[msg]` rule triggers a Conftest failure. No registry update required — Conftest globs the whole directory.

### Relaxing a policy for a specific project

The shipped Rego policies are **suggested defaults**. Consumer projects can:
1. Drop in their own `.rego` policies in a project-local `templates/governance/policies-local/`.
2. Override the Conftest invocation to point at the local dir instead of (or in addition to) the framework's.

No policy in coldpress-os is load-bearing in a way a project can't override.

---

## See also

- [phase-gate-protocol.md](phase-gate-protocol.md) — governance checks plug in as `acceptance_check` entries.
- [sacred-docs.md](../governance/sacred-docs.md) — sacred-doc **content** governance (complements this doc's **shape** + **semantics**).
- [security-gate.md](security-gate.md) — §5.1 security, sibling gate.
- [handoff-schema-spec.md](handoff-schema-spec.md) — typed inter-phase handoffs use the same Zod-based validation pattern (Wave 2 Block L).

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

