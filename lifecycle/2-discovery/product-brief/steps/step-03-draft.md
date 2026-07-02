---
step_number: 3
step_name: "Draft"
step_goal: "Draft the executive product brief from research-synthesis + idea-validation"
halts_for_input: true
next_step: "step-04-review.md"
---

## Goal

Compose the 1-2 page executive product brief. **Read the synthesis version, don't re-synthesise research.** That consolidation work already happened in `synthesize-research`; product-brief's job is to render the executive view on top.

## Instructions

### 1. Load the latest synthesis

Find the highest-numbered `_context/planning/research-synthesis-v*.md`. That's the primary input.

If no synthesis exists (user skipped `synthesize-research`), fall back to reading `_context/planning/research/*.md` fragments directly — but flag this in the output frontmatter as `derived_from: research-fragments` (weaker than synthesis-derived) and note that `synthesize-research` is recommended before regeneration.

### 2. Load the validation (if validate-idea ran)

Find the highest-numbered `_context/planning/idea-validation-v*.md`. Mine it for:
- Refined problem statement (Step 1)
- North Star + leading indicators (Step 5) — maps to Success Metrics section
- Differentiation statement (Step 3) — maps to Value Proposition section
- Any critical-weakness flag from Step 9 — surface honestly in the brief if `red_flag_disposition: proceed` was logged

Skip gracefully if no validation exists (solo vibe-coder skipped). Flag in frontmatter.

### 3. Draft structure

- **Product Name & Tagline** — one-liner
- **Problem Statement** — from `validation-v{N}` Step 1 if available, else from `context.md` §Problem space
- **Vision** — from `context.md` §Intent + aspirational framing
- **Target Users** — from `personas-*.md` primary archetype (if exists); else from `context.md` §Users
- **Value Proposition** — lift differentiation statement directly from `validation-v{N}` Step 3
- **Key Features** — 3-7; derive from synthesis themes + convergent signals
- **Success Metrics** — North Star + leading indicators from `validation-v{N}` Step 5 verbatim (they're the input to Phase 4 PRD acceptance criteria)
- **Strategic Context** — synthesis tensions that Phase 3 or Phase 4 will resolve
- **What's Different This Time** — *(brownfield only — fires when `.coldpress/local-config.yaml project_shape == brownfield`)*. One paragraph contrasting this v2 with the prior attempt preserved in `_input/legacy/`. What changed — audience shift / scope narrowing / technical reset / business pivot? Lift explicit signals from Phase 1 `intake` Step 9 (users) brownfield prose + Step 10 (constraints) legacy carry-over. Skip this section in greenfield / ambiguous projects.
- **Constraints** — surface blocking constraints from `_context/planning/research/constraint-*.md` that matter to stakeholders (accessibility level, compliance obligations, performance budgets)

### 4. Supersede-check for `_input/` conflicts (Wave 4.4)

Before finalising the draft, scan the brief's claims against pre-loaded `_input/` material. If the brief contradicts a pre-loaded document (e.g., brief says target users are SMBs, but `_input/raw/original-pitch.md` says enterprise), surface the conflict:

> *"The brief I've drafted says {new claim}. Your pre-loaded document `_input/{source-file}` says {old claim}. Want me to record that document as superseded by the product brief?"*

Butler calls `promptSupersede` with:
- `inputPath`: path to the conflicting `_input/` file
- `sacredDocPath`: `_context/planning/product-brief-v{N}.md` *(note: product-brief is a distillate, not sacred — the supersede audit still applies for governance traceability)*
- `decisionContext`: `"product-brief Step 3 — brief claim contradicts pre-loaded _input/ document"`

One check per conflicting document. Do not fire for `_input/` material that the brief simply doesn't reference (absence is not contradiction).

### 5. Writing guidelines

- Total length: 1-2 pages. Longer means less distilled.
- Executive-readable — no jargon, no method names (no "per Tier 1 JTBD this is..."), no method-process artefacts (no empathy map, no VPC grid). Those belong in their source docs.
- Every claim should trace to `context.md`, synthesis, or validation. Nothing freshly authored at brief-time.
- Bullet-heavy for scanability. Paragraphs only where narrative flow matters (Vision, Value Proposition).

### 6. Tier 2 method bias (optional)

If draft feels thin on Value Proposition, `innovation-strategy` router bias (per `method-defaults.yaml` Wave 3.10) points at:
- **Value Proposition Canvas** (also Tier 1 in `validate-idea` Step 3 — likely already applied, reuse)

Invoke only if gaps exist after pulling from validation.

### 7. Present draft to user

Halt:

> Here's the draft brief. Want to adjust tone for a specific audience (internal team / investor / stakeholder)? Any claims feel overstated or missing?

Iterate. Don't auto-advance.

## Output

Draft product brief presented for user review. `step_3_complete: true`

## Navigation

→ Proceed to [step-04-review.md](step-04-review.md)
