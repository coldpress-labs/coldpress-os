---
workflow_version: "1.0"
skill: "story-slice"
total_steps: 5
re_runnable: false
---

# Story Slice — Workflow

## Overview

One pass, five steps: load context → group into epics → slice into atomic story
contracts (with the full v0.4 metadata) → write red acceptance stubs → validate
coverage. The output feeds `story-graph` (dependency wiring + `coldpress waves`)
then `implementation-readiness` (the P7 exit gate).

## Steps

| # | Step | Halts? | Notes |
|---|------|--------|-------|
| 0 | [step-00-context.md](steps/step-00-context.md) | No | Load PRD + architecture + UX-spec + tokens/styleguide + api-contract + security-registry + analytics-plan |
| 1 | [step-01-epics.md](steps/step-01-epics.md) | On coverage gap | Group requirements → user-value epics (requirement IDs ↔ components ↔ UX flows) |
| 2 | [step-02-stories.md](steps/step-02-stories.md) | No | Slice epics → atomic `ST-*.md` contracts: owns/produces/consumes, o/m/p, risk, styleguide refs, analytics events, contract + content-population stories |
| 3 | [step-03-stubs.md](steps/step-03-stubs.md) | No | Invoke `acceptance-stubs` per story — red by construction |
| 4 | [step-04-validate.md](steps/step-04-validate.md) | On human review | Coverage (`trace orphans`); write `stories-index.md`; present |

## Completion Criteria

- Every P0/P1 requirement maps to ≥1 story (`trace orphans` clean).
- Every story carries `owns`/`produces`/`consumes`, o/m/p estimates, `risk`, and (UI) styleguide refs.
- Security-registry-touching stories are `risk: high`.
- Each `interface` surface in the api-contract has a contract story.
- Every story has red acceptance stubs present.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS5-E) | Initial story-slice workflow (merge of create-epics + create-stories, §5 P7). |
