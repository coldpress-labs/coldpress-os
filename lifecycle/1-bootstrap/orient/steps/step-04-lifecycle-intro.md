---
step_number: 4
step_name: "Lifecycle intro"
step_goal: "Give the user a 30-second preview of the 9-phase flow (skippable)"
halts_for_input: true
next_step: "handoff-to-intake"
skip_when:
  - "mode == re-entry"
  - "mode == resume"
  - "local-config.yaml orient_skipped == true"
---

## Goal

Orient the user to the 9 phases so they know what "intake" is about to kick off and what comes after. Skippable — if the user already knows coldpress-os, they set `orient_skipped: true` and we move on.

## Instructions

### 1. Offer the intro

```
Before we dive in — want a 30-second tour of the 9 phases? (Y/n/never)
```

- **Y / Enter** → show the phase table (below), wait for any key, continue.
- **n** → skip once, move on.
- **never** → write `orient_skipped: true` to `.coldpress/local-config.yaml` so future sessions skip automatically.

### 2. The phase table (if shown)

```
Phase 1 — Bootstrap           ← we're here
  orient (this) + intake: soliciting material, project shape, one-sentence intent
Phase 2 — Discovery           pre-project-interview → context.md
Phase 3 — Tech Stack          stack-evaluation + stack-locking → tech-stack.md
Phase 4 — Planning            PRD, architecture, UX spec (sacred docs)
Phase 5 — Breakdown           epics, stories, PERT chart
Phase 6 — Implementation      dev, code review, QA
Phase 7 — Deployment          readiness checks, security gates
Phase 8 — Operate             retros, sprint tracking, evolution signals
Phase 9 — Evolve              close-out, lessons learned, next-horizon seeding

You control the pace. I don't skip phases, and you can pause at any point.
```

### 3. Record in the orient report

```yaml
lifecycle_intro_shown: true | false
orient_skipped: true | false        # only true if user chose "never"
```

## Halts for Input

Yes — one prompt: Y/n/never for the intro.

## Navigation

→ Butler dispatches `intake` next. Orient exits cleanly; the report is complete.
