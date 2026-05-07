---
step_number: 3
step_name: "Intent seed"
step_goal: "Capture the project's intent in one sentence; seed _context/sacred/context.md"
halts_for_input: true
next_step: "step-04-working-mode.md"
---

## Goal

Everything downstream (Phase 2 Discovery, Phase 3 stack evaluation, Phase 4 PRD) needs a *starting* sentence — one the user said out loud in their own words before any interview shapes it. This step captures that sentence and writes it into the sacred document Phase 2 will expand.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-03-intent-seed");
```

### 2. Ask

One question, open-ended:

> In one sentence, what is this project? Don't worry about polish — we'll refine in Phase 2 Discovery. Something like *"an X that lets Y"* or *"the tool I wish existed when I was trying to Z"* works fine.

Give the user as much space as they need. If their answer is multiple sentences, pick the one that best captures *intent* (what it is, for whom, why) and confirm.

### 3. Write the seed

Create `_context/sacred/context.md` with this shape:

```markdown
---
name: "context"
description: "Project context — intent, stakeholders, problem, value proposition"
status: "seed"
phase_owned: 2
seeded_by: "intake/step-03-intent-seed"
seeded_at: "<ISO-8601>"
version: "0.1"
supersedes: []
---

# {project.name} — Context

## Intent (seed)

{one-sentence intent, verbatim from the user}

## Stakeholders (pending Phase 2)

_To be filled by `pre-project-interview` — Butler will ask discovery questions._

## Problem (pending Phase 2)

_To be filled by `pre-project-interview`._

## Value proposition (pending Phase 2)

_To be filled by `pre-project-interview`._

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | <date> | Butler (intake) | Seed — one-sentence intent only. Full authoring by Phase 2. |
```

### 4. Validate

Before committing the write, invoke the `validate-schema` skill on the new file against `schemas/sacred-docs/context.schema.json`. On failure, surface the error and retry the seed — do not leave an invalid sacred doc on disk.

### 5. Append to the intake report

```markdown
## Intent seed

> {one-sentence intent}

Written to: `_context/sacred/context.md` (status: seed)
```

### 6. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## Halts for Input

Yes — one open-ended question, plus optional confirmation if the user's answer needs trimming.

## Navigation

→ `step-04-working-mode.md`
