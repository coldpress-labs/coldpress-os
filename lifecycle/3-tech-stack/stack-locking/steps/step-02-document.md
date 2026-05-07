---
step_number: 2
step_name: "Write Tech Stack Document"
step_goal: "Draft _context/sacred/tech-stack.md + stack-selection-summary-v{N}.md with editorial polish"
halts_for_input: false
next_step: "step-03-pre-lock-review.md"
---

## Goal

Produce the comprehensive, authoritative tech stack document (pre-lock draft) and a validated distillate summary. Invoke editorial-structure for structural polish before presenting.

## Instructions

### 1. Determine tech-stack.md version

Check `_context/sacred/tech-stack.md`. If it exists with `sacred: true`: this should have gone through the change-workflow. If it exists as draft: we're continuing that draft. If absent: first authoring.

### 2. Write `_context/sacred/tech-stack.md` (DRAFT — not yet sacred)

**Frontmatter:**
```yaml
---
name: "tech-stack"
sacred: false  # locked in Step 4; never set true here
status: "draft"
version: "{date}"
derived_from:
  - "_context/sacred/context.md"
  - "_context/planning/product-brief-v{N}.md"
  - "_context/planning/stack-shortlist-v{N}.md"
  - "_context/planning/adrs/adr-*-v*.md"
supersedes: []  # populated if any ADR had supersede flags
approved_by: null  # set at lock
lock_date: null    # set at lock
---
```

**Sections** (mark each N/A if not applicable to this project's product type):

- **Project & Stack Overview** — product name, product type, domain complexity, stack philosophy (one paragraph from the ADRs' collective reasoning)
- **Frontend** — framework, UI approach, styling, state management (from ADR)
- **Backend** — runtime, framework, API style (if applicable; N/A for static/CLI)
- **Database** — engine, ORM/query builder, migration strategy (if applicable)
- **Authentication** — provider, strategy, authorization model (if applicable)
- **Hosting** — platform, deployment strategy, CDN
- **Testing** — unit, integration, E2E frameworks and strategy
- **CI/CD** — pipeline tool, deployment automation
- **Dev Tools** — package manager, linting, formatting, git hooks, editor config
- **Baselines** — placeholder (filled at Step 5a with confirmed baselines)
- **ADR References** — links to all source ADRs under `_context/planning/adrs/`

For each section: chosen technology + version (if known) + one-line rationale + tier (T1/T2/T3) + any constraints.

**Brownfield section** (if applicable): "What's carried over / what's new / what's replaced" — from Step 1 inventory.

### 3. Write `_context/planning/stack-selection-summary-v{N}.md`

**Frontmatter:**
```yaml
---
name: "stack-selection-summary"
phase_authored: 3
status: "draft"
version: "{N}.0"
derived_from:
  - "_context/sacred/tech-stack.md"
  - "_context/planning/adrs/ (all ADRs)"
regeneratable: true
supersedes: []
---
```

**Body:** Compressed stack summary — one row per decision area: area, chosen, tier, weighted_total, key rationale. Suitable for LLM context hand-offs.

### 4. Invoke editorial-structure

Run `editorial-structure` on the tech-stack.md draft for structural polish — cuts, reorganisation, clarity.

### 5. Populate `supersedes:` frontmatter

If any ADR had `supersedes:` entries, aggregate them into tech-stack.md `supersedes:` array. This makes the sacred doc self-documenting about which `_input/` claims it overrides.

## Output

`_context/sacred/tech-stack.md` drafted (status: draft). `_context/planning/stack-selection-summary-v{N}.md` drafted. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-pre-lock-review.md](step-03-pre-lock-review.md)
