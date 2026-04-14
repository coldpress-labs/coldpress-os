---
phase: 6
name: "Implementation"
description: "Build, test, and review — executing stories through waves"
prerequisites:
  - "Phase 5 (Breakdown) complete"
  - "Implementation readiness: READY"
  - "_output/tracking/sprint-status.yaml exists"
outputs:
  - "Implemented code in src/"
  - "Test suites"
  - "Code review reports"
next_phase: "7-deployment"
---

# Phase 6: Implementation

> Execute stories, write tests, review code, orchestrate parallel waves.

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [dev-story](dev-story/) | workflow | developer | Execute story implementation with red-green-refactor |
| [quick-dev](quick-dev/) | workflow | developer | Rapid implementation for bugs, features, refactors |
| [code-review](code-review/) | router | — | → `skills/reviews/code-review/` |
| [qa-automation](qa-automation/) | router | qa | → `skills/testing/test-automation/` |
| [test-design](test-design/) | router | qa | → `skills/testing/test-design/` |
| [test-framework](test-framework/) | router | qa | → `skills/testing/test-framework/` |
| [atdd](atdd/) | router | qa | → `skills/testing/atdd/` |
| [ci-pipeline](ci-pipeline/) | router | qa | → `skills/testing/ci-pipeline/` |
| [wave-orchestration](wave-orchestration/) | workflow | scrum-master | Execute parallel waves from PERT chart |

## Recommended Flow

```
dev-story (for each story in sprint order)
  ↓
code-review (after each story)
  ↓
qa-automation (after feature complete)
  ↓
wave-orchestration (for parallel epic execution)
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial Phase 6 definition |
