---
name: "legacy-ui-assessment"
description: "Phase 5 — conditional skill that compares legacy UI/design assets in `_input/legacy/` against the new design-brief direction. Decisions: keep / refresh / discard / reference-only. Output feeds ux-design (which screens reuse legacy components) and brand-guidelines (which legacy tokens inform new tokens). Per Q6 resolution."
type: "workflow"
category: "lifecycle"
phase: 5
agent: "ux-designer"
conditional: true
trigger_condition: "_input/legacy/ contains UI/design assets (CSS/SCSS/TSX/JSX/Figma exports/tokens.json/style-guide.md/etc.); flag set by design-brief Step 0"
inputs:
  graph_queries:
    - "legacy-input"
    - "legacy-migration-plan-v{latest}"
    - "design-brief-v{latest}"
    - "brand-guidelines-v{latest}"
  cold_file_reads:
    - "_input/legacy/* (UI/design files discovered)"
    - "_context/planning/design-brief-v{latest}.md"
  existence_checks:
    - "design-brief-v{latest} exists"
    - "legacy-input.has_ui_assets == true"
outputs:
  - artifact: "Legacy UI Assessment"
    location: "_context/design/legacy-ui-assessment-v{N}.md"
    format: "markdown"
    sacred: false
    distillate: true
    schema: "schemas/design/legacy-ui-assessment.schema.json"
  - artifact: "Legacy UI Assessment sidecar"
    location: "_context/design/legacy-ui-assessment-v{N}.meta.json"
    format: "json"
version: "1.0"
---

## Purpose

Phase 5 — assess legacy UI/design assets against the new design-brief direction. Conditional skill (only runs when `_input/legacy/` contains UI/design files; otherwise silent skip).

Phase 4 `legacy-assessment` is architecture-focused (against `tech-stack.md`). UI legacy needs comparison against the new `design-brief` direction (which doesn't exist until Phase 5). This skill closes that gap per Q6 resolution.

Decisions per asset: **keep** / **refresh** / **discard** / **reference-only**. Output feeds:
- `ux-design` — which screens reuse legacy components
- `brand-guidelines` — which legacy tokens inform new tokens

## When to Use

- Conditional — Phase 5 invokes only when `legacy-input.has_ui_assets == true` (set by `design-brief` Step 0).
- Skip silently when no legacy UI assets present.

## Prerequisites

- `design-brief-v{latest}.md` exists (provides new direction to compare against)
- `_input/legacy/` contains UI/design assets

## Process

4-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

`_context/design/legacy-ui-assessment-v{N}.md` validated-distillate covering:
- Inventory of legacy UI assets (categorised: components / tokens / style-guides / marketing-assets)
- Per-asset decision: keep / refresh / discard / reference-only with rationale
- Cross-reference with Phase 4 `legacy-migration-plan-v{N}` (architecture decisions overlap)

## Cross-cutting wire-ins

- `editorial` — Step 3 finalisation (decisions table structure check)

## Decision criteria

| Decision | Criterion |
|----------|-----------|
| keep | Asset compatible with new design-brief direction; brand-voice-aligned; tech-stack-implementable |
| refresh | Compatible direction but needs token/voice/style updates per new brand-guidelines |
| discard | Direction divergent OR tech-stack-incompatible OR brand-voice-mismatched; new authoring required |
| reference-only | Historical reference / informs design but not directly reused (e.g., legacy logo informs new logo evolution but isn't kept verbatim) |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.7) | Initial `legacy-ui-assessment` skill — NEW under Shape A. Resolves deep-dive finding B21 + Q6 resolution. Conditional skill (silent skip when no UI legacy). Compares legacy UI/design assets against new design-brief direction. Decisions: keep / refresh / discard / reference-only. Cross-references Phase 4 legacy-migration-plan (architecture-decisions overlap). Output feeds ux-design (component reuse) and brand-guidelines (token inheritance). 4-step workflow. editorial wire-in at Step 3. |
