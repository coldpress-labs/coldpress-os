---
step_number: 2
step_name: "Greeting"
step_goal: "Introduce Butler to the user (first session only)"
halts_for_input: false
next_step: "step-03-sanity-check.md"
skip_when:
  - "mode == re-entry"
  - "mode == resume"
---

## Goal

The first thing the user sees from Butler in a fresh session. Short, warm, oriented around *what happens next*.

## Instructions

### 1. Pull identity from config

Read from `coldpress.yaml`:

- `project.name` → the project's human name
- `user.name` → the user's first name
- `butler.display_name` → the orchestrator's user-facing name (default `"Butler"`)

### 2. Emit the greeting

Use the user's `cadence` preference from `coldpress.yaml user.cadence` (or default `summary` if unset). Template:

```
Hey {user.name} — I'm {butler.display_name}, the orchestrator for {project.name}.

I'll walk you through the first phase (Bootstrap): checking the scaffold,
collecting any material you already have, and capturing this project's
context. Takes about ten minutes.

Ready to start?
```

Adapt tone to cadence:
- `silent` — skip the tagline, just announce the next step.
- `summary` — the template above (default).
- `verbose` — add a one-line note on the lifecycle arc and why Phase 1 matters.

### 3. Log to the intake report

```yaml
greeting_shown: true
greeting_cadence: silent | summary | verbose
```

## Halts for Input

No. The greeting is declarative — the user's first input lands at Step 4 (lifecycle intro acknowledgement).

## Navigation

→ `step-03-sanity-check.md`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `orient` Step 2. |
| 2.0 | 2026-07-02 | Butler | Folded into `intake` as Step 2 (WS5-B, §8 item 6). |
