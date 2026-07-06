---
step_number: 7
step_name: "Intent seed"
step_goal: "Capture the project's intent in one sentence; seed _context/sacred/context.md"
halts_for_input: true
next_step: "step-08-vision.md"
---

## Goal

Everything downstream (Phase 2 Discovery, Phase 3 stack evaluation, Phase 4 PRD) needs a *starting* sentence — one the user said out loud in their own words before any interview shapes it. This step captures that sentence and writes it into the sacred document Steps 8-11 will flesh out later in this same skill.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-07-intent-seed");
```

### 2. Ask

One question, open-ended:

> In one sentence, what is this project? Don't worry about polish — we'll go deeper in a moment. Something like *"an X that lets Y"* or *"the tool I wish existed when I was trying to Z"* works fine.

Give the user as much space as they need. If their answer is multiple sentences, pick the one that best captures *intent* (what it is, for whom, why) and confirm.

### 3. Write the seed

Create `_context/sacred/context.md` with this shape:

```markdown
---
sacred: true
version: "0.1"
governance: "draft"
workflowType: "context"
name: "context"
description: "Project context — intent, stakeholders, problem, value proposition"
status: "seed"
phase_owned: 1
seeded_by: "intake/step-07-intent-seed"
seeded_at: "<ISO-8601>"
supersedes: []
---

# {project.name} — Context

## Intent (seed)

{one-sentence intent, verbatim from the user}

## Stakeholders (pending Step 9)

_To be filled by this skill's Users step._

## Problem (pending Step 8)

_To be filled by this skill's Vision step._

## Value proposition (pending Step 9)

_To be filled by this skill's Users step._

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | <date> | Butler (intake) | Seed — one-sentence intent only. Full authoring by the remaining intake steps. |
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

→ `step-08-vision.md`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `intake` Step 3. Placeholder sections deferred authoring to Phase 2 `pre-project-interview`. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 7; placeholders now point at this same skill's Steps 8-11, not Phase 2 (WS5-B, §8 item 6 — `pre-project-interview` merged into `intake`; see ledger plan delta on why full context.md authoring moves into Phase 1). |
