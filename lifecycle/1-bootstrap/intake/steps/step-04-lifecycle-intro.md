---
step_number: 4
step_name: "Lifecycle intro"
step_goal: "Give the user a 30-second preview of the full-lane phases (skippable)"
halts_for_input: true
next_step: "step-05-material-solicitation.md"
skip_when:
  - "mode == re-entry"
  - "mode == resume"
  - "local-config.yaml orient_skipped == true"
---

## Goal

Orient the user to the lifecycle so they know what the rest of intake is about to kick off and what comes after. Skippable — if the user already knows coldpress-os, they set `orient_skipped: true` and we move on.

Lite-lane projects (the structural default, per §6) don't run this table — Butler names the four lite phases (Spec → Build → Verify → Ship) in one line instead. This step's table applies when the user is already committed to (or leaning toward) the full lane.

## Instructions

### 1. Offer the intro

```
Before we dive in — want a 30-second tour of the phases? (Y/n/never)
```

- **Y / Enter** → show the phase table (below), wait for any key, continue.
- **n** → skip once, move on.
- **never** → write `orient_skipped: true` to `.coldpress/local-config.yaml` so future sessions skip automatically.

### 2. The phase table (if shown)

```
Phase 1  — Bootstrap        ← we're here (scaffold check, material, context)
Phase 2  — Discovery        research, personas, idea validation, product brief
Phase 3  — Tech Stack       stack lock + deploy target + walking skeleton
Phase 4  — Planning         PRD, outcome contract
Phase 5  — Design           tokens, styleguide, ux-spec, budgets
Phase 6  — Architecture     sacred architecture + ADRs
Phase 7  — Breakdown        story graph → waves
Phase 8  — Implementation   dev + clean-room verification
Phase 9  — Deployment       readiness, staging, human-gated prod
Phase 10 — Operate          ops digests, incident response, client health
Phase 11 — Evolve           retrospective, next-iteration seeding

You control the pace. I don't skip phases, and you can pause at any point.
```

### 3. Record in the intake report

```yaml
lifecycle_intro_shown: true | false
orient_skipped: true | false        # only true if user chose "never"
```

## Halts for Input

Yes — one prompt: Y/n/never for the intro.

## Navigation

→ `step-05-material-solicitation.md`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `orient` Step 4 (9-phase table, submodule-era numbering). |
| 2.0 | 2026-07-02 | Butler | Folded into `intake` as Step 4 (WS5-B, §8 item 6). Phase table corrected to the current 11-phase lifecycle (the old 9-phase table pre-dated WS0–WS4's phase additions — see plan delta in the ledger); lite-lane one-liner added per §6. |
