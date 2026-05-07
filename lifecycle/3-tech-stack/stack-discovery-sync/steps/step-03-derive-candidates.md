---
step_number: 3
step_name: "Derive Candidates"
step_goal: "Build a tiered candidate list per decision-area, evidence-bound and graph-query-first"
halts_for_input: false
next_step: "step-04-shortlist.md"
---

## Goal

For each relevant decision-area, derive a candidate list using the 3-tier ordering. Candidates are *derived from evidence*, not named ad-hoc. For Tier 3 areas, query the knowledge graph against pre-loaded vendor docs before web-searching.

## Tier 1 Core Methods

- **Morphological Analysis:** Map each decision-area independently; identify the full possibility space before filtering.
- **Pareto Analysis:** Focus on the 20% of decision-areas that drive 80% of the architecture constraints (complexity/compliance/performance signals from constraint-research).

*(Source: `data/methods/problem-solving-methods.csv`, synthesis + analysis categories)*

## Instructions

### 1. Determine decision-areas for this project

Start with the standard set: `frontend`, `hosting`, `database`, `auth`, `styling`, `package_manager`, `testing`, `ci`, `source_control`. Add `cms` if evidence suggests content-heavy product (blog, marketing, editorial). Add `backend` if evidence suggests server-side logic beyond static/serverless.

**Lean heuristics** (calibrate by `cadence`):
- `cadence: silent` → lean 3-4 decision-areas (most critical only; pack-covered rest)
- `cadence: summary` → default 5-7 areas
- `cadence: verbose` → comprehensive (all relevant areas)

For each area, apply Pareto Analysis: flag the 2-3 areas where evidence signals the strongest constraints (these get more evaluation depth in stack-evaluation).

**Stack-pack discovery walk:** Glob `skills/stack-packs/*/quickstart/SKILL.md`. For each pack detected: if shortlist will include a candidate matching the pack's primary tech (e.g., `database: Convex`), mark `pack_available: true` in that area's shortlist entry.

### 2. For each decision-area, derive candidates by tier

**Pack-confirmed areas (user confirmed a pack in Step 2b):**
- **T1 candidate** = `{pack.pre_picked[area]}` — shown as the recommended default; one-line trade-off statement
- **T2 alternatives** = `data/stack-catalog/{area}.yaml` top 2 options (for user awareness / override context)
- Note: T1 triggers fast-path ADR in stack-evaluation (no full rubric walk needed)

**Pack-uncovered areas OR user chose skip-packs:**
- **T2 candidates** = `data/stack-catalog/{area}.yaml curated_top` — up to 5 options
- Apply evidence filter: disqualify any T2 candidate that hard-fails a constraint (e.g., US-only SaaS backend when compliance requires EU data residency; note the disqualification reason)
- Persona filter: flag any T2 candidate that conflicts with accessibility targets or locale requirements

**Areas with no catalog entry, or user rejects all T2 options:**
- **T3:** Graph-query first → web-search fallback
  - Run: `coldpress graph query --dir-role _input/vendor/ --topic "{decision-area}"` — surface pre-loaded vendor docs for this area
  - If graph hits exist: incorporate into candidate evidence; web-search only for gaps
  - If no hits: normal web-search flow; `distillator` compresses into stack-ready brief
  - Output gets indexed on next graph rebuild

**Brownfield areas (if `project_shape: brownfield`):**
- Add legacy candidate: the existing technology in use (from legacy gravity signals)
- Weight team-familiarity dimension higher for brownfield candidates matching legacy stack
- Flag migration cost if switching (feeds stack-evaluation rubric lock-in dimension)

### 3. Invoke distillator (T3 areas)

For any T3 area where web-search or vendor-doc reading was needed: invoke `distillator` to produce an LLM-optimised stack-ready brief. Attach the brief to the candidate entry in the shortlist.

### 4. Supersede check

For each decision-area where a candidate conflicts with a claim in `_input/raw/brief.md` or other `_input/` docs (e.g., brief assumes Supabase but evidence rules it out):
- Invoke supersede-check helper (`src/governance/supersede.ts`)
- Flag the conflict in the shortlist Section B entry with note: "This selection supersedes `_input/{file}` which assumed {original choice}. Supersede audit row will be written at lock."

## Output

Per-area tiered candidates derived with evidence-bound rationale. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-shortlist.md](step-04-shortlist.md)
