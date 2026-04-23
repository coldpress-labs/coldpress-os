# REGISTRY.md — coldpress-os

> Auto-generated registry of all agents, skills, lifecycle phases, and data assets.
> Source of truth for what exists in this framework.
>
> **Do not edit manually.** Regenerate with `install/generate-registry.md`.

---

## Subagents (9)

> Consolidated from 19 legacy personas. Each subagent runs as an independent Claude Code agent with its own context window. Defined in `template/.claude/agents/`.

| Subagent | Slug | Model | Primary Phases | Merges |
|----------|------|-------|----------------|--------|
| Analyst | `analyst` | sonnet | 2, 4 | vera, moxie, nova, leni, iggy, crux |
| PM | `pm` | sonnet | 4, 5 | rex |
| UX Designer | `ux-designer` | sonnet | 4 | iris, lyla |
| Architect | `architect` | opus | 3, 4 | arch, crux (tech) |
| Developer | `developer` | sonnet | 6 | cody, blitz |
| QA | `qa` | sonnet | 6, 7 | abby, zane |
| Scrum Master | `scrum-master` | haiku | 5, 8 | atlas |
| Communicator | `communicator` | sonnet | 4, 8 | granger, quill, kai |
| Valet | `valet` | sonnet | meta | valet |

> Legacy personas were moved out of the framework in v0.1 (estate Decision #20) — they live at project level in `hq-p001-coldpress-os/legacy/agents-archive/`, not shipped with the public framework. See `agents/_schema.md` for the new subagent format.

---

## Lifecycle Phases (9)

| # | Phase | Directory | Key Skills |
|---|-------|-----------|------------|
| 1 | Bootstrap | `lifecycle/1-bootstrap/` | machine-setup, project-init, agent-scaffold |
| 2 | Discovery | `lifecycle/2-discovery/` | pre-project-interview, domain-research, market-research, constraint-research, product-brief, brainstorming, design-thinking |
| 3 | Tech Stack | `lifecycle/3-tech-stack/` | stack-evaluation, stack-locking, env-provision |
| 4 | Planning | `lifecycle/4-planning/` | design-brief, create-prd, validate-prd, create-ux-design, create-architecture, problem-solving, storytelling |
| 5 | Breakdown | `lifecycle/5-breakdown/` | create-epics, create-stories, parallelization-strategy, sprint-planning, implementation-readiness |
| 6 | Implementation | `lifecycle/6-implementation/` | dev-story, quick-dev, code-review, qa-automation, wave-orchestration, atdd, ci-pipeline, test-design, test-framework |
| 7 | Deployment | `lifecycle/7-deployment/` | readiness-check, env-check, security-scan, deploy, db-migration-check, dep-health-check |
| 8 | Operate | `lifecycle/8-operate/` | correct-course, sprint-status, document-project |
| 9 | Evolve | `lifecycle/9-evolve/` | retrospective, product-evolution, innovation-strategy |

---

## Skills by Category

### Reviews (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| adversarial-review | `skills/reviews/adversarial-review/` | simple | any |
| edge-case-hunter | `skills/reviews/edge-case-hunter/` | simple | any |
| editorial-prose | `skills/reviews/editorial-prose/` | simple | any |
| editorial-structure | `skills/reviews/editorial-structure/` | simple | any |
| code-review | `skills/reviews/code-review/` | simple | 6 |
| code-audit | `skills/reviews/code-audit/` | simple | 6 |

### Testing (9)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| test-design | `skills/testing/test-design/` | workflow | 6 |
| test-framework | `skills/testing/test-framework/` | workflow | 6 |
| atdd | `skills/testing/atdd/` | workflow | 6 |
| test-review | `skills/testing/test-review/` | simple | 6 |
| ci-pipeline | `skills/testing/ci-pipeline/` | workflow | 6 |
| nfr-assessment | `skills/testing/nfr-assessment/` | workflow | 6 |
| traceability | `skills/testing/traceability/` | simple | 6 |
| test-automation | `skills/testing/test-automation/` | workflow | 6 |
| teach-me-testing | `skills/testing/teach-me-testing/` | reference | any |

### Creative (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| brainstorming | `skills/creative/brainstorming/` | workflow | 2, 4, 8 |
| design-thinking | `skills/creative/design-thinking/` | workflow | 2, 4 |
| problem-solving | `skills/creative/problem-solving/` | workflow | 2, 4, 6 |
| innovation-strategy | `skills/creative/innovation-strategy/` | workflow | 2, 8 |
| storytelling | `skills/creative/storytelling/` | workflow | 4, 8 |
| presentation | `skills/creative/presentation/` | workflow | 4, 8 |

### Utilities (7)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| advanced-elicitation | `skills/utilities/advanced-elicitation/` | simple | any |
| distillator | `skills/utilities/distillator/` | simple | any |
| shard-doc | `skills/utilities/shard-doc/` | simple | any |
| index-docs | `skills/utilities/index-docs/` | simple | any |
| party-mode | `skills/utilities/party-mode/` | simple | any |
| pdf-deep-parser | `skills/utilities/pdf-deep-parser/` | simple | any |
| document-project | `skills/utilities/document-project/` | workflow | 8 |

### Ops (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| env-check | `skills/ops/env-check/` | simple | 7 |
| dep-health-check | `skills/ops/dep-health-check/` | simple | 7 |
| security-scan | `skills/ops/security-scan/` | simple | 7 |
| ci-cd-setup | `skills/ops/ci-cd-setup/` | workflow | 7 |
| db-migration-check | `skills/ops/db-migration-check/` | simple | 7 |
| repo-structure-audit | `skills/ops/repo-structure-audit/` | simple | any |

### Meta (5)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| agent-builder | `skills/meta/agent-builder/` | workflow | meta |
| skill-builder | `skills/meta/skill-builder/` | workflow | meta |
| workflow-builder | `skills/meta/workflow-builder/` | workflow | meta |
| template-builder | `skills/meta/template-builder/` | workflow | meta |
| propose-change | `skills/meta/propose-change/` | simple | meta |

### Stack Packs — Convex (5)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/convex/quickstart/` | workflow | 1 |
| setup-auth | `skills/stack-packs/convex/setup-auth/` | workflow | 6 |
| create-component | `skills/stack-packs/convex/create-component/` | workflow | 6 |
| migration-helper | `skills/stack-packs/convex/migration-helper/` | workflow | 6 |
| performance-audit | `skills/stack-packs/convex/performance-audit/` | simple | 8 |

---

## Data Assets

| Category | Directory | Assets |
|----------|-----------|--------|
| Methods | `data/methods/` | brainstorming-techniques.csv, elicitation-methods.csv, design-thinking-methods.csv, problem-solving-methods.csv, innovation-frameworks.csv, story-types.csv |
| Classification | `data/classification/` | domain-complexity.csv, project-types.csv, documentation-requirements.csv |
| Testing | `data/testing/` | curriculum.yaml, quiz-questions.yaml, role-paths.yaml, session-content-map.yaml, tea-index.csv |
| CI/CD | `data/ci-cd/` | github-actions.yaml, gitlab-ci.yaml, azure-pipelines.yaml, harness-pipeline.yaml |
| Agents | `data/agents/` | agent-roster.csv, skill-catalog.csv |

---

## Templates

| Category | Directory | Count |
|----------|-----------|-------|
| Documents | `templates/documents/` | 11 (context, tech-stack, prd, architecture, ux-design-spec, epic, story, adr, sprint-status, pert-chart, retrospective) |
| Design | `templates/design/` | 48 (WDS template set) |
| Infrastructure | `templates/infrastructure/` | 6 (CLAUDE.md, SYSTEM.md, cursorrules, agent, skill, workflow) |
| Contracts | `templates/contracts/` | 3 (contract, service-agreement, pitch) |

---

## Governance

| Document | Change Workflow |
|----------|----------------|
| context.md | `governance/context-change/workflow.md` |
| tech-stack.md | `governance/tech-stack-change/workflow.md` |
| PRD | `governance/prd-change/workflow.md` |
| architecture.md | `governance/architecture-change/workflow.md` |
| PERT chart | `governance/pert-change/workflow.md` |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 6.0 | 2026-04-14 | Alfred | Phase H audit: added 14 missing lifecycle skills to phase table, removed phantom tea-resources-index.yaml, corrected design template count 57→48. |
| 5.0 | 2026-04-14 | Alfred | Post-audit refresh: all Phase 5 input paths corrected, UX spec path standardized, data asset references validated (6 filename mismatches fixed), sprint-status expanded to 3 steps, create-architecture steps written, validate-prd converted to workflow, machine-setup converted to workflow. 90 skills, 54 workflows, 200 step files. |
| 4.0 | 2026-04-13 | Alfred | Consolidated 19 personas → 9 real subagents. Updated agents section. Skill-catalog agent references updated. |
| 3.0 | 2026-04-08 | Alfred | Added Valet (19th agent) — Butler's meta counterpart |
| 2.0 | 2026-04-08 | Alfred | Renamed all 18 agents to new names |
| 1.0 | 2026-04-07 | Alfred | Initial registry — 18 agents, 8 phases, 44 skills, 5 stack-pack skills, governance |
