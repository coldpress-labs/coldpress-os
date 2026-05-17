# REGISTRY.md — coldpress-os

> Auto-generated registry of all agents, skills, lifecycle phases, and data assets.
> Source of truth for what exists in this framework.
>
> **Do not edit manually.** Regenerate with `install/generate-registry.md`.

---

## Subagents (11)

> Consolidated from 19 legacy personas, plus post-schema additions (@reviewer, @devops). Each subagent runs as an independent Claude Code agent with its own context window. Defined in `template/.claude/agents/`.

| Subagent | Slug | Model | Primary Phases | Merges |
|----------|------|-------|----------------|--------|
| Analyst | `analyst` | sonnet | 2, 4 | vera, moxie, nova, leni, iggy, crux |
| PM | `pm` | sonnet | 4, 7 | rex |
| UX Designer | `ux-designer` | sonnet | 5 | iris, lyla |
| Architect | `architect` | opus | 3, 6 | arch, crux (tech) |
| Developer | `developer` | sonnet | 8 | cody, blitz |
| QA | `qa` | sonnet | 8, 9 | abby, zane |
| Scrum Master | `scrum-master` | haiku | 7, 10 | atlas |
| Communicator | `communicator` | sonnet | 4, 10 | granger, quill, kai |
| Reviewer | `reviewer` | sonnet | 11 | _post-schema addition_ |
| DevOps | `devops` | sonnet | 9, 10 | _post-schema addition_ |
| Valet | `valet` | sonnet | meta | valet |

> Legacy personas were moved out of the framework in v0.1 (estate Decision #20) — they live at project level in `hq-p001-coldpress-os/legacy/agents-archive/`, not shipped with the public framework. See `agents/_schema.md` for the new subagent format.

---

## Lifecycle Phases (11)

> **Shape A restructure (2026-04-24):** old 9-phase model split Phase 4 into Planning/Design/Architecture (4/5/6); old phases 5–9 cascade to 7–11. Phase 5 and 6 are NEW — folders scaffolded, skills land in implementation Parts 5 and 6.

| # | Phase | Directory | Key Skills |
|---|-------|-----------|------------|
| 1 | Bootstrap | `lifecycle/1-bootstrap/` | orient, intake |
| 2 | Discovery | `lifecycle/2-discovery/` | pre-project-interview, domain-research, market-research, constraint-research, personas, validate-idea, synthesize-research, product-brief, brainstorming, design-thinking, problem-solving, innovation-strategy |
| 3 | Tech Stack | `lifecycle/3-tech-stack/` | stack-discovery-sync, stack-evaluation, stack-locking, env-provision, re-entry |
| 4 | Planning | `lifecycle/4-planning/` | planning-entry-sync, create-prd, validate-prd, legacy-assessment, design-brief, problem-solving, storytelling |
| 5 | Design | `lifecycle/5-design/` | _scaffolded — design-brief, ux-design, prototype, storytelling, brand-guidelines (skills land in Part 5)_ |
| 6 | Architecture | `lifecycle/6-architecture/` | _scaffolded — architecture-design + ADR skills (land in Part 6)_ |
| 7 | Breakdown | `lifecycle/7-breakdown/` | create-epics, create-stories, parallelization-strategy, sprint-planning, implementation-readiness |
| 8 | Implementation | `lifecycle/8-implementation/` | dev-story, quick-dev, code-review, qa-automation, wave-orchestration, atdd, ci-pipeline, test-design, test-framework |
| 9 | Deployment | `lifecycle/9-deployment/` | readiness-check, env-check, security-scan, deploy, db-migration-check, dep-health-check |
| 10 | Operate | `lifecycle/10-operate/` | correct-course, sprint-status, document-project |
| 11 | Evolve | `lifecycle/11-evolve/` | retrospective, product-evolution, innovation-strategy |

---

## Skills by Category

### Phase 3 — Tech Stack (5)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| stack-discovery-sync | `lifecycle/3-tech-stack/stack-discovery-sync/` | workflow | 3 | @architect |
| stack-evaluation | `lifecycle/3-tech-stack/stack-evaluation/` | workflow | 3 | @architect |
| stack-locking | `lifecycle/3-tech-stack/stack-locking/` | workflow | 3 | @architect |
| env-provision | `lifecycle/3-tech-stack/env-provision/` | workflow | 3 | @developer |
| re-entry | `lifecycle/3-tech-stack/re-entry/` | router | 3 | @architect |

**Available on demand (Phase 3):**
| Skill | Type | When |
|-------|------|------|
| brainstorming | creative router | Stack-pattern ideation on novel areas |
| innovation-strategy | creative router | Stack-shaping (Jamstack vs monolith, edge-first, serverless) |
| party-mode | utility | Pressure-test composite stack; auto-offered at Step 3a or `team_shape = client-project` |

### Phase 4 — Planning (4 core + 2 cross-cutting)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| planning-entry-sync | `lifecycle/4-planning/planning-entry-sync/` | workflow | 4 | @pm |
| create-prd | `lifecycle/4-planning/create-prd/` | workflow | 4 | @pm |
| validate-prd | `lifecycle/4-planning/validate-prd/` | workflow | 4 | @pm |
| legacy-assessment | `lifecycle/4-planning/legacy-assessment/` | workflow | 4 | @architect |

**Available on demand (Phase 4):**
| Skill | Type | When |
|-------|------|------|
| problem-solving | creative router | Cross-cutting — available any time in Phase 4 |
| storytelling | creative router | Cross-cutting — available any time in Phase 4 |

### Phase 5 — Design (5 core + 1 conditional)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| design-brief | `lifecycle/5-design/design-brief/` | workflow | 5 | @ux-designer |
| ux-design | `lifecycle/5-design/ux-design/` | workflow | 5 | @ux-designer |
| brand-guidelines | `lifecycle/5-design/brand-guidelines/` | workflow | 5 | @ux-designer |
| prototype | `lifecycle/5-design/prototype/` | workflow | 5 | @ux-designer |
| narrative | `lifecycle/5-design/narrative/` | workflow (wrapper) | 5 | @ux-designer |
| legacy-ui-assessment | `lifecycle/5-design/legacy-ui-assessment/` | workflow (conditional) | 5 | @ux-designer |

**PRD Reconciliation Pass (Phase 5 exit):**
- Triggered when Phase 5 skills surface `design_delta` entries
- @ux-designer → @pm hand-back via Pattern 7 transition
- 4 reconciliation_options per delta: accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11
- Lightweight PRD amendment via `validate-prd --sections=<list>` (TBD impl)
- `flag_for_architecture_ADR` deltas carry forward as MANDATORY ADR requirements at Phase 6 entry (silent-divergence guard)

**Cross-cutting wire-ins active in Phase 5:**
- `adversarial-review` — `ux-design` step-04, `prototype` step-04
- `editorial-prose` — `design-brief` step-04, `brand-guidelines` step-02-voice, `narrative` step-03
- `editorial-structure` — `design-brief` step-04, `ux-design` step-04, `brand-guidelines` step-04, `legacy-ui-assessment` step-03

### Phase 6 — Architecture (1)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| architecture-design | `lifecycle/6-architecture/architecture-design/` | workflow | 6 | @architect |

**Silent-divergence guard (Phase 6 critical mechanism):**
- Phase 5 may resolve design-deltas as `flag_for_architecture_ADR` — meaning PRD stays unchanged but design diverges
- Phase 6 entry consumes `architecture_adrs_required[]` from phase-5-to-6 handoff (Step 1: flagged-deltas-intake)
- Phase 6 Step 5 authors REQUIRED ADRs (each with `resolves_design_delta` field linking to source delta)
- Phase 6 exit gate check #5 (`architecture-adrs-for-flagged-deltas-emitted`, block-severity) verifies every flagged delta has corresponding ADR
- Mitigation converts silent PRD↔design divergence into auditable architectural-decision provenance

**Cross-cutting wire-ins active in Phase 6:**
- `adversarial-review` — `architecture-design` Step 6 finalisation (challenge architectural assumptions; pre-mortem on integration boundaries)
- `editorial-structure` — Step 6 finalisation (architecture.md structure check)
- `editorial-prose` — Step 5 ADR rationale prose polish

**Architecture amendment workflow:** Hybrid model per Phase 6 deep-dive Q5 — significant structural changes re-emit architecture.md (VC major bump); incremental decisions land as new ADRs referenced from § ADR Index (VC minor bump). Both routes use `governance/architecture-change/workflow.md`.

### Phase 7 — Breakdown (6 — 5 existing + 1 NEW under Shape A)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| breakdown-entry-sync (NEW) | `lifecycle/7-breakdown/breakdown-entry-sync/` | workflow | 7 | @pm |
| create-epics | `lifecycle/7-breakdown/create-epics/` | workflow | 7 | @pm |
| create-stories | `lifecycle/7-breakdown/create-stories/` | workflow | 7 | @pm |
| parallelization-strategy | `lifecycle/7-breakdown/parallelization-strategy/` | workflow | 7 | @pm |
| sprint-planning | `lifecycle/7-breakdown/sprint-planning/` | workflow | 7 | @scrum-master |
| implementation-readiness | `lifecycle/7-breakdown/implementation-readiness/` | workflow | 7 | @pm |

**Architecture-deltas reconciliation (Phase 7 ENTRY mechanism per Q2):**
- Phase 6 may surface PRD/UX gaps at architecture time → recorded as `architecture_delta` entries in phase-6-to-7 handoff
- Phase 7 entry-sync Step 1 reconciles them at phase BOUNDARY (not exit, per Q2)
- 4-option per delta: accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11
- accept_into_prd → first real consumer of `validate-prd --sections=<list>` lightweight-amendment path; bumps PRD VC

**PERT chart sacred (per Q3):** `_context/sacred/pert-chart.md` is sacred — downstream contract for Phase 8 wave-orchestration. Amendments via `governance/pert-change/`.

**Per-story files (per Q4):** Stories live as individual files at `_context/implementation/stories/story-NNN-<slug>-v{N}.md`. Index at `_context/implementation/stories-index.md`. Atomic versioning + Phase 8 dev-story locks individual stories.

**Archetype-conditional story granularity (per Q5):** vibe-coder-lean → thin (1-3h, AC); standard → medium (4-8h, BDD); design-led/WDS → richer with explicit UX-screen ref + brand-token use.

**9-point implementation-readiness checklist (per Q6):** structured checklist verifying every Phase 8 entry condition (PRD/UX/architecture coverage; flagged-deltas resolved; PERT valid; sprint complete; no ADR contradictions; prototype available; legacy reflected).

**@scrum-master sub-persona (Pattern 7 sub_phase_boundary transitions #8a + #8b):** Sprint-planning is owned by @scrum-master; @pm hands off at sprint-planning entry, @scrum-master hands back at sprint-planning exit.

**Cross-cutting wire-ins active in Phase 7:**
- `editorial-structure` — create-epics step-04, create-stories step-04, breakdown-scope-memo, implementation-readiness final report
- `editorial-prose` — story prose polish at create-stories step-04
- `adversarial-review` — story scope challenge; PERT critical-path challenge

### Phase 8 — Implementation (9 — cascade rename of old Phase 6)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| wave-orchestration (entry skill per Q1) | `lifecycle/8-implementation/wave-orchestration/` | workflow (orchestrator) | 8 | @developer |
| ci-pipeline | `lifecycle/8-implementation/ci-pipeline/` | workflow | 8 | @developer |
| test-framework | `lifecycle/8-implementation/test-framework/` | workflow | 8 | @qa |
| test-design | `lifecycle/8-implementation/test-design/` | workflow | 8 | @qa |
| dev-story | `lifecycle/8-implementation/dev-story/` | workflow | 8 | @developer |
| quick-dev | `lifecycle/8-implementation/quick-dev/` | workflow | 8 | @developer |
| atdd | `lifecycle/8-implementation/atdd/` | workflow | 8 | @qa |
| qa-automation | `lifecycle/8-implementation/qa-automation/` | workflow | 8 | @qa |
| code-review | `lifecycle/8-implementation/code-review/` | workflow | 8 | @qa |

**Implementation-deltas reconciliation (third forward-carry instance):** Phase 8 may surface PRD/UX/architecture gaps during execution. Reconciliation at Phase 8 EXIT in phase-transition step-02a-reconciliation (extended for from_phase==8). Reuses `design-delta.schema.json`.

**Archetype-conditional dev path per Q3:** vibe-coder-lean → quick-dev; standard → dev-story + ATDD; design-led/WDS → full ATDD + visual-regression + a11y.

**@qa Pattern 7 sub-persona (recurring):** #11a/#11b for test-framework one-time; #11c/#11d per story for code-review.

**Cross-cutting wire-ins active in Phase 8:**
- `adversarial-review` — wired into code-review per Q6; edge-case-hunter
- `editorial-prose` — code-comment polish
- `editorial-structure` — test-spec + code-review report structure

### Phase 9 — Deployment (6 — cascade rename of old Phase 7)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| readiness-check (entry skill per Q1) | `lifecycle/9-deployment/readiness-check/` | workflow | 9 | @devops |
| env-check | `lifecycle/9-deployment/env-check/` | workflow | 9 | @devops |
| security-scan | `lifecycle/9-deployment/security-scan/` | workflow | 9 | @devops |
| dep-health-check | `lifecycle/9-deployment/dep-health-check/` | workflow | 9 | @devops |
| db-migration-check | `lifecycle/9-deployment/db-migration-check/` | workflow (conditional) | 9 | @devops |
| deploy | `lifecycle/9-deployment/deploy/` | workflow (action) | 9 | @devops |

**Pre-deploy + post-deploy gate split (per Q2):** Pre-deploy gate (5 checks: readiness / env / security / dep-health / db-migration-conditional) → deploy action → post-deploy gate (3 checks: deploy-success / smoke / observability-baseline). Total 8 phase-9 gate.json checks.

**No forward-carry mechanism (per Q3):** Phase 9 is verification + execution + recording, not authoring. Divergence routes back via re-entry OR forward to Phase 10 as ops-issue.

**Existing infrastructure inherited (no re-spec):** docs/security-gate.md, docs/llm-gates.md, docs/phase-gate-protocol.md, docs/observability-setup.md.

**Cross-cutting wire-ins active in Phase 9:**
- `adversarial-review` — deploy plan red-team
- `editorial-structure` — deploy-log + readiness report
- `editorial-prose` — rollback-strategy prose

### Phase 10 — Operate (3 — cascade rename of old Phase 8)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| sprint-status (entry skill per Q1) | `lifecycle/10-operate/sprint-status/` | workflow (iterative) | 10 | @devops |
| correct-course | `lifecycle/10-operate/correct-course/` | workflow | 10 | @devops |
| document-project | `lifecycle/10-operate/document-project/` | workflow | 10 | @devops |

**Phase 10 is continuous in-flight operational work** post-deploy. User-invoked Phase 11 retrospective triggers exit.

**ops-deltas (fourth forward-carry instance to Phase 11):** delta_type enum (bug / performance / ux-friction / doc-gap / dependency-issue / security-incident); reconciliation_options (accept_into_phase_11_retrospective / accept_into_phase_11_product_evolution / immediate_corrective_action / park_for_phase_11). Aggregated by phase-transition step-02a-reconciliation (extended for from_phase==10 — forwards to Phase 11 handoff; does NOT amend PRD).

**@devops continues from Phase 9** (Pattern 7 transition #16; no agent change at Phase 9 → 10 boundary). #18 hands to @reviewer at Phase 11 entry.

### Phase 11 — Evolve (3 — cascade rename of old Phase 9; FINAL PHASE)
| Skill | Directory | Type | Phases | Agent |
|-------|-----------|------|--------|-------|
| retrospective (entry skill per Q1) | `lifecycle/11-evolve/retrospective/` | workflow | 11 | @reviewer |
| product-evolution | `lifecycle/11-evolve/product-evolution/` | workflow | 11 | @reviewer |
| innovation-strategy | `lifecycle/11-evolve/innovation-strategy/` | workflow | 11 | @reviewer |

**Phase 11 is FINAL** — no phase-12-handoff. Outputs feed NEXT iteration's Phase 1 entry via `_input/prior-iteration/` (inter-iteration cycle handoff per Q4).

**Consumes ops_deltas[]** from Phase 10 handoff (fourth forward-carry endpoint). 4-option reconciliation at retrospective Step 0: accept_into_phase_11_retrospective (cause analysis); accept_into_phase_11_product_evolution (backlog); immediate_corrective_action (logged only); park_for_phase_11.

**@reviewer takeover** from @devops at Phase 11 entry (Pattern 7 transition #18). Final transition #19 (phase_exit). Pattern 7 closes at Phase 11.

### Reviews (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| adversarial-review | `skills/reviews/adversarial-review/` | simple | any |
| edge-case-hunter | `skills/reviews/edge-case-hunter/` | simple | any |
| editorial-prose | `skills/reviews/editorial-prose/` | simple | any |
| editorial-structure | `skills/reviews/editorial-structure/` | simple | any |
| code-review | `skills/reviews/code-review/` | simple | 8 |
| code-audit | `skills/reviews/code-audit/` | simple | 8 |

### Testing (9)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| test-design | `skills/testing/test-design/` | workflow | 8 |
| test-framework | `skills/testing/test-framework/` | workflow | 8 |
| atdd | `skills/testing/atdd/` | workflow | 8 |
| test-review | `skills/testing/test-review/` | simple | 8 |
| ci-pipeline | `skills/testing/ci-pipeline/` | workflow | 8 |
| nfr-assessment | `skills/testing/nfr-assessment/` | workflow | 8 |
| traceability | `skills/testing/traceability/` | simple | 8 |
| test-automation | `skills/testing/test-automation/` | workflow | 8 |
| teach-me-testing | `skills/testing/teach-me-testing/` | reference | any |

### Creative (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| brainstorming | `skills/creative/brainstorming/` | workflow | 2, 4, 10 |
| design-thinking | `skills/creative/design-thinking/` | workflow | 2, 4 |
| problem-solving | `skills/creative/problem-solving/` | workflow | 2, 4, 8 |
| innovation-strategy | `skills/creative/innovation-strategy/` | workflow | 2, 10 |
| storytelling | `skills/creative/storytelling/` | workflow | 4, 10 |
| presentation | `skills/creative/presentation/` | workflow | 4, 10 |

### Utilities (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| advanced-elicitation | `skills/utilities/advanced-elicitation/` | simple | any |
| distillator | `skills/utilities/distillator/` | simple | any |
| shard-doc | `skills/utilities/shard-doc/` | simple | 1, 2, 4, 7, 10 |
| index-docs | `skills/utilities/index-docs/` | simple | 1, 4, 7, 10 |
| party-mode | `skills/utilities/party-mode/` | simple | any |
| document-project | `skills/utilities/document-project/` | workflow | 10 |

### Ops (6)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| env-check | `skills/ops/env-check/` | simple | 9 |
| dep-health-check | `skills/ops/dep-health-check/` | simple | 9 |
| security-scan | `skills/ops/security-scan/` | simple | 9 |
| ci-cd-setup | `skills/ops/ci-cd-setup/` | workflow | 9 |
| db-migration-check | `skills/ops/db-migration-check/` | simple | 9 |
| repo-structure-audit | `skills/ops/repo-structure-audit/` | simple | 1, 8, 9, 10 |

### Meta (5)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| agent-builder | `skills/meta/agent-builder/` | workflow | meta |
| skill-builder | `skills/meta/skill-builder/` | workflow | meta |
| workflow-builder | `skills/meta/workflow-builder/` | workflow | meta |
| template-builder | `skills/meta/template-builder/` | workflow | meta |
| propose-change | `skills/meta/propose-change/` | simple | meta |

### Stack Packs — vibe-coder-fullstack (5)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/vibe-coder-fullstack/quickstart/` | workflow | 3 |
| setup-auth | `skills/stack-packs/vibe-coder-fullstack/setup-auth/` | workflow | 8 |
| create-component | `skills/stack-packs/vibe-coder-fullstack/create-component/` | workflow | 8 |
| migration-helper | `skills/stack-packs/vibe-coder-fullstack/migration-helper/` | workflow | 8 |
| performance-audit | `skills/stack-packs/vibe-coder-fullstack/performance-audit/` | simple | 10 |

### Stack Packs — static-single-page (1)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/static-single-page/quickstart/` | workflow | 3 |

### Stack Packs — static-multipage-blog (1)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/static-multipage-blog/quickstart/` | workflow | 3 |

### Stack Packs — cli-npm-publishable (1)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/cli-npm-publishable/quickstart/` | workflow | 3 |

### Stack Packs — browser-extension (1)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/browser-extension/quickstart/` | workflow | 3 |

---

### Unit #28 additions (2026-05-03 external-skills integration — 22 new skills)

> Added by [docs/external-skills-gap-analysis-2026-05-03.md](../docs/external-skills-gap-analysis-2026-05-03.md). License-checked: alirezarezvani/AgriciDaniel/nextlevelbuilder/levnikolaevich (MIT) + mhattingpete (Apache-2.0). NOT vendored: anthropics/skills (no LICENSE — pattern reference only).

#### Tier 0 — Quick wins (5)

| Skill | Path | Phase(s) | Owner agent | Source |
|---|---|---|---|---|
| changelog-generator | `skills/ops/changelog-generator/` | 9, 10 | @devops | alirezarezvani (MIT) |
| secrets-vault-manager | `lifecycle/9-deployment/secrets-vault-manager/` | 9 | @devops | alirezarezvani (MIT) |
| observability-designer | `lifecycle/9-deployment/observability-designer/` | 9 | @devops | alirezarezvani (MIT) |
| decision-logger | `skills/utilities/decision-logger/` | 2-11 | @scrum-master | alirezarezvani (MIT) |
| (U05) SKILL-AUTHORING-STANDARD | `templates/infrastructure/skill.md` + `skills/meta/skill-builder/` v1.1 | meta | @valet | alirezarezvani (MIT) |

#### Tier 1 — High-value adds (7+)

| Skill | Path | Phase(s) | Owner agent | Source |
|---|---|---|---|---|
| diagram-creator | `lifecycle/6-architecture/diagram-creator/` | 6 | @architect | mhattingpete (Apache-2.0) |
| a11y-audit | `skills/reviews/a11y-audit/` | 5, 8 | @qa | alirezarezvani (MIT) |
| design-data CSVs | `data/design/` (colors/typography/styles/stacks) | 5 | @ux-designer (consumer) | nextlevelbuilder (MIT) |
| dependency-auditor | `lifecycle/9-deployment/dependency-auditor/` | 9 | @devops | alirezarezvani (MIT) |
| codebase-onboarding | `lifecycle/1-bootstrap/codebase-onboarding/` | 1 | @analyst | alirezarezvani+mhattingpete |
| prompt-engineering | `skills/meta/prompt-engineering/` | meta | @valet | alirezarezvani (MIT) |
| prompt-governance | `skills/meta/prompt-governance/` | meta | @valet | alirezarezvani (MIT) |
| incident-response | `lifecycle/10-operate/incident-response/` | 10 | @devops | alirezarezvani (MIT) |

#### Tier 2 — Stack-pack + emitters + marketplace (8)

| Skill | Path | Phase(s) | Owner agent | Source |
|---|---|---|---|---|
| seo-pack (top-level) | `skills/stack-packs/seo-pack/` | 3, 5, 8, 9, 10 | @architect (router) | AgriciDaniel (MIT) |
| seo-pack/audit | `skills/stack-packs/seo-pack/audit/` | 3, 5, 9, 10 | @devops | AgriciDaniel (MIT) |
| seo-pack/content | `skills/stack-packs/seo-pack/content/` | 5 | @communicator | AgriciDaniel (MIT) |
| seo-pack/schema | `skills/stack-packs/seo-pack/schema/` | 8 | @developer | AgriciDaniel (MIT) |
| seo-pack/local | `skills/stack-packs/seo-pack/local/` | 5, 8 | @ux-designer | AgriciDaniel (MIT) |
| seo-pack/technical | `skills/stack-packs/seo-pack/technical/` | 8, 9 | @devops | AgriciDaniel (MIT) |
| pdf-generator | `skills/creative/pdf-generator/` | 4, 5, 8, 10, 11 | @communicator | anthropics/skills (reference only) |
| docx-generator | `skills/creative/docx-generator/` | 4, 5, 11 | @communicator | anthropics/skills (reference only) |
| pptx-generator | `skills/creative/pptx-generator/` | 4, 10, 11 | @communicator | anthropics/skills + nextlevelbuilder |
| xlsx-generator | `skills/creative/xlsx-generator/` | 7, 9, 10, 11 | @communicator | anthropics/skills (reference only) |

**Plus build artefacts (not skills):**
- `plugin/plugin.json` v0.2.0-alpha → v0.3.0-alpha refresh
- `.claude-plugin/marketplace.json` NEW (Anthropic plugin marketplace canonical metadata)

**Updated total skill count:** ~118 (was ~96 pre-Unit-#28; 22 net new).

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
| 7.8 | 2026-04-25 | ColdPress Labs | Phase II Part 4 Waves 6+7. Phase 4 Planning skills section added: planning-entry-sync, create-prd, validate-prd, legacy-assessment (4 core) + available-on-demand (design-brief, problem-solving, storytelling). Phase 4 lifecycle row updated (create-ux-design/create-architecture removed per Shape A; planning-entry-sync + legacy-assessment added). skill-catalog.csv updated with 4 Phase 4 rows. |
| 7.7 | 2026-04-25 | ColdPress Labs | Phase II Part 4 Waves 1–5 sync. Phase 4 Planning row updated to Shape A scope (PRD-only, @pm primary). method-defaults.yaml renamed from phase-2-method-defaults.yaml (compatibility alias retained). phase_4: section added to method-defaults.yaml. |
| 7.6 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 6. Four new pack sections added: static-single-page (1), static-multipage-blog (1), cli-npm-publishable (1), browser-extension (1). All 5 packs now fully authored on disk with pack.yaml + SKILL.md + quickstart workflow + step files. |
| 7.5 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5. Phase 3 Tech Stack skills table expanded with Agent column. Available-on-demand subsection added for Phase 3 (brainstorming, innovation-strategy, party-mode). |
| 7.4 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 3 (complete). condition-reader.ts extended with product_type + domain_complexity. local-config-validator.ts extended with sub_state (4 variants: decision_area, category_index, env_provision_category, stack_lock_checkpoint). Phase 3 method playbook added (phase_3: section in method-defaults.yaml). 2 creative router stubs created (brainstorming, innovation-strategy). Wire-in status updated: distillator, advanced-elicitation, adversarial-review, editorial-structure, repo-structure-audit, party-mode, scan-secrets. CSV: brainstorming [2,3,4,8], innovation-strategy [2,3,8], advanced-elicitation [2,3,4,5,6,8], scan-secrets row added. |
| 7.3 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 2 (complete). Added Phase 3 Tech Stack skills section (5 skills): stack-discovery-sync, stack-evaluation, stack-locking, env-provision, re-entry router. Phase 3 lifecycle row updated with all 5 skills. skill-catalog.csv updated with all 5 rows. |
| 7.2 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 2 (complete). Phase 2 Discovery row expanded to full shape: added `synthesize-research` (workflow, `@analyst` — consolidates parallel research into versioned synthesis artefact; wires distillator + adversarial-review + editorial-structure) and `validate-idea` (workflow, `@analyst` — 9 steps, 2 conditional on team_shape, Step 9 red-flag escape hatch; warn-severity at gate). Phase 2 workflow skill count: 8 (target reached). Full Phase 2 ship: 8 workflow skills + 4 creative routers. |
| 7.1 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 2 (partial). Phase 2 Discovery row expanded: added `personas` (new workflow skill, `@ux-designer` — canonical UX research artefact) and two new router stubs `problem-solving` + `innovation-strategy` (pointing at `skills/creative/`, matching existing brainstorming / design-thinking pattern). Full shipped Phase 2 skill set: 5 workflow skills + 4 creative routers. `synthesize-research` + `validate-idea` still pending (split to next session). |
| 7.0 | 2026-04-24 | ColdPress Labs | Phase II Part 1 Wave 5.1a. Bootstrap row updated: `machine-setup, project-init, agent-scaffold` (retired in Wave 4) → `orient, intake` (new in Wave 3). Utilities count 7 → 6 (pdf-deep-parser retired; covered by parse-document ingestion skill). Phase updates: shard-doc `any` → `1, 2, 4, 7, 10`; index-docs `any` → `1, 4, 7, 10`; repo-structure-audit `any` → `1, 8, 9, 10`; Convex quickstart `1` → `3` (misclassification — stack decisions happen in Phase 3). |
| 6.0 | 2026-04-14 | ColdPress Labs | Phase H audit: added 14 missing lifecycle skills to phase table, removed phantom tea-resources-index.yaml, corrected design template count 57→48. |
| 5.0 | 2026-04-14 | ColdPress Labs | Post-audit refresh: all Phase 5 input paths corrected, UX spec path standardized, data asset references validated (6 filename mismatches fixed), sprint-status expanded to 3 steps, create-architecture steps written, validate-prd converted to workflow, machine-setup converted to workflow. 90 skills, 74 workflows, 200 step files. |
| 4.0 | 2026-04-13 | ColdPress Labs | Consolidated 19 personas → 9 real subagents. Updated agents section. Skill-catalog agent references updated. |
| 3.0 | 2026-04-08 | ColdPress Labs | Added Valet (19th agent) — Butler's meta counterpart |
| 2.0 | 2026-04-08 | ColdPress Labs | Renamed all 18 agents to new names |
| 1.0 | 2026-04-07 | ColdPress Labs | Initial registry — 18 agents, 10 phases, 44 skills, 7 stack-pack skills, governance |
