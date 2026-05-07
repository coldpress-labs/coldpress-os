# Templates Registry

> Single registry of authoring templates indexed by phase × artefact-type. Companion to `REGISTRY.md` (skills + agents) and `data/agents/skill-catalog.csv` (skills tabular). Templates live under `coldpress-os/templates/` (canonical) and `coldpress-os/template/.claude/agents/` (subagent definitions).
>
> **Closes audit punch-list §3.2 / Tier 3.2** — framework-audit Wave 4 §4.7 carry-forward; system review §3.2 ([docs/system-review-2026-05-02.md](../docs/system-review-2026-05-02.md)).

---

## §1 — Templates by phase × artefact-type

### Phase 1 — Bootstrap

| Artefact | Template | Owner agent |
|---|---|---|
| Project root `CLAUDE.md` | `template/CLAUDE.md` | butler scaffold |
| Project root `coldpress.yaml` | `template/coldpress.yaml` | butler scaffold |
| `.claude/SYSTEM.md` | `template/.claude/SYSTEM.md` | butler scaffold |
| Subagent definitions | `template/.claude/agents/{analyst,pm,ux-designer,architect,developer,qa,scrum-master,communicator,reviewer,devops,valet}.md` | scaffold |
| Sandbox repo | `template/sandbox/` | butler scaffold |
| Live repo | `template/live/` | butler scaffold |

### Phase 2 — Discovery

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/sacred/context.md` | `templates/documents/context.md` | @analyst |
| `_context/planning/product-brief-v{N}.md` | `templates/design/00-product-brief.template.md` | @analyst |
| `_context/planning/personas-{slug}.md` | `templates/design/persona-document.template.md` | @analyst |
| Project info | `templates/design/00-project-info.template.md` | @analyst |
| Business goals | `templates/design/business-goals-template.md` | @analyst |

### Phase 3 — Tech Stack

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/sacred/tech-stack.md` | `templates/documents/tech-stack.md` | @architect |
| `_context/planning/adrs/adr-{slug}-v{N}.md` | `templates/documents/adr.md` | @architect |
| Platform requirements | `templates/design/platform-requirements.template.md` (md) + `.template.yaml` | @architect |

### Phase 4 — Planning

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/sacred/prd.md` | `templates/documents/prd.md` | @pm |
| `_context/planning/legacy-migration-plan-v{N}.md` | (no template; emitted by `legacy-assessment` skill from prose) | @architect (sub) |
| Trigger map | `templates/design/00-trigger-map.template.md` + `trigger-map.template.md` | @analyst |

### Phase 5 — Design

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/design/design-brief-v{N}.md` | (no template; emitted by `design-brief` skill from §7b graph-first) | @ux-designer |
| `_context/design/ux-design-spec-v{N}.md` | `templates/documents/ux-design-spec.md` | @ux-designer |
| `_context/design/brand-guidelines-v{N}.md` | `templates/documents/brand-guidelines.md` | @ux-designer |
| Design system snapshot | `templates/design/00-design-system.template.md` | @ux-designer |
| Design log | `templates/design/00-design-log.template.md` | @ux-designer |
| Design tokens | `templates/design/design-tokens.template.md` | @ux-designer |
| Component spec | `templates/design/component.template.md` + `component-library-config.template.md` | @ux-designer |
| Page specification | `templates/design/page-specification.template.md` + `page-template.html` + `lightweight-page-template.md` | @ux-designer |
| UX scenarios | `templates/design/00-ux-scenarios.template.md` + `scenario-overview.template.md` + `scenario-outline-template.md` + `test-scenario.template.yaml` | @ux-designer |
| Storyboard spec | `templates/design/storyboard-specification.template.md` | @ux-designer |
| Visual direction | `templates/design/visual-direction.template.md` | @ux-designer |
| Tone of voice | `templates/design/tone-of-voice-output-template.md` + `content-language.template.md` | @ux-designer |
| Demo data | `templates/design/demo-data-template.json` + `placeholder-templates.md` | @ux-designer |
| Prototype scaffold | `templates/prototype/{code-skeleton,mock-spec,clickable-html}/README.md` | @ux-designer |
| Inspiration analysis | `templates/design/inspiration-analysis.template.md` | @ux-designer |
| Prototype roadmap | `templates/design/PROTOTYPE-ROADMAP-template.md` | @ux-designer |
| Catalog (HTML) | `templates/design/catalog.template.html` | @ux-designer |
| Audit / diagnostic / signoff / feature-impact | `templates/design/{audit-report,diagnostic-report,signoff,feature-impact}.template.md` | @ux-designer |
| WDS delivery | `templates/design/wds{4,8}-delivery-templates.md` | @ux-designer (WDS archetype only) |

### Phase 6 — Architecture

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/sacred/architecture.md` | `templates/documents/architecture.md` | @architect |
| ADRs (Phase 6 set; reuses Phase 3 template) | `templates/documents/adr.md` | @architect |

### Phase 7 — Breakdown

| Artefact | Template | Owner agent |
|---|---|---|
| Epics index | `templates/documents/epic.md` | @pm |
| Per-story file | `templates/documents/story.md` + `templates/design/story-file-template.md` (legacy) | @pm |
| `_context/tracking/sprint-status-v{N}.yaml` | `templates/documents/sprint-status.yaml` | @scrum-master (sub) |
| `_context/sacred/pert-chart.md` | `templates/documents/pert-chart.md` | @scrum-master |
| Issue templates | `templates/design/issue-templates.md` | @scrum-master |

### Phase 8 — Implementation

| Artefact | Template | Owner agent |
|---|---|---|
| Per-story dev work | (no document template; per-story files from Phase 7 used as input) | @developer |
| CI/CD pipeline config | `.github/workflows/*.yml` (project-level) | @developer |
| Test result tracking | `templates/design/test-result-templates.md` | @qa (sub) |

### Phase 9 — Deployment

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/audit/readiness-v{N}.md` | (no template; emitted by `readiness-check` aggregator) | @devops |
| `_context/audit/deploy-log-v{N}.md` | (schema-driven from `deploy-log.schema.json`) | @devops |
| Monitoring spec | `templates/design/monitoring-templates.md` | @devops |

### Phase 10 — Operate

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/tracking/sprint-status-v{N}.yaml` (steady-state) | `templates/documents/sprint-status.yaml` | @devops |
| `_context/audit/course-correction-v{N}.md` | (schema-driven from `course-correction.schema.json`) | @devops |
| `_context/audit/incident-{slug}-v{N}.md` | (no template; postmortem prose) | @devops |

### Phase 11 — Evolve

| Artefact | Template | Owner agent |
|---|---|---|
| `_context/audit/retrospective-v{N}.md` | `templates/documents/retrospective.md` | @reviewer |
| `_context/audit/product-evolution-backlog-v{N}.md` | (schema-driven from `product-evolution-backlog.schema.json`) | @reviewer |
| `_context/audit/innovation-strategy-v{N}.md` | (schema-driven from `innovation-strategy.schema.json`) | @reviewer |

---

## §2 — Cross-cutting templates (any phase)

### Governance

| Template | Purpose |
|---|---|
| `templates/governance/rfc-amendment.md` | Generic sacred-doc amendment RFC payload |
| `templates/governance/policies/` | Policy fragments (sacred-doc protection, supersede-check, etc.) |

### Contracts (client-archetype)

| Template | Purpose |
|---|---|
| `templates/contracts/contract.template.md` | Client engagement contract |
| `templates/contracts/pitch.template.md` | Client pitch deck outline |
| `templates/contracts/service-agreement.template.md` | Service-agreement contract |

### Prompt snippets (forcing functions)

| Template | Purpose |
|---|---|
| `templates/prompt-snippets/attention-preamble.md` | Preamble for skill prompts |
| `templates/prompt-snippets/forcing-function-mermaid.md` | Force Mermaid output |
| `templates/prompt-snippets/forcing-function-table.md` | Force table output |
| `templates/prompt-snippets/output-contract.md` | Output-contract block |
| `templates/prompt-snippets/review-cot-triangle.md` | Chain-of-thought review pattern |

### Infrastructure (skill / agent / workflow scaffolds)

| Template | Purpose |
|---|---|
| `templates/infrastructure/CLAUDE.md` | Project-root CLAUDE.md scaffold |
| `templates/infrastructure/SYSTEM.md` | `.claude/SYSTEM.md` scaffold |
| `templates/infrastructure/agent.md` | New subagent scaffold |
| `templates/infrastructure/skill.md` | New skill (SKILL.md) scaffold |
| `templates/infrastructure/workflow.md` | New workflow.md scaffold |
| `templates/infrastructure/cursorrules.md` | `.cursor/rules/<slug>.mdc` source |

### Subagent definitions (Phase 1 scaffold targets)

| Agent | Template | Phases |
|---|---|---|
| @analyst | `template/.claude/agents/analyst.md` | 2, 4 |
| @pm | `template/.claude/agents/pm.md` | 4, 7 |
| @ux-designer | `template/.claude/agents/ux-designer.md` | 5 |
| @architect | `template/.claude/agents/architect.md` | 3, 6 |
| @developer | `template/.claude/agents/developer.md` | 8 |
| @qa | `template/.claude/agents/qa.md` | 8, 9 |
| @scrum-master | `template/.claude/agents/scrum-master.md` | 7, 10 |
| @communicator | `template/.claude/agents/communicator.md` | 4, 10 |
| @reviewer | `template/.claude/agents/reviewer.md` | 11 |
| @devops | `template/.claude/agents/devops.md` | 9, 10 |
| @valet | `template/.claude/agents/valet.md` | meta |

---

## §3 — Authoring conventions

### Template naming

- **`{name}.md`** — primary artefact template; expected to be filled at consumption (placeholder substitution)
- **`{name}.template.md`** — explicit template marker (used in `templates/design/`); same shape, different naming convention from older work
- **`{name}.template.yaml`** / `.template.html` / `.template.json` — non-markdown templates

### Placeholder syntax

Templates use `{placeholder}` syntax for substitution. Common placeholders:

| Placeholder | Filled by |
|---|---|
| `{project.name}` | `coldpress init` interactive prompt |
| `{project.slug}` | `coldpress init` interactive prompt |
| `{user.name}` | `coldpress init` interactive prompt |
| `{butler.display_name}` | Phase 1 `intake` skill (defaults to "Butler" if unset) |
| `{N}` (in versioned files) | Skill that emits the artefact (always integer; starts at 1) |
| `{date}` | Skill that emits the artefact (ISO date; YYYY-MM-DD) |
| `{from_phase}`, `{to_phase}` | `phase-transition` step-03-handoff-log |
| `{slug}` | Caller-defined kebab-case identifier |

### Schema-driven artefacts

Some artefacts are emitted from schemas (no markdown template):

- `code-review-v{N}.md` — `schemas/audit/code-review.schema.json`
- `readiness-v{N}.md` — `schemas/audit/readiness.schema.json`
- `deploy-log-v{N}.md` — `schemas/audit/deploy-log.schema.json`
- `course-correction-v{N}.md` — `schemas/audit/course-correction.schema.json`
- `product-evolution-backlog-v{N}.md` — `schemas/audit/product-evolution-backlog.schema.json`
- `innovation-strategy-v{N}.md` — `schemas/audit/innovation-strategy.schema.json`
- `phase-{from}-to-{to}-{date}.md` — `schemas/handoffs/phase-handoff.schema.json`
- `prd-amendment-{date}-{seq}.md` — `schemas/sacred-docs/prd-amendment.schema.json`

The schema defines required fields; the emitting skill fills them. Markdown wrapper around the YAML/JSON payload is conventional but not template-driven.

### How to add a new template

1. Choose category: `templates/{category}/` (governance, design, contracts, prompt-snippets, infrastructure, documents, prototype).
2. Author the file with `{placeholder}` substitution markers.
3. If the artefact has a schema in `schemas/`, prefer schema-driven over template-driven (don't duplicate field definitions).
4. Add a row to the appropriate `§1` phase × artefact-type table above.
5. If the template has subagent ownership different from the phase owner, note it in the "Owner agent" column.

---

## §4 — Audit guidance

When auditing template usage:

1. **Skill claims a template that's not in this registry** → either the template is missing (real gap), the registry is stale (update registry), or the skill is making up a path (real bug — flag).
2. **Template exists but no skill references it** → may be dead (candidate for removal) or pre-positioned for future use. Cross-reference with skill SKILL.md `outputs:` blocks.
3. **Two skills claim the same template with different ownership** → check if the canonical-vs-router pattern applies (see [`docs/cross-cutting/cross-cutting-skills.md`](docs/cross-cutting/cross-cutting-skills.md)).
4. **Schema-driven artefact has a markdown template too** → likely OK if the markdown template is a wrapper around the schema payload; flag if the two have diverged content.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (autonomous queue unit #27.3.2) | Initial Templates Registry. §1 phase × artefact-type tables (Phases 1-11) + §2 cross-cutting templates (governance, contracts, prompt-snippets, infrastructure, subagent definitions) + §3 authoring conventions (naming, placeholders, schema-driven distinction, how-to-add) + §4 audit guidance. Closes framework-audit Wave 4 §4.7 carry-forward + system review §3.2. |
