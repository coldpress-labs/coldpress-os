---
step_number: 1
step_name: "Evidence Intake"
step_goal: "Read all Phase 2 inputs and build the evidence package for classification and candidate derivation"
halts_for_input: false
next_step: "step-02-classify.md"
---

## Goal

Consolidate everything Phase 2 produced — plus any pre-loaded vendor/legacy content — into a single evidence package. Nothing downstream should need to re-read these files.

## Instructions

### 1. Read Phase 2 warm-handoff artefacts

Read the following in order:

| File | What to extract |
|------|----------------|
| `_context/sacred/context.md` | Project intent, team_shape, project_shape, cadence, preferred_ides |
| `_context/handoffs/phase-2-to-3-*.md` (latest) | Phase 2 exit summary; any open questions handed over |
| `_context/planning/product-brief-v{N}.md` (latest version) | Value prop, target users, North Star metric, delivery constraints |
| `_context/planning/idea-validation-v{N}.md` (latest) | Riskiest assumptions, red-flags, go/no-go verdict |
| `_context/planning/research/personas-*.md` (all) | Accessibility targets, device types, locale/language requirements, accessibility persona edge-cases |
| `_context/planning/research/constraint-*.md` (all) | Compliance, performance, budget, browser-support envelopes |
| `_context/planning/research-synthesis-v{N}.md` (latest) | Synthesised evidence package |

If any required file is missing (product-brief or context.md), HaltError with clear guidance.

### 2. Read local configuration

- `.coldpress/local-config.yaml` — extract: `team_shape`, `project_shape`, `cadence`, `preferred_ides`, `user.tech_comfort`
- `coldpress.yaml` — extract: `project_name`, `version`, `stack_pack` (if already set from a prior run)

### 3. Check `_input/vendor/` contents

Enumerate files in `_input/vendor/`. For each, record: filename, apparent topic (infer from filename/path). These will be used in Step 3 for graph-query-first candidate derivation.

If `_input/vendor/` is empty: note "No vendor docs pre-loaded — Step 3 will rely on T2 catalog + T3 web-search."

### 4. Brownfield check

If `project_shape: brownfield`:
- Invoke `ops/repo-structure-audit` on `_input/legacy/`.
- Extract: primary runtime(s), detected framework(s), LOC by language, approximate dependency age.
- Record as **legacy gravity** signals to be used in Step 3 (candidate derivation) and Step 2 rubric (team-familiarity + lock-in weighting).

If greenfield: skip; no legacy gravity input.

### 5. Build evidence package summary

Produce an internal evidence package (not written to disk; held in context) with:

```
evidence_package:
  project_intent: "{one-liner from context.md}"
  team_shape: "{solo-hobby|solo-structured|team|client-project}"
  project_shape: "{greenfield|brownfield}"
  cadence: "{silent|summary|verbose}"
  value_prop: "{from product-brief}"
  north_star: "{from idea-validation}"
  riskiest_assumptions: [list]
  persona_signals:
    accessibility_targets: [list]
    device_types: [list]
    locales: [list]
  constraint_signals:
    compliance: [list]
    performance: [list]
    budget_tier: "{solo-hobby-free|solo-structured|team-bootstrap|team-funded|client-project}"
  vendor_docs: [list of topics pre-loaded]
  legacy_signals: {runtime, frameworks, locs}  # brownfield only
  open_questions_from_phase_2: [list]
```

## Output

Evidence package assembled. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-classify.md](step-02-classify.md)
