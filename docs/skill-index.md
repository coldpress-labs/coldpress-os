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

## Phase 5 — Design *(NEW under Shape A)*

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `design-brief` | lifecycle | ux-designer | active |
| `ux-design` | lifecycle | ux-designer | active |
| `brand-guidelines` | lifecycle | ux-designer | active |
| `prototype` | lifecycle | ux-designer | active |
| `narrative` | lifecycle | ux-designer | active |
| `legacy-ui-assessment` | lifecycle | ux-designer | conditional (brownfield) |
| `a11y-audit` | reviews | verifier | active (Phase 5 mode) |

---

## Phase 6 — Architecture *(NEW under Shape A)*

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `architecture-design` | lifecycle | architect | active (silent-divergence guard at Step 01) |
| `diagram-creator` | lifecycle | architect | active (on-demand) |

---

## Phase 7 — Breakdown *(cascade rename — was old Phase 5)*

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `breakdown-entry-sync` | lifecycle | pm | active (architecture-deltas reconciliation) |
| `create-epics` | lifecycle | pm | active |
| `create-stories` | lifecycle | pm | active |
| `parallelization-strategy` | lifecycle | pm | active |
| `sprint-planning` | lifecycle | pm | active |
| `implementation-readiness` | lifecycle | pm | active |

---

## Phase 8 — Implementation *(cascade rename — was old Phase 6)*

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `dev-story` | lifecycle | developer | active |
| `quick-dev` | lifecycle | developer | active |
| `code-review` | reviews | verifier | active |
| `code-audit` | reviews | verifier | active |
| `wave-orchestration` | lifecycle | pm | active |

Testing skills (primary in Phase 8, also Phase 9):
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

Review skills (primary in Phase 8):
| Skill | Category | Status |
|-------|----------|--------|
| `adversarial-review` | reviews | active (invoked by code-review) |
| `edge-case-hunter` | reviews | active (invoked by code-review) |
| `editorial-prose` | reviews | active |
| `editorial-structure` | reviews | active |
| `a11y-audit` | reviews | active (Phase 8 mode — rides #11c/d code-review pair) |

---

## Phase 9 — Deployment *(cascade rename — was old Phase 7)*

Primary:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `readiness-check` | lifecycle | devops (meta-aggregator) | active |
| `deploy` | lifecycle | devops | active (ship-path mode) |
| `env-check` | ops | devops | active |
| `dep-health-check` | ops | devops | active |
| `dependency-auditor` | reviews | devops | active (license/CVE/supply-chain) |
| `security-scan` | ops | devops | active |
| `secrets-vault-manager` | ops | devops | active |
| `observability-designer` | ops | devops | active |
| `db-migration-check` | ops | devops | active |
| `ci-cd-setup` | ops | devops | active |
| `repo-structure-audit` | ops | butler | active |

---

## Phase 10 — Operate *(cascade rename — was old Phase 8)*

Continuous operational work; owner @devops continues from Phase 9 (steady-state mode):
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `sprint-status` | lifecycle | devops | active |
| `correct-course` | lifecycle | devops | active |
| `incident-response` | lifecycle | devops | active |
| `document-project` | utility (router) | butler | active |

---

## Phase 11 — Evolve *(FINAL — cascade rename + new owner @reviewer)*

Post-release learning; closure copies outputs to `_input/prior-iteration/` for next-iteration Phase 1:
| Skill | Category | Invoking subagent | Status |
|-------|----------|-------------------|--------|
| `retrospective` | lifecycle | reviewer | active (Step 0: ops-deltas reconciliation) |
| `product-evolution` | lifecycle | reviewer | active |
| `innovation-strategy` | creative (router) | reviewer | active |

---

## Cross-cutting — creative skills

Creative skills are **phase-agnostic**. They ship in `skills/creative/` and are used wherever ideation is valuable, not owned by a single phase. Block V of Wave 4 relocates them to a cross-cutting toolbox; this section acknowledges that shape.

| Skill | Typically useful in | Invoking subagent |
|-------|---------------------|-------------------|
| `brainstorming` | Phase 2, 4, 9 | analyst |
| `design-thinking` | Phase 2, 4 | analyst |
| `problem-solving` | Phase 2, 4, 6 | analyst + developer |
| `storytelling` | Phase 4, 9 | analyst |
| `innovation-strategy` | Phase 2, 9 | analyst |
| `presentation` | Phase 4, 9 | butler |

---

## Ad-hoc utilities (no primary phase)

Utility skills that sit outside the phase spine. Invoked on demand by a user request or by another skill.

| Skill | Category | Typical invoker | Status |
|-------|----------|-----------------|--------|
| `distillator` | utility | analyst | ad-hoc (forward-carry: wire into Phase 2 Discovery — tracked in phase-ii-implementation-plan Forward carries) |
| `advanced-elicitation` | utility | analyst | forward-carry — wire into Phase 2 Discovery (Part 2 of the Phase II plan) |
| `index-docs` | utility | butler (intake), any | wire-in-phase-1 (invoked by `intake` Step 1 after material solicitation) |
| `shard-doc` | utility | butler (intake) | wire-in-phase-1 (invoked by `intake` Step 1 for large `_input/raw/` files > 50KB) |
| `party-mode` | utility | any | ad-hoc (creative assist, not lifecycle-critical) |
| `parse-document` | ingest | analyst | active — routes PDF / Office / image / AI-conversation inputs to markdown. Replaces the retired `pdf-deep-parser` (whose PDF coverage is absorbed by parse-document's Docling adapter). |
| `teach-me-testing` | utility | any | ad-hoc (onboarding / education) |

Block V of Wave 4 formalises these dispositions in skill frontmatter (`status: ad-hoc`). This index is forward-looking.

---

## Meta skills

Meta skills are framework-evolution skills — invoked by the framework-internal meta loop to extend coldpress-os itself, not to drive a project.

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
| `performance-audit` | verifier | 8 | active |

---

## Reconciliation with §4.10 utility disposition

This index reflects the **current** state. Block V of Wave 4 assigns explicit `status:` frontmatter on each utility skill (wire-in-phase-N | ad-hoc | deprecated). When that block lands, the "Ad-hoc utilities" section above gets updated in sync.

---

## See also

- [`docs/templates-registry.md`](templates-registry.md) — companion Template Registry.
- [`docs/subagent-phase-matrix.md`](subagent-phase-matrix.md) — which subagents are active in which phases.
- [`REGISTRY.md`](../REGISTRY.md) — high-level framework registry.
- [`docs/decision-trees.md`](decision-trees.md) — "which skill for which intent" routing.
