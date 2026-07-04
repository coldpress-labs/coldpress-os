# Skill Schema — coldpress-os

> Defines the unified format for all skill definitions. Every skill directory in `skills/` MUST conform to this schema.

---

## File Convention

Each skill is a **directory** containing at minimum a `SKILL.md` file:

```
skills/{category}/{skill-name}/
├── SKILL.md              # Required — skill definition and entry point
├── workflow.md            # Optional — for multi-step workflow skills
├── steps/                 # Optional — step-files for workflow skills
│   ├── step-01-*.md
│   ├── step-02-*.md
│   └── ...
├── assets/                # Optional — templates, reference docs, examples
└── references/            # Optional — external reference material
```

**Directory naming:** `{kebab-case-skill-name}/` (e.g., `brainstorming/`, `test-design/`)

---

## Skill Types

| Type | Has workflow.md? | Has steps/? | Use When |
|------|-----------------|-------------|----------|
| `simple` | No | No | Single-pass execution (code review, env check) |
| `workflow` | Yes | Yes | Multi-step guided process (product brief, PRD creation) |
| `reference` | No | No | Lookup/reference only (teach-me-testing sessions) |

---

## SKILL.md — Required Frontmatter

```yaml
---
name: "{skill-name}"
description: "{One-line description — used as trigger phrase}"
type: "{simple|workflow|reference}"
category: "{reviews|testing|creative|utilities|ops|meta|stack-packs}"
agent: "{primary-agent-slug}"
phases: [4, 5]
inputs:
  - "coldpress.yaml"
  - "_context/sacred/context.md"
outputs:
  - artifact: "PRD"
    location: "_context/sacred/prd.md"
    format: "markdown"
version: "1.0"
---
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Kebab-case skill identifier |
| `description` | string | Yes | One-line description, doubles as Claude trigger phrase |
| `type` | enum | Yes | `simple`, `workflow`, or `reference` |
| `category` | string | Yes | Skill category directory name |
| `agent` | string | No | Primary agent persona slug (if applicable) |
| `phases` | int[] | Yes | Lifecycle phases where this skill is used |
| `inputs` | string[] | No | Files/context this skill reads |
| `outputs` | object[] | No | Artifacts this skill produces |
| `outputs[].artifact` | string | Yes | Artifact name |
| `outputs[].location` | string | Yes | Output path (relative to project root) |
| `outputs[].format` | string | Yes | Output format |
| `version` | string | Yes | Semver of this skill definition |

---

## SKILL.md — Required Sections

### 1. Purpose

What this skill does, in 2-3 sentences.

### 2. When to Use

Conditions under which this skill should be invoked. Include trigger phrases.

### 3. Prerequisites

What must exist before this skill can run (files, prior skills, project state).

### 4. Process

For `simple` skills: the complete execution instructions inline.

For `workflow` skills: brief overview, then pointer to `workflow.md`.

```markdown
## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.
```

### 5. Output

What this skill produces and where it goes.

---

## workflow.md — For Workflow Skills

```yaml
---
workflow_version: "1.0"
output_file: "{output_folder}/{artifact-name}.md"
total_steps: 8
resume_from: "frontmatter"
---
```

### Required Content

1. **Overview** — What the workflow accomplishes end-to-end
2. **Step Index** — Table of all steps with one-line descriptions
3. **Execution Rules** — Standard coldpress-os workflow rules (below)
4. **Completion Criteria** — How to know the workflow is done

### Standard Execution Rules

Every workflow.md MUST include these rules:

```markdown
## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.
```

---

## Step Files — For Workflow Skills

```
steps/step-{NN}-{descriptive-name}.md
```

### Required Frontmatter

```yaml
---
step_number: 1
step_name: "{Descriptive Name}"
step_goal: "{One sentence — what this step accomplishes}"
halts_for_input: true
next_step: "step-02-{name}.md"
---
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step_number` | int | Yes | Sequential step number |
| `step_name` | string | Yes | Human-readable step name |
| `step_goal` | string | Yes | One-sentence purpose |
| `halts_for_input` | bool | Yes | Whether this step waits for user input |
| `next_step` | string | Yes | Filename of next step (or `"complete"`) |

### Required Content

1. **Goal reminder** — What this step accomplishes
2. **Instructions** — What to do (for the agent executing)
3. **User interaction** — Questions to ask, options to present
4. **Output** — What to write/append to the output document
5. **Navigation** — Menu or next-step pointer

### Step File Variants

For skills that support create, edit, and validate modes:

```
steps/
├── steps-c/          # Create mode (new document)
│   ├── step-01-*.md
│   └── ...
├── steps-e/          # Edit mode (modify existing)
│   ├── step-01-*.md
│   └── ...
└── steps-v/          # Validate mode (review existing)
    ├── step-01-*.md
    └── ...
```

---

## Assets and References

### assets/

Skill-specific templates, data files, or examples that the skill needs during execution.

```
assets/
├── template.md           # Output document template
├── checklist.md          # Validation checklist
└── examples/             # Example outputs
```

### references/

External reference material the skill may consult.

```
references/
├── best-practices.md
└── standards.md
```

---

## Data Asset References

Skills reference shared data assets from `data/` by relative path:

```markdown
Load brainstorming techniques from `../../data/methods/brainstorming-techniques.csv`
```

Skills MUST NOT duplicate data assets. Always reference the canonical copy in `data/`.

---

## Thin Wrapper Convention

When coldpress-os is consumed as a submodule, project-level `.claude/skills/` contains thin wrappers:

```markdown
# .claude/skills/{skill-name}/SKILL.md
---
name: "{skill-name}"
description: "{Same description as source}"
---
Read and follow coldpress-os/skills/{category}/{skill-name}/SKILL.md
```

These are auto-generated by `src/utils/wrappers.ts` (invoked during `coldpress init`). Never edit manually.

---

## Anti-Patterns

- **No external step-file directories.** Steps live inside the skill directory.
- **No cross-skill imports.** Skills are self-contained. If two skills share logic, extract to `data/` or `templates/`.
- **No embedded agent definitions.** Skills reference agents by slug, not inline.
- **No duplicated data.** Always reference canonical `data/` assets.
- **No skipping steps.** Workflow skills enforce sequential completion.

---

## v0.3.0-alpha SKILL-AUTHORING-STANDARD (Unit #28 / U05)

The schema above defines the structural contract. For NEW skills authored from v0.3.0-alpha onward, the **canonical reference is [`authoring/infrastructure/skill.md`](../authoring/infrastructure/skill.md)** which extends this schema with mandatory v0.3.0-alpha conventions:

### Mandatory frontmatter additions

| Field | Type | Why |
|-------|------|-----|
| `license` | string | **Non-negotiable** (MIT / Apache-2.0 / BSD / CC0). Skills with no license cannot be vendored. CI rejects. |
| `version` | string | semver |
| `updated` | string | ISO date `YYYY-MM-DD` of last substantive edit |
| `inputs.graph_queries` / `cold_file_reads` / `existence_checks` | structured | Graph-first context loading per [`docs/cross-cutting/graph-first-context.md`](../docs/cross-cutting/graph-first-context.md) |

### Body size cap

**SKILL.md body ≤10KB** (excluding frontmatter). Push detail to `workflow.md` / `steps/step-NN-*.md` / `references/*.md` / `templates/*.md` / `scripts/*.{py,sh,js}`.

### Required body sections (8)

1. **Purpose** — 2-3 sentences
2. **When to Use (Proactive Triggers — 4-6)** — concrete trigger phrases / signals
3. **Output Artifacts (4-6)** — matched to frontmatter `outputs:`
4. **Prerequisites** — gate-blocking preconditions
5. **Process** — inline (simple) or `→ See workflow.md` (workflow)
6. **Activation-Gate Checklist** — completion criteria
7. **Output** — brief recap
8. **Version Control panel** — full VC table per estate Standing Rule 10.1

### Forbidden patterns

- No `license:` field → non-vendorable; CI rejects
- SKILL.md body >10KB → push detail elsewhere
- Missing Proactive Triggers section → Claude has no signal for when to invoke
- Missing Output Artifacts section → audit can't verify what the skill produces
- GPL/AGPL-derived content → license incompatible with coldpress-os MIT

### Authoring helper

For new skills, run `skill-builder` (v1.1+) — interactive scaffolding with pre-emit standard-enforcement (10 checks; GPL/AGPL refused; source-attribution required for vendored skills).

### See also

- [`authoring/infrastructure/skill.md`](../authoring/infrastructure/skill.md) — full canonical authoring reference
- [`skills/meta/skill-builder/SKILL.md`](meta/skill-builder/SKILL.md) v1.1 — interactive scaffolding skill
- [`docs/cross-cutting/graph-first-context.md`](../docs/cross-cutting/graph-first-context.md) — graph_queries convention
- [`docs/cross-cutting/cross-cutting-skills.md`](../docs/cross-cutting/cross-cutting-skills.md) — canonical-vs-router pattern
- [`docs/cross-cutting/pattern-7-agent-personas.md`](../docs/cross-cutting/pattern-7-agent-personas.md) — agent-transition emission convention

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-03 | ColdPress Labs | Added v0.3.0-alpha SKILL-AUTHORING-STANDARD section. Mandatory frontmatter (license / version / updated; inputs split into graph_queries / cold_file_reads / existence_checks). Body ≤10KB cap. 8 required sections (added Proactive Triggers, Output Artifacts, Activation-Gate Checklist beyond original 5). Forbidden patterns listed. Cross-references to canonical authoring reference at `authoring/infrastructure/skill.md` + skill-builder v1.1 + cross-cutting docs. |
| 1.0 | 2026-04-07 | ColdPress Labs | Initial skill schema — unified format from BMAD/MAO/Convex analysis |
