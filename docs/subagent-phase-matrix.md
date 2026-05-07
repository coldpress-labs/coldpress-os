---
name: subagent-phase-matrix
description: 9×9 reference matrix — which subagents are active in which phases, what they do there, and what they invoke
version: "1.0"
---

# Subagent × Phase Capability Matrix

> A single-surface reference for "what does subagent X do in phase Y?" Before this matrix, the answer was scattered across 9 subagent definitions + 9 phase READMEs + `docs/architecture.md`. This doc is the canonical cross-reference.

**Source decision:** [framework-audit-2026-04-23.md "Discoverability gap"](../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md).

**Axes:** 9 subagents (rows) × 9 phases (columns, post-Phase-8-split).
**Cell contents:** primary role in that phase + skills invoked, or `—` for "not active."
**Future update:** Wave 6 §6.3 adds `@reviewer` as a 10th row once it ships.

---

## Matrix

Legend: **primary** = owns the phase's main outputs; **active** = contributes but doesn't drive; **ad-hoc** = available on demand; **—** = not engaged.

| Subagent | P1 Bootstrap | P2 Discovery | P3 Tech Stack | P4 Planning | P5 Breakdown | P6 Implementation | P7 Deployment | P8 Operate | P9 Evolve |
|----------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| `analyst` | — | **primary** — `pre-project-interview`, `domain-research`, `market-research`, `constraint-research`, `product-brief`, creative tools | — | **active** — `design-brief`, creative tools | — | — | — | — | **active** — `innovation-strategy` |
| `pm` | — | — | — | **primary** — `create-prd`, `validate-prd` | **active** — `create-epics` | — | — | — | **primary** — `product-evolution` |
| `ux-designer` | — | — | — | **primary** — `create-ux-design` | — | — | — | — | — |
| `architect` | — | **active** — supports `constraint-research` feasibility | **primary** — `stack-evaluation`, `stack-locking` | **primary** — `create-architecture`, ADRs | — | **ad-hoc** — architecture Q&A | — | — | — |
| `developer` | — | — | **primary** — `env-provision` | — | — | **primary** — `dev-story`, `quick-dev` | **active** — `deploy`, `ci-cd-setup` | — | — |
| `qa` | — | — | — | — | **active** — `implementation-readiness` | **primary** — `code-review`, `code-audit`, testing skills | **primary** — `readiness-check`, `security-scan`, `env-check`, `dep-health-check`, `db-migration-check`, `deploy` gate | — | — |
| `scrum-master` | — | — | — | — | **primary** — `create-stories`, `sprint-planning`, `parallelization-strategy` | **active** — `wave-orchestration` | — | **primary** — `correct-course`, `sprint-status` | **primary** — `retrospective` |
| `communicator` | — | — | — | **active** — documentation, pitch support, creative tools (presentation/storytelling) | — | — | — | **active** — `document-project` | **active** — documentation of retros, narratives |
| `valet` | — | — | — | — | — | **ad-hoc** — meta/framework questions | **ad-hoc** — `repo-structure-audit` | **ad-hoc** — framework upgrades | **ad-hoc** — `propose-change` for lessons learned |

---

## Appendix A — Subagent tool allowlists

Derived from `template/.claude/agents/*.md` frontmatter. Tools matter because they determine what a subagent can side-effect (write, execute) versus only observe (read, search).

| Subagent | Model | Tool allowlist | Max turns | Effort |
|----------|-------|----------------|-----------|--------|
| `analyst` | sonnet | Read, Grep, Glob, Bash, WebSearch, WebFetch | 20 | high |
| `pm` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 20 | high |
| `ux-designer` | sonnet | Read, Grep, Glob, Bash, Edit, Write, WebFetch | 20 | high |
| `architect` | opus | Read, Grep, Glob, Bash | 20 | high |
| `developer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 40 | high |
| `qa` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 40 | high |
| `scrum-master` | haiku | Read, Grep, Glob | 20 | medium |
| `communicator` | sonnet | Read, Grep, Glob, Write, WebFetch | 20 | high |
| `valet` | sonnet | Read, Grep, Glob, Edit, Write | 20 | high |

**Tool-allowlist patterns:**
- Read-only subagents (`architect`, `scrum-master`) — no write access by design. Produces prose via the main session; reflections come from analysis, not side-effects.
- Write-capable (`pm`, `ux-designer`, `developer`, `qa`, `valet`, `communicator`) — needed because these produce sacred / lifecycle artefacts.
- `analyst` is read-only with web access — its artefacts are drafted via main session after research.

---

## Appendix B — "Where does X get invoked?" reverse index

| If you want to… | Invoke in phase | Primary subagent |
|-----------------|-----------------|------------------|
| Start a project | 1 (Bootstrap) | `@valet` routes, `@developer` sets up |
| Understand the problem | 2 (Discovery) | `@analyst` |
| Choose the tech stack | 3 (Tech Stack) | `@architect` |
| Define the product | 4 (Planning) | `@pm` + `@architect` + `@ux-designer` |
| Break work into stories | 5 (Breakdown) | `@scrum-master` + `@pm` |
| Ship the code | 6 (Implementation) | `@developer` + `@qa` |
| Release it | 7 (Deployment) | `@qa` + `@developer` |
| Adapt mid-sprint | 8 (Operate) | `@scrum-master` |
| Reflect + plan next cycle | 9 (Evolve) | `@scrum-master` + `@pm` + `@analyst` |
| Extend the framework itself | meta | `@valet` |

---

## Phase-column legend

| Column | Phase | Primary outputs |
|--------|-------|-----------------|
| P1 | Bootstrap | `coldpress.yaml`, `.claude/agents/`, `.claude/skills/` wrappers |
| P2 | Discovery | `_context/sacred/context.md`, domain / market / constraint research, `product-brief` |
| P3 | Tech Stack | `_context/sacred/tech-stack.md`, ADRs, provisioned env |
| P4 | Planning | `_context/sacred/{prd,architecture}.md`, `_context/design/ux-design-spec.md`, design-brief |
| P5 | Breakdown | `_context/sacred/pert-chart.md`, `_context/planning/epics.md`, `_context/implementation/*.md` stories, `_context/tracking/sprint-status.yaml` |
| P6 | Implementation | code, `_context/audit/code-review-*.md`, testing artefacts in `_context/testing/` |
| P7 | Deployment | deployed app, `_context/audit/deployment-readiness-*.md`, `_context/audit/security-scan-*.md` |
| P8 | Operate | `_context/planning/sprint-change-proposal-*.md`, sprint status, updated project docs |
| P9 | Evolve | `_context/audit/retro-epic-*.md`, `_context/planning/product-evolution-*.md`, innovation outputs |

---

## See also

- [`docs/skill-index.md`](skill-index.md) — companion Skill Discovery Index (skills by phase).
- [`docs/templates-registry.md`](templates-registry.md) — companion Template Registry.
- [`docs/architecture.md`](architecture.md) §Subagents — narrative overview.
- [`template/.claude/agents/`](../template/.claude/agents/) — canonical subagent definitions.
- [`REGISTRY.md`](../REGISTRY.md) §Subagents — framework-level subagent index.
