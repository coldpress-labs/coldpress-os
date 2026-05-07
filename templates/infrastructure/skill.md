# Skill Template — coldpress-os

> Copy this directory structure and fill in SKILL.md. Add workflow.md and steps/ if type is `workflow`.
>
> **Authoring Standard (v0.3.0-alpha):** Every SKILL.md MUST carry explicit `license:`, `version:`, `updated:`, `category:` in frontmatter. Body MUST stay ≤10KB. Body MUST include "Proactive Triggers" + "Output Artifacts" sections. See "Authoring Standard" below for the full convention.

---

## SKILL.md Template

```yaml
---
name: "{skill-name}"
description: "{One-line trigger phrase. Sub-1024 chars. Used by Claude to decide when to invoke.}"
type: "{simple|workflow|reference|router}"
category: "{category}"          # e.g., creative, reviews, governance, utilities, meta, ops, lifecycle, stack-packs
agent: "{agent-slug}"            # primary owner: analyst|pm|ux-designer|architect|developer|qa|scrum-master|communicator|reviewer|devops|valet
phase: <N>                       # for lifecycle skills (single-phase) — integer 1-11
phases: [<N>, <M>, ...]          # for cross-cutting skills (multi-phase) — array
license: "MIT"                   # MUST be present; coldpress-os is MIT
version: "1.0"
updated: "YYYY-MM-DD"            # ISO date of last substantive edit
inputs:
  graph_queries:                 # what to fetch from the graph
    - "..."
  cold_file_reads:               # what to read directly from disk
    - "..."
  existence_checks:              # gate-blocking presence + status
    - "..."
outputs:
  - artifact: "{Name}"
    location: "{path}"
    format: "markdown"
    sacred: false
    schema_ref: "schemas/.../<schema>.json"   # if schema-driven
---
```

---

## SKILL.md Body Template (≤10KB)

```markdown
## Purpose

{2-3 sentences. What this skill does + why it exists. Avoid restating frontmatter.}

## When to Use (Proactive Triggers — 4-6 items)

Claude should invoke this skill when:

1. {Concrete trigger phrase or signal — one line.}
2. {...}
3. {...}
4. {...}

Each trigger should be a phrase a user might say or a system signal Claude detects. 4-6 triggers is the sweet spot — fewer means under-discoverable; more means trigger-bloat.

## Output Artifacts (4-6 items)

This skill produces:

1. **{Artifact name}** at `{location}` — {one-line purpose}
2. {...}
3. {...}
4. {...}

Each artifact should match an entry in the frontmatter `outputs:` block.

## Prerequisites

{What must exist before this skill can run. Lists files, gate states, prior-skill outputs.}

## Process

{For `type: simple` — inline instructions (≤30 lines).
For `type: workflow` — pointer to `workflow.md` + step-by-step navigation.
For `type: reference` — declarative content; no execution.
For `type: router` — describe sub-skill dispatch logic.}

## Activation-Gate Checklist

Before this skill is considered "complete" / "validated", confirm:

- [ ] {Gate-blocking precondition 1}
- [ ] {Gate-blocking precondition 2}
- [ ] {Output artefact written + validated against schema (if schema-driven)}
- [ ] {Pattern 7 transition emitted (if sub_phase_boundary or reconciliation_handoff applies)}
- [ ] {Partial-completion marker cleaned}

## Output

{What this skill produces and where it goes. Brief — refer up to "Output Artifacts" for the structured list.}

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | <author-agent> | Initial skill definition. |
```

---

## Authoring Standard (v0.3.0-alpha)

Adopted from external research (gap analysis 2026-05-03, U05) + coldpress-os internal conventions.

### Required frontmatter fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | kebab-case slug; matches parent directory |
| `description` | string | ≤1024 chars; phrased as trigger |
| `type` | enum | `simple` / `workflow` / `reference` / `router` |
| `category` | string | category dir under `skills/` or `lifecycle` for phase-attached |
| `agent` | string | primary owner agent slug |
| `phase` OR `phases` | int / int[] | singular for lifecycle (single-phase); array for cross-cutting |
| `license` | string | `MIT` (or compatible). Non-negotiable |
| `version` | string | semver |
| `updated` | string | ISO date `YYYY-MM-DD` |
| `inputs` | object | graph_queries / cold_file_reads / existence_checks blocks |
| `outputs` | array | structured artifact descriptors |

### Body size cap

**SKILL.md body ≤10KB.** If a skill needs more, push detail to:
- `workflow.md` (multi-step orchestration)
- `steps/step-NN-*.md` (per-step instructions)
- `references/*.md` (deep reference material)
- `templates/*.md` (authoring templates the skill uses)
- `scripts/*.{py,sh,js}` (utility scripts the skill invokes)

The 10KB cap forces clean separation between the skill's contract (SKILL.md) and its mechanics (everything else).

### Required body sections

1. **Purpose** — 2-3 sentences
2. **When to Use (Proactive Triggers — 4-6)** — concrete trigger phrases or signals
3. **Output Artifacts (4-6)** — what the skill produces, matched to frontmatter `outputs:`
4. **Prerequisites** — gate-blocking preconditions
5. **Process** — inline (simple) or workflow.md pointer (workflow)
6. **Activation-Gate Checklist** — completion criteria
7. **Output** — brief recap
8. **Version Control panel** — full VC table per estate Standing Rule 10.1

### License-in-frontmatter rule

`license:` field is non-negotiable. Skills with no license cannot be vendored. Memory `reference_doc_processor_licenses` enforces this on ingestion; we apply symmetrically to authoring.

### How to validate a SKILL.md

```bash
# Manual checks (until validator script lands):
# 1. Frontmatter has all required fields
# 2. Body ≤10KB: wc -c < SKILL.md (subtract frontmatter manually)
# 3. All 6 required sections present
# 4. License compatible (MIT/Apache-2.0/BSD/CC0)
# 5. VC panel current

# Future: `coldpress validate skill <path>` will enforce automatically.
```

### Authoring helper

For new skills, run `@valet skill-builder` (the meta skill that walks through this standard interactively and emits a compliant scaffold).

---

## Forbidden patterns

- **No `license:` field** → skill is non-vendorable. CI should reject.
- **SKILL.md body >10KB** → push detail to `workflow.md` / `steps/` / `references/`.
- **Missing Proactive Triggers section** → Claude has no signal for when to invoke.
- **Missing Output Artifacts section** → audit can't verify what the skill produces.
- **GPL/AGPL-derived content** → license incompatible with coldpress-os MIT.
