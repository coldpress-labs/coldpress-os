---
name: skill-index
description: Phase-aware discovery index — every skill grouped by the phase it belongs to, plus ad-hoc utilities
version: "1.0"
---

# Skill Discovery Index

> The skill tree is organized by category (`creative/`, `ops/`, `reviews/`, etc.) — good for authoring, bad for discovery. When a subagent needs the right skill for Phase N, it wants "skills active in Phase N" not "ops skills." This index fills that gap.

**Source decision:** [framework-audit-2026-04-23.md §1 "Discoverability gap"](../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md).

**How to use:**
- Looking for the canonical skill for a phase → scan the "Primary in phase X" section.
- Looking for alternatives → scan "Also available in phase X."
- Looking for cross-cutting / ad-hoc skills → scan "Cross-cutting utilities" at the bottom.

---

## Phase 1 — Bootstrap

Primary (in-session, run by Butler):
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `orient` | lifecycle | butler | active |
| `intake` | lifecycle | butler | active |

Pre-session (CLI commands, not Butler skills):
| Command | Purpose |
|---------|---------|
| `coldpress doctor` | Verify Node ≥ 20, git ≥ 2.30, package manager, Claude Code. Absorbs the old `machine-setup` checks. |
| `coldpress init` | Scaffold project + git init + pre-commit hook. Absorbs the old `project-init` + `agent-scaffold` workflows. |
| `coldpress update` | Regenerate interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline). |

---

## Phase 2 — Discovery

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `pre-project-interview` | lifecycle | analyst | active |
| `constraint-research` | lifecycle | analyst + architect | active (renamed from `technical-research` in Wave 4) |
| `domain-research` | lifecycle | analyst | active |
| `market-research` | lifecycle | analyst | active |
| `product-brief` | lifecycle | analyst | active (moved from Phase 4 in Wave 4) |
| `parse-document` | ingest | analyst | active (Block Q) |

Also available (cross-cutting creative, lifted here when discovery requires ideation):
| Skill | Category | Status |
|-------|----------|--------|
| `brainstorming` | creative | active (cross-cutting) |
| `design-thinking` | creative | active (cross-cutting) |

---

## Phase 3 — Tech Stack

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `stack-evaluation` | lifecycle | architect | active |
| `stack-locking` | lifecycle | architect | active |
| `env-provision` | lifecycle | developer | active (renamed from `vibe-coder-setup` in Wave 4) |

---

## Phase 4 — Planning

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `design-brief` | lifecycle | analyst | active |
| `create-prd` | lifecycle | pm | active |
| `validate-prd` | lifecycle | pm | active |
| `create-architecture` | lifecycle | architect | active |
| `create-ux-design` | lifecycle | ux-designer | active |

Also available (cross-cutting creative):
| Skill | Category | Status |
|-------|----------|--------|
| `problem-solving` | creative | active (cross-cutting) |
| `storytelling` | creative | active (cross-cutting) |
| `presentation` | creative | active (cross-cutting) |

---

## Phase 5 — Breakdown

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `create-epics` | lifecycle | pm | active |
| `create-stories` | lifecycle | scrum-master | active |
| `parallelization-strategy` | lifecycle | scrum-master | active |
| `sprint-planning` | lifecycle | scrum-master | active |
| `implementation-readiness` | lifecycle | qa | active |

---

## Phase 6 — Implementation

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `dev-story` | lifecycle | developer | active |
| `quick-dev` | lifecycle | developer | active |
| `code-review` | reviews | qa | active |
| `code-audit` | reviews | qa | active |
| `wave-orchestration` | lifecycle | scrum-master | active |

Testing skills (primary in Phase 6, also Phase 7):
| Skill | Category | Status |
|-------|----------|--------|
| `test-design` | testing | active |
| `test-framework` | testing | active |
| `atdd` | testing | active |
| `test-automation` | testing | active |
| `ci-pipeline` | testing | active |
| `test-review` | testing | active |
| `nfr-assessment` | testing | active |
| `traceability` | testing | active |
| `teach-me-testing` | testing | ad-hoc (onboarding) |

Review skills (primary in Phase 6):
| Skill | Category | Status |
|-------|----------|--------|
| `adversarial-review` | reviews | active (invoked by code-review) |
| `edge-case-hunter` | reviews | active (invoked by code-review) |
| `editorial-prose` | reviews | active |
| `editorial-structure` | reviews | active |

---

## Phase 7 — Deployment

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `readiness-check` | lifecycle | qa | active |
| `deploy` | lifecycle | developer + qa | active |
| `env-check` | ops | qa | active |
| `dep-health-check` | ops | qa | active |
| `security-scan` | ops | qa | active |
| `db-migration-check` | ops | qa | active |
| `ci-cd-setup` | ops | developer | active |
| `repo-structure-audit` | ops | valet | active |

---

## Phase 8 — Operate (NEW in Wave 4)

In-flight work, runs alongside Phase 6-7:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `correct-course` | lifecycle | scrum-master | active |
| `sprint-status` | lifecycle | scrum-master | active |
| `document-project` | utility (router) | communicator | active |

---

## Phase 9 — Evolve (NEW in Wave 4)

Post-release learning:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `retrospective` | lifecycle | scrum-master | active |
| `product-evolution` | lifecycle | pm | active |
| `innovation-strategy` | creative (router) | analyst | active (cross-cutting) |

---

## Cross-cutting — creative skills

Creative skills are **phase-agnostic**. They ship in `skills/creative/` and are used wherever ideation is valuable, not owned by a single phase. Block V of Wave 4 relocates them to a cross-cutting toolbox; this section acknowledges that shape.

| Skill | Typically useful in | Invoking subagent |
|-------|---------------------|-------------------|
| `brainstorming` | Phase 2, 4, 9 | analyst |
| `design-thinking` | Phase 2, 4 | analyst |
| `problem-solving` | Phase 2, 4, 6 | analyst + developer |
| `storytelling` | Phase 4, 9 | analyst + communicator |
| `innovation-strategy` | Phase 2, 9 | analyst |
| `presentation` | Phase 4, 9 | communicator |

---

## Ad-hoc utilities (no primary phase)

Utility skills that sit outside the phase spine. Invoked on demand by a user request or by another skill.

| Skill | Category | Typical invoker | Status |
|-------|----------|-----------------|--------|
| `distillator` | utility | analyst, communicator | ad-hoc (forward-carry: wire into Phase 2 Discovery — tracked in phase-ii-implementation-plan Forward carries) |
| `advanced-elicitation` | utility | analyst | forward-carry — wire into Phase 2 Discovery (Part 2 of the Phase II plan) |
| `index-docs` | utility | butler (intake), any | wire-in-phase-1 (invoked by `intake` Step 1 after material solicitation) |
| `shard-doc` | utility | butler (intake), communicator | wire-in-phase-1 (invoked by `intake` Step 1 for large `_input/raw/` files > 50KB) |
| `party-mode` | utility | any | ad-hoc (creative assist, not lifecycle-critical) |
| `parse-document` | ingest | analyst | active — routes PDF / Office / image / AI-conversation inputs to markdown. Replaces the retired `pdf-deep-parser` (whose PDF coverage is absorbed by parse-document's Docling adapter). |
| `teach-me-testing` | utility | any | ad-hoc (onboarding / education) |

Block V of Wave 4 formalises these dispositions in skill frontmatter (`status: ad-hoc`). This index is forward-looking.

---

## Meta skills

Meta skills are framework-evolution skills — invoked by `@valet` to extend coldpress-os itself, not to drive a project.

| Skill | Purpose | Status |
|-------|---------|--------|
| `agent-builder` | Scaffold a new subagent | active |
| `skill-builder` | Scaffold a new skill | active |
| `workflow-builder` | Scaffold a new workflow | active |
| `template-builder` | Scaffold a new template | active |
| `propose-change` | File a change proposal upstream | active |

---

## Stack-pack skills

Skills specific to a technology stack. Activated when `stack_pack:` is set in `coldpress.yaml`.

### Convex

| Skill | Invoking subagent | Phase | Status |
|-------|-------------------|-------|--------|
| `quickstart` | developer | 1 | active |
| `setup-auth` | developer | 6 | active |
| `create-component` | developer | 6 | active |
| `migration-helper` | developer | 6 | active |
| `performance-audit` | qa | 8 | active |

---

## Reconciliation with §4.10 utility disposition

This index reflects the **current** state. Block V of Wave 4 assigns explicit `status:` frontmatter on each utility skill (wire-in-phase-N | ad-hoc | deprecated). When that block lands, the "Ad-hoc utilities" section above gets updated in sync.

---

## See also

- [`docs/templates-registry.md`](templates-registry.md) — companion Template Registry.
- [`docs/subagent-phase-matrix.md`](subagent-phase-matrix.md) — which subagents are active in which phases.
- [`REGISTRY.md`](../REGISTRY.md) — high-level framework registry.
- [`docs/decision-trees.md`](decision-trees.md) — "which skill for which intent" routing.
