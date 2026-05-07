---
step_number: 4
step_name: "Critique & Write"
step_goal: "Adversarial + structural review; optional party-mode; write versioned output"
halts_for_input: true
next_step: "complete"
---

## Instructions

### 1. Invoke `adversarial-review`

Skill location: [`skills/reviews/adversarial-review/`](../../../skills/reviews/adversarial-review/).

Cynical-critic pass against the distilled synthesis. Target:
- **Bias** — where does the synthesis favour one source over contradicting ones without rationale?
- **Missing counter-evidence** — claims made without surfacing the case against them?
- **Shallow takes** — themes that could be any project (too generic) vs themes rooted in this project's specifics?
- **Unsurfaced tensions** — contradictions the Step 2 pass missed?

User may skip this pass if synthesis is clearly on target, but default is run. Present the critic's findings to the user.

### 2. Invoke `editorial-structure`

Skill location: [`skills/reviews/editorial-structure/`](../../../skills/reviews/editorial-structure/).

Structural polish — section ordering, header hierarchy, paragraph cohesion. Not prose-level editing (that belongs in `editorial-prose`, which wires into `pre-project-interview` Step 4, not here). Synthesis needs to read well for Phase 3 / Phase 4 skills that will consume it programmatically as much as for humans.

### 3. Party-mode — opt-in offer

Offer **only** when:
- `user.cadence = verbose`, OR
- `team_shape = client-project`

Prose:
> Tensions in this synthesis — want all 9 agents to weigh in on which matter most? 10-15 extra minutes. Party-mode catches cross-perspective blind spots before we hand off to Phase 3.

On user confirm: invoke [`skills/utilities/party-mode/`](../../../skills/utilities/party-mode/). Output lands at `_context/planning/discussions/party-phase-2-{date}.md`. On decline: proceed to write. **Never auto-run.**

### 4. Determine output version number

Scan `_context/planning/` for `research-synthesis-v*.md`:
- None exist → write `v1`
- Latest is `v{N}` → write `v{N+1}`

### 5. Write the versioned output

Target path: `_context/planning/research-synthesis-v{N}.md`

Frontmatter per the research-output schema (lands in Wave 4.6 — use the shape now so the schema just picks it up):

```yaml
---
name: research-synthesis
topic: <short label derived from context.md>
phase_authored: 2
status: final
supersedes: []           # supersede-check may add paths in Wave 4
sources:                 # URLs consulted during research
  - ...
graph_hits: []           # graph nodes this synthesis drew on
derived_from:
  - _context/sacred/context.md
  - _context/planning/research/domain-<date>.md
  - ...
version: "1.0"
synthesis_version: N     # integer, bumped per regeneration
---
```

Body structure:

```markdown
# Research Synthesis — <project name> (v{N})

## Themes

1. **<Theme A>** — <one-paragraph>
   - Evidence: <citations from research docs>
2. **<Theme B>** — …

## Tensions requiring downstream resolution

1. **<Tension>** — <source A says X, source B says Y>.
   - Resolution owner: **Phase 3 stack**.
2. …

## Convergent signals (high confidence)

- …

## Divergent signals (decision points)

- …

## Handoff — what Phase 3 should read first

- <pointer list>

## Handoff — what Phase 4 should read first

- <pointer list>
```

### 6. Present to user — halt

Show the final file. Confirm:

> Synthesis v{N} written to `_context/planning/research-synthesis-v{N}.md`. Ready to hand off to product-brief? Or should I run validate-idea first (if we haven't)?

On confirm: workflow complete.

## Output

Versioned synthesis document written. Workflow complete.

## Navigation

→ Workflow complete.
