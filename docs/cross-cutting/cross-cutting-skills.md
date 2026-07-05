---
name: cross-cutting-skills
description: Convention spec for cross-cutting skills (creative routers, review skills, governance utilities) that span multiple lifecycle phases. Codifies the canonical-vs-router pattern, agent-ownership rules, and the convention for declaring `phases:` arrays.
version: "1.0"
---

# Cross-Cutting Skills

> Cross-cutting skills are skills that operate across multiple lifecycle phases, owned by a domain-appropriate agent rather than a single phase-owner agent. This doc codifies the conventions that govern them so audits don't keep flagging the same "conflicts".

---

## Why this pattern

Some skills don't belong to a single phase. Examples:

- **Creative routers** (`brainstorming`, `design-thinking`, `innovation-strategy`, `problem-solving`, `storytelling`) — invoked in 3-6 phases, but the skill itself is one canonical implementation.
- **Review skills** (`adversarial-review`, `editorial-prose`, `editorial-structure`) — invoked at quality-gate moments in many phases.
- **Governance utilities** (`phase-transition`, `validate-schema`, `supersede-check`) — phase-boundary or any-time invocation.

If each phase had its own copy, drift is inevitable: a tweak in one phase's `brainstorming` would lag in another. The framework keeps **one canonical skill** and lets each phase invoke it.

---

## The canonical-vs-router pattern

There are two co-existing forms for cross-cutting skills:

### 1. Canonical form

The single, authoritative implementation. Lives at:

```
coldpress-os/skills/<category>/<skill-name>/
```

- Categories so far: `creative/`, `reviews/`, `governance/`, `utilities/`, `meta/`, `testing/`, `ops/`.
- Frontmatter declares `phases: [N, M, ...]` (array — multi-phase) and `agent: <slug>` (the **domain-owner** agent — `analyst` for ideation, `reviewer` for retrospective, `verifier` for review, etc.).
- Implementation logic lives here. Skill files (`SKILL.md` + `workflow.md` + `steps/`) are authored once.

### 2. Phase router form (optional)

Where a phase has natural framing for the canonical skill — distinct enough that a thin wrapper helps — a phase-owned **router** skill lives at:

```
coldpress-os/lifecycle/<N-phase>/<router-name>/
```

The router:
- Declares `phase: N` (singular — single-phase).
- Declares `agent: <phase-owner-agent>` (the **phase-owner**, NOT the domain-owner).
- Has minimal SKILL.md + workflow that **delegates to the canonical skill**, framing inputs and capturing the canonical output into the phase's artefact paths.
- Does not duplicate the canonical skill's logic.

Example: `narrative` (Phase 5) is a router that wraps `skills/creative/storytelling/`. `narrative.SKILL.md` declares `phase: 5` + `agent: ux-designer`; the canonical `skills/creative/storytelling/SKILL.md` declares `phases: [2, 5, 8, 11]` + `agent: butler`.

### Why the apparent conflict in agent-ownership is by design

Audits flag entries like:
- `brainstorming` declared `agent: analyst` at `skills/creative/brainstorming/` AND `agent: architect` at `lifecycle/3-tech-stack/brainstorming-router/` (hypothetical).
- `storytelling` declares `agent: butler` at `skills/creative/storytelling/` AND `agent: analyst` at `lifecycle/4-planning/storytelling/` (the Phase 4 instance).

This is **not a conflict** — it's the canonical-vs-router pattern. The audit must distinguish:

| Path | Form | Agent | Purpose |
|---|---|---|---|
| `skills/creative/brainstorming/` | canonical | `analyst` (domain owner — ideation) | Implementation of brainstorming |
| `lifecycle/2-discovery/brainstorming-router/` (if exists) | router | `analyst` (phase owner happens to match) | Phase 2 invocation framing |
| `lifecycle/3-tech-stack/brainstorming-router/` (if exists) | router | `architect` (phase owner) | Phase 3 invocation framing |

A future audit should **only flag**: (a) two canonicals with the same name; (b) a router whose `phase: N` doesn't appear in the canonical's `phases: [N, ...]` array.

---

## Agent-ownership rules

| Skill kind | Canonical lives at | Canonical's `agent:` | Router (if needed) lives at | Router's `agent:` |
|---|---|---|---|---|
| Ideation router (brainstorming, design-thinking, innovation-strategy, problem-solving) | `skills/creative/<name>/` | `analyst` | `lifecycle/<N>/<router-name>/` | phase-owner agent |
| Storytelling | `skills/creative/storytelling/` | `butler` | `lifecycle/<N>/<router-name>/` | phase-owner (e.g., `ux-designer` in Phase 5) |
| Review (adversarial-review, editorial-prose, editorial-structure) | `skills/reviews/<name>/` | `qa` (most cases) or `reviewer` | (rarely needs a router) | n/a |
| Governance (phase-transition, validate-schema, supersede-check) | `skills/governance/<name>/` | varies | n/a | n/a |
| Utility (party-mode, docs, advanced-elicitation) | `skills/utilities/<name>/` | varies | n/a | n/a |

**Rule of thumb:** the canonical's `agent:` is the **domain owner** ("who would naturally lead this kind of work") regardless of phase. The router's `agent:` is the **phase owner** ("who is leading this phase").

---

## `phases:` array semantics

Cross-cutting skill `phases:` arrays are **declarations of availability**, not invocation guarantees. A skill listing `phases: [2, 4, 5, 8]` means: "I am invokable from any of these phases; the phase's step files decide whether to actually invoke me."

A `phases:` array entry that no step file actually invokes is **not** an orphan in the strict sense — it's a forward-looking availability declaration. Audit tooling should warn (not block) when this happens.

**Phase-singular skills** (lifecycle skills + routers) declare `phase: N` (singular). Cross-cutting skills declare `phases: [...]` (array). Mixing the two on the same skill is a real conflict.

---

## Conventions for new cross-cutting skills

When introducing a new cross-cutting skill:

1. Decide canonical category. If it doesn't fit existing categories, propose a new top-level under `skills/`.
2. Author canonical at `skills/<category>/<name>/`. Frontmatter: `phases: [N, M, ...]`, `agent: <domain-owner>`.
3. If a phase has natural router framing: author router at `lifecycle/<N>/<router-name>/`. Frontmatter: `phase: N`, `agent: <phase-owner>`. Workflow delegates to canonical.
4. Document in REGISTRY.md under the **right phase** sub-section (the canonical lists ALL phases it spans; the router lists only its own phase).
5. No manual catalog step — skills are auto-discovered by `build:skills`; each skill's own `agent:` frontmatter is authoritative.

---

## Audit guidance

When auditing skill-name conflicts:

1. **Different paths, same name** — check whether one is canonical (`skills/`) and the other is router (`lifecycle/`). If so, NOT a conflict.
2. **Same path, two skill files** — this is a real conflict (impossible by filesystem; would surface as a Git rename/merge issue).
3. **Both canonical** — real conflict. Pick one location.
4. **Both router** — real conflict if same phase; legitimate if different phases (e.g., separate `lifecycle/2-discovery/storytelling-router/` and `lifecycle/5-design/narrative/` are different routers wrapping the same canonical).

When auditing agent-ownership:

1. Canonical at `skills/creative/X/` with `agent: analyst` AND router at `lifecycle/N/X-router/` with `agent: pm` — NOT a conflict. The router agent matches the phase owner.
2. Two canonicals with different agents — real conflict.
3. Router agent that doesn't match the phase's primary agent — possible bug; investigate.

---

## Inventory (as of 2026-05-03 — post-Unit-#28)

### Creative canonicals

| Skill | Path | Agent | Phases |
|---|---|---|---|
| `brainstorming` | `skills/creative/brainstorming/` | analyst | (declared in frontmatter) |
| `design-thinking` | `skills/creative/design-thinking/` | analyst | (declared in frontmatter) |
| `innovation-strategy` | `skills/creative/innovation-strategy/` | analyst | (declared in frontmatter) |
| `problem-solving` | `skills/creative/problem-solving/` | analyst | (declared in frontmatter) |
| `storytelling` | `skills/creative/storytelling/` | butler | [2, 5, 8, 11] |
| `presentation` | `skills/creative/presentation/` | butler | (declared in frontmatter) |
| `pdf-generator` ⭐NEW | `skills/creative/pdf-generator/` | butler | [4, 5, 8, 10, 11] |
| `docx-generator` ⭐NEW | `skills/creative/docx-generator/` | butler | [4, 5, 11] |
| `pptx-generator` ⭐NEW | `skills/creative/pptx-generator/` | butler | [4, 10, 11] |
| `xlsx-generator` ⭐NEW | `skills/creative/xlsx-generator/` | butler | [7, 9, 10, 11] |

### Phase routers wrapping creatives

| Router | Path | Agent (phase owner) | Wraps |
|---|---|---|---|
| `narrative` | `lifecycle/5-design/narrative/` | ux-designer | `skills/creative/storytelling/` |

### Review skills (typically no routers needed)

| Skill | Path | Agent | Phases |
|---|---|---|---|
| `adversarial-review` | `skills/reviews/adversarial-review/` | verifier | (multi) |
| `editorial-prose` | `skills/reviews/editorial-prose/` | verifier | (multi) |
| `editorial-structure` | `skills/reviews/editorial-structure/` | verifier | (multi) |
| `code-review` | `skills/reviews/code-review/` | verifier | [8] |
| `code-audit` | `skills/reviews/code-audit/` | verifier | (multi) |
| `edge-case-hunter` | `skills/reviews/edge-case-hunter/` | verifier | (multi) |
| `a11y-audit` ⭐NEW | `skills/reviews/a11y-audit/` | verifier | [5, 8] (archetype-conditional severity) |

### Utilities (cross-phase, no router pattern)

| Skill | Path | Agent | Phases |
|---|---|---|---|
| `decision-logger` ⭐NEW | `skills/utilities/decision-logger/` | pm | [2-11] |
| `advanced-elicitation` | `skills/utilities/advanced-elicitation/` | (any) | (any) |
| `party-mode` | `skills/utilities/party-mode/` | (all 11 dispatched) | (any) |
| `docs` | `skills/utilities/docs/` | (any) | (any) |
| `index-docs` | `skills/utilities/index-docs/` | (any) | (any) |
| `docs` | `skills/utilities/docs/` | (any) | (any) |
| `document-project` | `skills/utilities/document-project/` | butler | [10] |

### Ops skills (cross-phase deployment + operations)

| Skill | Path | Agent | Phases |
|---|---|---|---|
| `changelog-generator` ⭐NEW | `skills/ops/changelog-generator/` | devops | [9, 10] |
| `ci-cd-setup` | `skills/ops/ci-cd-setup/` | devops | [3, 9] |
| `db-migration-check` | `skills/ops/db-migration-check/` | devops | [9] |
| `dep-health-check` | `skills/ops/dep-health-check/` | devops | [9] |
| `env-check` | `skills/ops/env-check/` | devops | [9] |
| `repo-structure-audit` | `skills/ops/repo-structure-audit/` | devops | (any) |
| `security-scan` | `skills/ops/security-scan/` | devops | [9] |

### Meta skills (framework evolution)

| Skill | Path | Agent | Phases |
|---|---|---|---|
| `skill-builder` v1.1 ⭐UPDATED | `skills/meta/skill-builder/` | butler | meta |
| `agent-builder` | `skills/meta/agent-builder/` | butler | meta |
| `template-builder` | `skills/meta/template-builder/` | butler | meta |
| `workflow-builder` | `skills/meta/workflow-builder/` | butler | meta |
| `propose-change` | `skills/meta/propose-change/` | butler | meta |
| `bmad-import` | `skills/meta/bmad-import/` | butler | meta |
| `prompt-engineering` ⭐NEW | `skills/meta/prompt-engineering/` | butler | meta |
| `prompt-governance` ⭐NEW | `skills/meta/prompt-governance/` | butler | meta |

### Stack-pack (cross-phase domain bundle)

| Pack | Path | Phases | Sub-skills |
|---|---|---|---|
| `seo-pack` ⭐NEW | `skills/capability-packs/seo-pack/` | [3, 5, 8, 9, 10] | audit / content / schema / local / technical (5 sub-skills) |
| (others — vibe-coder-fullstack, browser-extension, cli-npm-publishable, static-single-page, static-multipage-blog) | `skills/stack-packs/<name>/` | varies | varies |

---

## See also

- [`docs/skill-md-generator-spec.md`](../skill-md-generator-spec.md) — frontmatter spec, plugin/skills/ mirror policy
- [`REGISTRY.md`](../../REGISTRY.md) — canonical skill registry by phase + category
- [`pattern-7-agent-personas.md`](pattern-7-agent-personas.md) — agent transitions across phase boundaries (interacts with this doc when routers transition agents)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-02 | Andy-coldpress-os (autonomous queue unit #23a) | Initial cross-cutting skills convention spec. Codifies canonical-vs-router pattern (audit punch-list §1.2). Inventory of current creative canonicals + Phase 5 narrative router. Audit guidance for distinguishing real conflicts from canonical-vs-router pattern. |
