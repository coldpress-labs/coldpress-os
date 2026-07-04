---
name: "client-timeline"
description: "Turn the computed schedule into a client commitment (P7, G8) — reads docs/generated/schedule.yaml (critical path + per-story o/m/p durations from `coldpress waves`) and emits an 85%-confidence delivery date + a pre-ranked scope-cut list. The most revenue-relevant subsystem: it converts the framework's estimate rigor into a promise a solo studio can keep, under-promising honestly instead of guessing. The same math backs `proposal`'s G8-lite pre-sales timeline."
type: "workflow"
category: "lifecycle"
phase: 7
agent: "pm"
inputs:
  cold_file_reads:
    - "docs/generated/schedule.yaml (critical_path + critical_path_duration + story_durations, emitted by `coldpress waves`)"
    - "docs/generated/waves.yaml (wave grouping + team-mode flags)"
    - "_context/implementation/story-graph.yaml (o/m/p estimates per story)"
outputs:
  - artifact: "Client timeline"
    location: "_context/planning/client-timeline-v{N}.md"
    format: "markdown"
    sacred: false
version: "1.0"
---

## Purpose

An estimate nobody can commit to is process theatre. `client-timeline` closes the loop from `coldpress waves` (which computes the critical path + per-story o/m/p durations) to a **date you can put in a contract**: an 85%-confidence commitment plus the scope you'd cut first if reality slips. It exists because "when will it be done" is the question a client actually asks — and the framework already has the numbers to answer it honestly rather than optimistically.

## When to Use

- At Phase 7, after `story-graph` runs `coldpress waves` (which emits `schedule.yaml`). Re-run after a scope change re-computes the schedule.
- Referenced by `proposal` (§5 P2): the pre-sales G8-lite timeline runs this same critical-path math on a coarse breakdown.

## Prerequisites

- `coldpress waves` has emitted `docs/generated/schedule.yaml` (the critical path + `story_durations` with o/m/p) and `waves.yaml`.

## Process

1. **Read the computed schedule.** From `schedule.yaml`: `critical_path` (the story ids on it), `critical_path_duration` (the expected te-sum), and `story_durations` (per-story `{o, m, p}` or an expected value). Do NOT re-estimate — the schedule is the single source; re-guessing here re-introduces the drift the computed plan removed.

2. **Compute the 85%-confidence date (PERT).** For each critical-path story, expected `te = (o + 4m + p) / 6` and variance `σ² = ((p − o) / 6)²`. The project expected duration is `Σ te` (= `critical_path_duration`); the critical-path variance is `Σ σ²`. An 85%-confidence one-sided completion is `Σ te + z·√(Σ σ²)` with `z ≈ 1.04` (the 85th percentile of the normal). Convert working-days → a calendar date using the team's cadence (days/week actually worked). **Under-promise:** if in doubt, round out, not in.

3. **Pre-rank the scope-cut list.** Order the stories you'd defer FIRST if the date is at risk — lowest-value / highest-uncertainty / off-critical-path-but-costly first, P0/P1 requirement stories last (never cut a P0 to hit a date without surfacing it). Each cut states the days it buys back (its `te`) so the trade-off is explicit.

4. **Emit `_context/planning/client-timeline-v{N}.md`** — the 85%-confidence commitment date, the expected date (for context), the critical path, the assumptions the estimate rests on (access, content, third-party accounts), and the ranked scope-cut list with days-bought each. Client-readable.

## Output

`_context/planning/client-timeline-v{N}.md` — a date you can commit to + the scope-cut lever that protects it. Feeds `proposal` (pre-sales) and the client-touchpoints registry (§7.17); re-runs whenever `coldpress waves` re-computes the schedule.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-C3) | NEW P7 producer (system-integration audit C3: `coldpress waves` emits `schedule.yaml` but it had NO consumer — the `client-timeline` skill, plan §5 P7/G8 "most revenue-relevant subsystem", was never built; `proposal` already referenced it). Reads the computed critical path + o/m/p durations, computes an 85%-confidence PERT date + a pre-ranked scope-cut list. Gives `schedule.yaml` its consumer and closes the estimate→commitment loop. |
