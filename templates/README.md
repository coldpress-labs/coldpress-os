---
name: templates-inventory
description: Inventory of template folders and their current lifecycle wiring status
version: "1.0"
---

# Templates Inventory

> Templates in coldpress-os ship as reference content. Some are consumed by lifecycle skills; the rest are reference-only and wait for a Wave 4 §4.7 pass to be either wired in or retired.

Audit filed **2026-04-23** as part of Wave 1 §1.8 (Phase I framework-audit follow-up). Full integration decisions land in Wave 4 §4.7 (Template Registry).

---

## `templates/contracts/` — reference-only

**Files:** `contract.template.md`, `pitch.template.md`, `service-agreement.template.md`
**Lifecycle references:** none
**Status:** reference-only. These are CIS-heritage client-engagement templates. They are kept in the framework so Lab Clients–style projects have a starting point, but no lifecycle phase auto-invokes them today.
**Disposition at Wave 4 §4.7:** wire into a Phase-1 or Phase-2 onboarding skill for client projects, or retire and move to a separate stack pack.

---

## `templates/design/` — reference-only

**Files:** ~48 design / UX / content / component templates (CIS + WDS heritage).
**Lifecycle references:** none
**Status:** reference-only. This is the largest orphan surface — the full WDS template suite shipped with the v0.1 framework, but the current 9-subagent model (and lean `create-ux-design` skill) consume almost none of them. They remain valuable as patterns but are not wired into any workflow.
**Disposition at Wave 4 §4.7:** prune the set hard against actual `@ux-designer` / `create-ux-design` needs; the vast majority likely retire or split into a `@coldpress/ux-templates` optional pack. Do not let this grow further without a clear consumer.

---

## `templates/documents/` — partially wired

**Files:** `adr.md`, `architecture.md`, `context.md`, `epic.md`, `pert-chart.md`, `prd.md`, `retrospective.md`, `sprint-status.yaml`, `story.md`, `tech-stack.md`, `ux-design-spec.md`.
**Lifecycle references (direct):**
- `lifecycle/4-planning/create-architecture/steps/step-04-finalize.md` — uses `architecture.md`
- `lifecycle/4-planning/create-ux-design/steps/step-04-spec.md` — uses `ux-design-spec.md`
- Additional referential links in `docs/flow-map.md`.

**Status:** partially wired. The five sacred-doc templates (`context.md`, `tech-stack.md`, `prd.md`, `architecture.md`, `pert-chart.md`) are *conceptually* the reference shape of each sacred document, but only two are cited by their authoring skill's step files today. The other three are reference-only in the lifecycle code path.
**Disposition at Wave 4 §4.7:** connect every sacred-doc authoring skill to its template explicitly so the Template Registry is complete. Non-sacred doc templates (`epic.md`, `story.md`, `retrospective.md`, `sprint-status.yaml`, `adr.md`) likely stay in this folder and gain explicit step-file references.

---

## `templates/infrastructure/` — reference-only

**Files:** `CLAUDE.md`, `SYSTEM.md`, `agent.md`, `cursorrules.md`, `skill.md`, `workflow.md`.
**Lifecycle references:** none
**Status:** reference-only. These are *authoring* templates for framework contributors (e.g., "what does a new agent definition look like?"). They are not consumed by any consumer-project workflow.
**Disposition at Wave 4 §4.7:** move under `docs/contributor/` or `install/` as explicit contributor-facing reference, separate from consumer-project templates. The current location blurs "ship-to-consumer" and "framework-authoring-reference" into the same folder.

---

## Summary

| Folder | Lifecycle Consumption | Disposition |
|--------|-----------------------|-------------|
| `contracts/` | none | Wire in Phase-1 onboarding for client projects, or retire to a separate pack |
| `design/` | none | Aggressive prune against actual `@ux-designer` use; split off what survives |
| `documents/` | 2 of 11 cited | Finish wiring sacred-doc authoring skills to their templates |
| `infrastructure/` | none | Relocate to contributor-facing docs |

Wave 4 §4.7 (Template Registry) will act on these dispositions. Until then, the inventory above is the canonical status record.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-23 | Cadbury-hq | Initial inventory — filed as part of Wave 1 §1.8 audit sweep. Four subdirs classified; full integration decisions deferred to Wave 4 §4.7. |
