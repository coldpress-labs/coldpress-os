---
name: templates-registry
description: Single-surface index of every template coldpress-os ships — by category, phase, and consuming skill
version: "1.0"
---

# Template Registry

> Every template in `templates/` has a purpose and a consumer. Before this registry, consumers were scattered across phase READMEs and SKILL.md step files — discoverability was poor and orphan templates accumulated. This registry is the single-surface lookup: what templates exist, what category each belongs to, which phase(s) consume them, which skill(s) wrap them, and what fields each requires.

**Source decision:** [framework-audit-2026-04-23.md §6](../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md) (audit lives at Lab HQ project level).

**Scope:** documents current state. **Not a full template refactor** — orphaned templates get either a phase reference or an explicit "reference-only" annotation; consolidation work stays for a future wave.

---

## Overview

| Category | Dir | Count | Status |
|----------|-----|-------|--------|
| Documents | `templates/documents/` | 11 | Partially wired — sacred-doc templates + epic/story/ADR/retro/sprint |
| Design | `templates/design/` | ~48 | Reference-only (WDS-heritage) — aggressive prune planned for a future wave |
| Infrastructure | `templates/infrastructure/` | 6 | Reference-only — contributor-facing authoring reference |
| Contracts | `templates/contracts/` | 3 | Reference-only — legacy CIS heritage |

See also [`templates/README.md`](../templates/README.md) for the per-subdir disposition from Wave 1.

---

## `templates/documents/` — sacred-doc + lifecycle artefact templates

| Template | Category | Consuming phase | Consuming skill | Required fields | Status |
|----------|----------|-----------------|-----------------|-----------------|--------|
| `context.md` | document | Phase 2 (Discovery) | `pre-project-interview` (implicit reference) | project, stakeholders, problem, goals | sacred-doc template |
| `tech-stack.md` | document | Phase 3 (Tech Stack) | `stack-locking` (implicit reference) | stack summary, rationale, ADRs | sacred-doc template |
| `prd.md` | document | Phase 4 (Planning) | `create-prd` (explicit reference) | executive summary, goals, NFRs, constraints, out-of-scope | sacred-doc template |
| `architecture.md` | document | Phase 6 (Architecture) | `architecture-design` (explicit reference) | architectural drivers, components, diagrams, NFR allocation | sacred-doc template |
| `pert-chart.md` | document | Phase 7 (Breakdown) | `parallelization-strategy` (implicit reference) | epics, dependencies, wave assignments | sacred-doc template |
| `ux-design-spec.md` | document | Phase 5 (Design) | `ux-design` (explicit reference) | scenarios, wireframes, design-system refs | in active use |
| `epic.md` | document | Phase 7 (Breakdown) | `create-epics` (implicit reference) | epic summary, story list, component impact | in active use |
| `story.md` | document | Phase 7 (Breakdown) → Phase 8 (Implementation) | `create-stories`, `dev-story` | file scope, acceptance criteria, test coverage | in active use |
| `adr.md` | document | Phase 3, 6 (ad-hoc) | `stack-evaluation`, `architecture-design` | decision, options, trade-offs, chosen + rationale | in active use |
| `sprint-status.yaml` | document | Phase 7, 8, 10 | `sprint-planning`, `wave-orchestration`, `sprint-status` (Phase 10) | sprint, epics, stories, velocity, status | in active use |
| `retrospective.md` | document | Phase 11 (Evolve) | `retrospective` (implicit reference) | what went well, what went wrong, actions | in active use |

**Wave 4 disposition:** wire all sacred-doc templates explicitly into their producing skill's step files (currently several are implicit references). Tracked for Wave 4 §4.3 as part of skill step-file refresh.

---

## `templates/design/` — WDS design template suite

**48 files.** Consumer-phase attribution for the full suite is pending the broader template-audit pass. Summary classification (kept from Wave 1's `templates/README.md`):

- `00-` prefix → entry-point forms (`product-brief`, `design-log`, `design-system`, `ux-scenarios`, `trigger-map`)
- `wds*-`/`design-tokens.*` → Whiteport Design System artefacts
- Handoff / story / scenario / signoff → WDS-workflow-internal artefacts

| Status | What it means |
|--------|---------------|
| Reference-only | Documents the WDS workflow shape. Not auto-invoked by any shipped skill. |

**Wave 4 disposition:** aggressive prune against actual `@ux-designer` / `create-ux-design` needs. Most likely outcomes: keep 5-10, split the rest into a separate `@coldpress/ux-templates` optional pack, or retire. **No pruning action this block** — registry documents current state only. Consolidation is a future-wave concern.

---

## `templates/infrastructure/` — contributor-facing authoring templates

| Template | Category | Purpose | Consuming skill |
|----------|----------|---------|-----------------|
| `CLAUDE.md` | infrastructure | Shape of the project-template's CLAUDE.md | — (reference; new projects get this from `template/CLAUDE.md`) |
| `SYSTEM.md` | infrastructure | Shape of `.claude/SYSTEM.md` | — (reference; copied and placeholder-filled by `coldpress init`) |
| `agent.md` | infrastructure | Shape of a new subagent definition | `agent-builder` (explicit reference) |
| `cursorrules.md` | infrastructure | Shape of legacy `.cursorrules` | — (reference; interop generator emits the live version from `.claude/agents/*`) |
| `skill.md` | infrastructure | Shape of a new coldpress-os skill | `skill-builder` (explicit reference) |
| `workflow.md` | infrastructure | Shape of a new workflow SKILL | `workflow-builder` (explicit reference) |

**Wave 4 disposition:** relocate to `docs/contributor/` or `install/contributor-templates/`. Current location blurs "shipped-to-consumer" with "framework-authoring-reference." **No relocation this block** — the meta skills (`@valet`-owned) need their step-files updated in tandem with any move.

---

## `templates/contracts/` — client-engagement templates

| Template | Category | Purpose | Consuming skill |
|----------|----------|---------|-----------------|
| `contract.template.md` | contract | Base contract template | — (no consumer today) |
| `pitch.template.md` | contract | Client pitch deck shell | — (no consumer today) |
| `service-agreement.template.md` | contract | Service agreement shell | — (no consumer today) |

**Status:** orphaned — no skill references these. Kept in the framework so Lab-Clients-style projects have a starting point.

**Wave 4 disposition:** wire into a Phase-1 or Phase-2 onboarding skill for client projects, or retire and move to a separate stack pack. **No action this block** — neither option is blocking.

---

## Orphans — templates with zero skill references

The following templates are in the tree but have no explicit or implicit consuming-skill reference:

- All 3 `templates/contracts/` files
- `templates/infrastructure/cursorrules.md` (superseded by the interop generator)
- Most of `templates/design/` (specific list pending the future prune)

Orphans are **not removed this block** — the registry documents their status so the future template-refactor pass has a scoped worklist.

---

## Extending

When adding a new template:

1. Pick the right category dir (`documents/` / `design/` / `infrastructure/` / `contracts/`).
2. Name it `<purpose>.template.md` or `<purpose>.md` matching the nearest existing convention.
3. Add a row to the appropriate table above with: consuming phase, consuming skill, required fields.
4. If the template is consumed by a specific skill, reference it from that skill's step files.
5. Bump this doc's version.

---

## See also

- [`templates/README.md`](../templates/README.md) — Wave 1 inventory with per-subdir disposition.
- [`docs/skill-index.md`](skill-index.md) — the companion Skill Discovery Index.
- [`docs/architecture.md`](architecture.md) §Templates — narrative overview.
- [`REGISTRY.md`](../REGISTRY.md) — high-level framework registry.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

