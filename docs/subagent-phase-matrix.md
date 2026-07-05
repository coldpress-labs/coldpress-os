---
name: subagent-phase-matrix
description: 8×11 reference matrix — which subagents are active in which phases under Shape A, what they do there, and what they invoke
version: "2.0"
---

# Subagent × Phase Capability Matrix

> A single-surface reference for "what does subagent X do in phase Y?" The matrix is the canonical cross-reference across the 8 subagent definitions + 11 phase READMEs + `docs/architecture.md`.

> **Hello Butler.** Butler (the main Claude Code session) reads this matrix at dispatch time to decide which subagent to invoke for a given phase + skill combination.

**Source decision:** framework-audit-2026-04-23.md "Discoverability gap".

**Axes:** 8 subagents (rows) × 11 phases (columns, Shape A — Design (P5) and Architecture (P6) split out from old P4; old phases 5-9 cascade-renamed to 7-11; @devops added for P9+P10 in two phase-modes; @reviewer added for P11).
**Cell contents:** primary role in that phase + skills invoked, or `—` for "not active."

---

## Matrix

Legend: **primary** = owns the phase's main outputs; **active** = contributes but doesn't drive; **ad-hoc** = available on demand; **—** = not engaged.

| Subagent | P1 Bootstrap | P2 Discovery | P3 Tech Stack | P4 Planning | P5 Design | P6 Architecture | P7 Breakdown | P8 Implementation | P9 Deployment | P10 Operate | P11 Evolve |
|----------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| `analyst` | — | **primary** — `pre-project-interview`, `domain-research`, `market-research`, `constraint-research`, `personas`, `product-brief`, creative tools | — | — | — | — | — | — | — | — | **ad-hoc** — `innovation-strategy` |
| `pm` | — | — | — | **primary** — `create-prd`, `validate-prd` | — | — | **primary** — `story-slice` → `story-graph.yaml` (+ `coldpress waves`), `implementation-readiness` (P7→P8 gate) | — | — | — | **ad-hoc** — `product-evolution` |
| `ux-designer` | — | — | — | — | **primary** — `create-ux-design`, `brand-guidelines`, tokens + styleguide | — | — | — | — | — | — |
| `architect` | — | — | **primary** — `stack-evaluation`, `stack-locking`, `env-provision` (walking skeleton) | — | — | **primary** — `create-architecture`, ADRs | — | **ad-hoc** — architecture Q&A | — | — | — |
| `developer` | — | — | — | — | — | — | — | **primary** — `dev-story`, `quick-dev`, acceptance tests | — | — | — |
| `verifier` | — | — | — | — | — | — | — | **active** — independent verification, `code-review`, `code-audit`, `test-review` (read-only, Butler-dispatched) | — | — | — |
| `devops` | — | — | — | — | — | — | — | — | **primary** — readiness checks, `deploy`, `ci-cd-setup` | **primary** — steady-state ops digests | — |
| `reviewer` | — | — | — | — | — | — | — | — | — | — | **primary** — `retrospective` (evidence-linked, read-only) |

---

## Appendix A — Subagent tool allowlists

Derived from `template/.claude/agents/*.md` frontmatter. Tools matter because they determine what a subagent can side-effect (write, execute) versus only observe (read, search).

| Subagent | Model | Tool allowlist | Max turns | Effort |
|----------|-------|----------------|-----------|--------|
| `analyst` | sonnet | Read, Grep, Glob, Bash, WebSearch, WebFetch | 20 | high |
| `pm` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 25 | — |
| `ux-designer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 25 | — |
| `architect` | opus | Read, Grep, Glob, Bash | 20 | high |
| `developer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 50 | — |
| `verifier` | sonnet | Read, Grep, Glob, Bash | 30 | — |
| `devops` | sonnet | Read, Grep, Glob, Bash, Edit, Write | 40 | — |
| `reviewer` | opus | Read, Grep, Glob | 30 | high |

**Tool-allowlist patterns:**
- Read-only subagents (`architect`, `verifier`, `reviewer`) — no code-write access by design. `verifier` is structurally-independent and Butler-dispatched-only (cannot edit code); `reviewer` emits the evidence-linked retrospective from analysis, not side-effects.
- Write-capable (`pm`, `ux-designer`, `developer`, `devops`) — needed because these produce sacred / lifecycle / deploy artefacts.
- `analyst` is read-only with web access — its artefacts are drafted via main session after research.

---

## Appendix B — "Where does X get invoked?" reverse index

| If you want to… | Invoke in phase | Primary subagent |
|-----------------|-----------------|------------------|
| Start a project | 1 (Bootstrap) | Butler (main session) scaffolds |
| Understand the problem | 2 (Discovery) | `@analyst` |
| Choose the tech stack | 3 (Tech Stack) | `@architect` |
| Define the product | 4 (Planning) | `@pm` |
| Design the experience | 5 (Design) | `@ux-designer` |
| Design the architecture | 6 (Architecture) | `@architect` |
| Break work into stories | 7 (Breakdown) | `@pm` (+ `coldpress waves`) |
| Ship the code | 8 (Implementation) | `@developer` + `@verifier` |
| Release it | 9 (Deployment) | `@devops` |
| Operate in steady state | 10 (Operate) | `@devops` |
| Reflect + plan next cycle | 11 (Evolve) | `@reviewer` + `@analyst` |
| Extend the framework itself | meta | Butler (main session) |

---

## Phase-column legend

| Column | Phase | Primary outputs |
|--------|-------|-----------------|
| P1 | Bootstrap | `coldpress.yaml`, `.claude/agents/`, `.claude/settings.json` (enables the skills plugin) |
| P2 | Discovery | `_context/sacred/context.md`, domain / market / constraint research, `product-brief` |
| P3 | Tech Stack | `_context/sacred/tech-stack.md`, ADRs, provisioned env (walking skeleton) |
| P4 | Planning | `_context/sacred/prd.md` |
| P5 | Design | `_context/design/ux-design-spec.md`, tokens + styleguide, brand guidelines |
| P6 | Architecture | `_context/sacred/architecture.md`, ADRs |
| P7 | Breakdown | `_context/planning/epics.md`, `_context/implementation/*.md` stories, `_context/planning/story-graph.yaml`, computed waves / critical-path / schedule |
| P8 | Implementation | code, `_context/audit/code-review-*.md`, testing artefacts in `_context/testing/` |
| P9 | Deployment | deployed app, `_context/audit/deployment-readiness-*.md`, `_context/audit/security-scan-*.md` |
| P10 | Operate | `_context/planning/sprint-change-proposal-*.md`, ops digests, updated project docs |
| P11 | Evolve | `_context/audit/retro-epic-*.md`, `_context/planning/product-evolution-*.md`, innovation outputs |

---

## See also

- [`docs/skill-index.md`](skill-index.md) — companion Skill Discovery Index (skills by phase).
- [`TEMPLATES-REGISTRY.md`](../TEMPLATES-REGISTRY.md) — companion Template Registry.
- [`docs/architecture.md`](architecture.md) §Subagents — narrative overview.
- [`template/.claude/agents/`](../template/.claude/agents/) — canonical subagent definitions.
- [`REGISTRY.md`](../REGISTRY.md) §Subagents — framework-level subagent index.
