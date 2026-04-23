# Attribution Audit — coldpress-os

> A file-level accounting of which artifacts in this repository are derived from
> three upstream projects — BMAD-METHOD, the Creative Intelligence Suite (CIS),
> and the Whiteport Design System (WDS) — and which were originally authored
> by ColdPress Labs. Companion to [`NOTICE.md`](../NOTICE.md), which records
> the higher-level attribution and license posture.

---

## Purpose

coldpress-os is a substantial derivative work of **three MIT-licensed upstream
projects**:

1. [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) v6.2.2 — © BMad Code, LLC
2. [Creative Intelligence Suite (CIS)](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite) — a BMAD module, © BMad Code, LLC
3. [BMAD-METHOD-WDS](https://github.com/whiteport-collective/BMAD-METHOD-WDS) — a BMAD module, © Mårten Angner / Whiteport Collective

CIS and WDS are bundled into the BMAD v6.2.2 installation from which coldpress-os
was forked, but WDS has a distinct original author (Whiteport Collective) and
is credited separately throughout this audit and in `NOTICE.md`.

This audit exists so that:

1. Downstream consumers know exactly which parts of coldpress-os came from
   which upstream and which were authored fresh.
2. Future maintainers can track drift from upstream for any future sync.
3. The attribution in `NOTICE.md` is backed by a specific, honest accounting
   rather than a vague acknowledgement.

## Method

coldpress-os was compared directory-by-directory against an installed copy of
BMAD v6.2.2 (`_bmad/` — the `_config`, `core`, `bmm`, `cis`, and `wds` modules).
For each significant file or file group, we checked for an upstream equivalent
by filename, content, and concept, identified **which** upstream it came from
where possible, and classified each into one of four buckets:

- **Derived — close port.** Direct copy or near-copy of an upstream artifact
  (minor edits, renames, path moves). The upstream is clearly recognisable
  and the bulk of the content is upstream's.
- **Derived — substantially modified.** Upstream origin is clear (shared
  structure, shared concept, often shared content in places) but coldpress-os
  has significantly restructured, rewritten, or extended it.
- **Inspired — conceptual only.** The abstraction or pattern is lifted from
  upstream but the implementation is original ColdPress Labs work.
- **Original — ColdPress Labs.** No upstream precedent; authored fresh for
  coldpress-os.

Where possible, we also tag derivations with the specific upstream module
(**BMAD-core**, **CIS**, or **WDS**).

We group by subsystem where that is reasonable and call out specific notable
files inside each section. Where the audit is uncertain, we say so explicitly.

## Summary Table

| Subsystem | Upstream | Classification | Notes |
|-----------|---------|---------------|-------|
| `agents/_schema.md` | BMAD-core | Derived — substantially modified | v2 subagent format is a coldpress-os reinterpretation of BMAD's agent pattern |
| Legacy personas (19 archived files) | BMAD / CIS / WDS (mixed) | Derived — various | **Moved out of the published framework** to `hq-p001-coldpress-os/legacy/agents-archive/` ahead of public release. Retained at project level for historical reference only; not shipped with this repo. Per-file `origin:` frontmatter: 10 × `bmad`, 6 × `cis`, 2 × `wds`, 1 × `new`. |
| `skills/creative/` (brainstorming, design-thinking, innovation-strategy, problem-solving, storytelling) | **CIS** | Derived — substantially modified | These are the signature CIS workflows. Structure and technique libraries are CIS; coldpress-os rewraps as SKILL.md + workflow.md + steps/. `presentation` skill in same folder is BMAD-core-inspired. |
| `skills/planning/`, `skills/discovery/`, `skills/bootstrap/`, `skills/implementation/`, `skills/deployment/`, `skills/testing/`, `skills/reviews/`, `skills/utilities/` | BMAD-core | Derived — mix of close port and substantially modified | Most skills trace to `_bmad/core/` and `_bmad/bmm/`. `skills/utilities/` is closest to direct port; others are restructured. |
| `skills/meta/` | BMAD-core + original | Mixed | `agent-builder`, `skill-builder`, `workflow-builder`, `template-builder` inspired by BMAD-core authoring tools; `propose-change` is original |
| `skills/stack-packs/convex` | — | Original — ColdPress Labs | Stack-pack mechanism is a coldpress-os extension |
| `lifecycle/` (9-phase structure) | — | Inspired — conceptual only | 9-phase lifecycle shell is original; skill wrappers within each phase reference upstream-derived skills |
| `orchestrator/` | — | Original — ColdPress Labs | DAG/waves/PERT orchestrator has no upstream counterpart |
| `governance/` | — | Original — ColdPress Labs | Sacred-docs governance model and change workflows are a coldpress-os invention |
| `templates/documents/` | BMAD-core | Derived — substantially modified | Template concepts (PRD, architecture, story, epic, ADR) come from `_bmad/bmm/`; reformatted and extended for coldpress-os |
| `templates/design/` | **WDS** (primary) + BMAD-core | Derived — substantially modified | Design-system/UX templates sourced primarily from the BMAD `wds` module (v6.2.2, workflows `wds-0` through `wds-8`, © Whiteport Collective / Mårten Angner). `wds4-`/`wds8-` prefixes, `stitch-prompt.template.md`, trigger-map, scenario, and page-specification templates all originate in WDS. Some overlap with the BMAD-core `create-ux-design` skill. |
| `templates/contracts/` | — | Original — ColdPress Labs | Business/legal contract templates; no upstream precedent |
| `templates/infrastructure/` | BMAD-core (concept) | Inspired — conceptual only | `agent.md`/`skill.md`/`workflow.md` schemas reflect the BMAD format, authored fresh |
| `install/` | — | Original — ColdPress Labs | Submodule-based install and thin-wrapper generation are coldpress-os inventions |
| `docs/` (framework docs) | — | Original — ColdPress Labs | Architecture, glossary, flow map, walkthrough etc. written for coldpress-os |
| `data/methods/brainstorming-techniques.csv` | **CIS** | Derived — close port | Byte-identical (or nearly so) to CIS's `brain-methods.csv` |
| `data/methods/` other CSVs | CIS (likely) | Derived — likely close port | Design-thinking, problem-solving, storytelling, innovation-strategy method libraries — CIS parallels exist; row-level diff not performed |
| `data/agents/`, `data/ci-cd/`, `data/classification/`, `data/testing/` | — | Original — ColdPress Labs | Agent roster, project-type classifications, CI templates, testing curriculum — authored for coldpress-os |
| `coldpress.yaml` (root config template) | — | Original — ColdPress Labs | coldpress-os-specific configuration shape |
| `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `REGISTRY.md`, `LICENSE`, `NOTICE.md` | — | Original — ColdPress Labs | Standard repo docs, written for this project |
| `graph/vendor/graphify/` | **Graphify v4** (Safi Shamsi) | **Vendored — verbatim upstream** (stripped to indexer + retrieval core) | Python package vendored 2026-04-23 from https://github.com/safishamsi/graphify tree `v4`. Upstream MIT. Kept: `graphify/` (34 Python modules), LICENSE, README, ARCHITECTURE.md, CHANGELOG.md, pyproject.toml, AGENTS.md, SECURITY.md. Stripped: `docs/translations/` (26 README translations), `tests/` (upstream test suite), `scripts/` (upstream maintenance), `.git/`. Size: 2.6 MB → 1.5 MB. Schema reshape + Butler integration lands in Wave 3 Blocks N/O/P — until then the vendored tree is verbatim upstream. |

---

## Section-by-Section Breakdown

### `agents/`

- **`_schema.md`** — *Derived — substantially modified.*
  The concept of an agent definition schema is BMAD's (see BMAD's
  `_config/agent-manifest.csv` and the `bmad-agent-*` skills). coldpress-os
  reframes this as a "v2" schema explicitly targeted at Claude Code's native
  subagent system with independent context windows. The doc itself is
  originally written and explicitly calls out the departure from BMAD's
  prompt-persona "v1" style.

- **Legacy persona archive** — *Moved out of the framework repo.*
  The 19 deprecated persona files (`abby.md`, `arch.md`, `atlas.md`,
  `blitz.md`, `cody.md`, `crux.md`, `granger.md`, `iggy.md`, `iris.md`,
  `kai.md`, `leni.md`, `lyla.md`, `moxie.md`, `nova.md`, `quill.md`, `rex.md`,
  `valet.md`, `vera.md`, `zane.md`) previously lived at `agents/_archive/`.
  They were moved to `hq-p001-coldpress-os/legacy/agents-archive/` (outside
  this repo) ahead of public release to keep the framework surface clean.
  Per `_DEPRECATED.md`, they were consolidated into 9 canonical subagents
  (now at `template/.claude/agents/`). Each archived file
  retains an `origin:` frontmatter key tagging its upstream (`bmad`, `cis`,
  `wds`, or `new`) — this is the authoritative per-persona provenance record.

### `skills/`

All coldpress-os skills follow the same three-file shape as BMAD skills:
`SKILL.md` (frontmatter + summary) + `workflow.md` (process instructions) +
`steps/` (numbered step files). That shape is BMAD's
(`_bmad/core/bmad-brainstorming/` is the canonical example). The audit below
is by category.

- **`skills/creative/`** (`brainstorming`, `design-thinking`,
  `innovation-strategy`, `presentation`, `problem-solving`, `storytelling`) —
  *Derived — substantially modified.*
  **Upstream: CIS (Creative Intelligence Suite)** for all except `presentation`,
  which is BMAD-core. These are CIS's signature workflows — CIS exists
  specifically to cover the creative/strategic fuzzy front-end (brainstorming +
  150 techniques, design-thinking, problem-solving with 29 frameworks,
  innovation-strategy, storytelling). `brainstorming`'s step-file structure
  parallels CIS's `bmad-brainstorming` with deliberate restructuring (fewer,
  consolidated steps); the method library
  (`data/methods/brainstorming-techniques.csv`) is byte-identical to CIS's
  source. The other creative skills have CIS analogues in concept but their
  step files appear to have been rewritten.

- **`skills/meta/`** (`agent-builder`, `skill-builder`, `workflow-builder`,
  `template-builder`, `propose-change`) — *Mixed.*
  The four `*-builder` skills are coldpress-os-original tools for authoring
  coldpress-os artifacts. They are conceptually inspired by BMAD's approach
  of having skills that build other skills/agents but the content is
  originally written for this framework. **`propose-change`** is
  fully original (formalises feedback into GitHub Issues/PRs on the coldpress-os
  repo — no BMAD counterpart).

- **`skills/ops/`** (`ci-cd-setup`, `db-migration-check`, `dep-health-check`,
  `env-check`, `repo-structure-audit`, `security-scan`) — *Original — ColdPress
  Labs.* No direct BMAD equivalents found for this operations cluster.

- **`skills/reviews/`** (`adversarial-review`, `code-audit`, `code-review`,
  `edge-case-hunter`, `editorial-prose`, `editorial-structure`) — *Derived —
  substantially modified.* BMAD has `bmad-code-review`,
  `bmad-review-adversarial-general`, `bmad-review-edge-case-hunter`,
  `bmad-editorial-review-prose`, `bmad-editorial-review-structure`. Naming
  aligns 1:1 for five of six; content was repackaged into coldpress-os's
  format and categorisation but the underlying review methodology is BMAD's.
  `code-audit` does not have an obvious direct BMAD match and may be original.

- **`skills/stack-packs/convex`** — *Original — ColdPress Labs.* Stack packs
  are a coldpress-os extension mechanism.

- **`skills/testing/`** (`atdd`, `ci-pipeline`, `nfr-assessment`,
  `teach-me-testing`, `test-automation`, `test-design`, `test-framework`,
  `test-review`, `traceability`) — *Derived — substantially modified, with
  originals.* BMAD has a QA agent (`bmad-agent-qa`) and
  `bmad-qa-generate-e2e-tests`; the broader QA/testing taxonomy here (TEA index,
  role paths, curriculum in `data/testing/`) extends well beyond BMAD. Best
  understood as BMAD-inspired with substantial coldpress-os authoring.

- **`skills/utilities/`** (`advanced-elicitation`, `distillator`,
  `document-project`, `index-docs`, `party-mode`, `pdf-deep-parser`,
  `shard-doc`) — *Derived — close port.* All seven have direct BMAD
  counterparts in `_bmad/core/` (`bmad-advanced-elicitation`,
  `bmad-distillator`, `bmad-document-project`, `bmad-index-docs`,
  `bmad-party-mode`, `bmad-shard-doc`) or `bmm/` (`bmad-document-project`).
  `pdf-deep-parser` does not appear in BMAD and is likely original or from
  another source. These are among the most recognisably BMAD-derived skills.

### `lifecycle/`

- **The 9-phase structure** (`1-bootstrap` → `8-evolve`) — *Inspired —
  conceptual only.* BMAD organises workflows by module (core / bmm) and by
  BMM sub-phase (`1-analysis`, `2-plan-workflows`, `3-solutioning`,
  `4-implementation`). coldpress-os rethinks this into an opinionated 9-phase
  full-lifecycle pipeline. The phase model itself (Bootstrap, Discovery,
  Tech Stack, Planning, Breakdown, Implementation, Deployment, Evolve) is
  coldpress-os-original.

- **Phase contents** — Each phase directory primarily contains subdirectories
  that mirror skill names (e.g. `lifecycle/2-discovery/brainstorming/`,
  `lifecycle/4-planning/create-prd/`). These act as phase-scoped entry points
  into skills. The skills themselves inherit the derivation classification of
  their `skills/` counterpart. Phase `README.md` files are originally
  authored.

### `orchestrator/`

- **`orchestrator/README.md`, `engine/` (`dag-parser.md`, `gate-protocol.md`,
  `pert-generator.md`, `runtime-adapters.md`, `wave-grouper.md`),
  `strategies/`, `templates/`, `code/orchestrator-complete.ts`** — *Original
  — ColdPress Labs.*
  The README explicitly notes the orchestrator was "generalised from a prior
  ColdPress Labs project's epic orchestrator". No BMAD equivalent — BMAD does
  not provide a DAG/PERT/wave-based parallel orchestration engine. The
  Inngest TypeScript implementation is coldpress-os's own runtime.

### `governance/`

- **`sacred-docs.md`, `promotion-flow.md`, and change workflows
  (`architecture-change/`, `context-change/`, `pert-change/`, `prd-change/`,
  `tech-stack-change/`)** — *Original — ColdPress Labs.*
  BMAD has no equivalent "sacred document" governance model or the associated
  protected-change workflows. The devSandbox-to-app promotion flow is
  specific to ColdPress Labs' three-tier pattern.

### `templates/`

- **`templates/documents/`** (`adr.md`, `architecture.md`, `context.md`,
  `epic.md`, `pert-chart.md`, `prd.md`, `retrospective.md`,
  `sprint-status.yaml`, `story.md`, `tech-stack.md`, `ux-design-spec.md`) —
  *Derived — substantially modified.*
  BMAD has corresponding templates in `bmm/`: `prd-template.md`,
  `architecture-decision-template.md`, `epics-template.md`, `template.md`
  (story), `project-context-template.md`, `ux-design-template.md`,
  `readiness-report-template.md`. coldpress-os's versions share structural DNA
  with these and were shaped heavily by them, then reformatted (YAML
  frontmatter, `sacred: true` flags, placeholder conventions) for
  coldpress-os use. `pert-chart.md` and `sprint-status.yaml` are
  coldpress-os-original (tied to the orchestrator).

- **`templates/design/`** (~40 files: `00-design-system.template.md`,
  `00-trigger-map.template.md`, `persona-document.template.md`,
  `stitch-prompt.template.md`, `visual-direction.template.md`,
  `wds4-delivery-templates.md`, `wds8-delivery-templates.md`, etc.) —
  *Derived — substantially modified.*
  **Primary upstream: WDS (Whiteport Design System)**, © Mårten Angner /
  Whiteport Collective — a BMAD module (bundled in BMAD v6.2.2 via PR #1281)
  whose workflows `wds-0` through `wds-8` (project-setup, project-brief,
  trigger-mapping, scenarios, ux-design, agentic-development, asset-generation,
  design-system, product-evolution) account for the `wds4-`/`wds8-` prefixes,
  trigger-map, scenario, page-specification, design-delivery, and handoff
  templates here. `stitch-prompt.template.md` also originates in WDS
  (referenced in `wds/data/presentations/freya-workflows-guide.md` — Freya was
  Lyla's pre-rename name). **Secondary upstream: BMAD-core**, via the
  `bmad-create-ux-design` skill, whose step files cover design-system,
  inspiration, UX patterns, and component strategy with some overlap.
  coldpress-os's versions were reformatted and extended for the
  orchestrator/sacred-docs model.

- **`templates/contracts/`** (`contract.template.md`, `pitch.template.md`,
  `service-agreement.template.md`) — *Original — ColdPress Labs.*
  Business/legal templates. No BMAD precedent.

- **`templates/infrastructure/`** (`CLAUDE.md`, `SYSTEM.md`, `agent.md`,
  `cursorrules.md`, `skill.md`, `workflow.md`) — *Inspired — conceptual only.*
  These are templates for *authoring* coldpress-os primitives. The shapes
  (agent / skill / workflow) follow BMAD's conventions but the template files
  themselves are originally authored.

### `install/`

- **`install/generate-wrappers.md`, `template/`** — *Original
  — ColdPress Labs.*
  The thin-wrapper model (where consuming projects get a `.claude/skills/`
  wrapper pointing into the `coldpress-os/` submodule) has no BMAD equivalent.
  BMAD installs via its own installer into per-project directories; this is a
  different distribution strategy.

### `docs/`

- **`architecture.md`, `decision-trees.md`, `example-walkthrough.md`,
  `flow-map.md`, `glossary.md`, `quick-start.md`, `stack-pack-guide.md`,
  `step-file-spec.md`, `subagent-customization.md`, `troubleshooting.md`** —
  *Original — ColdPress Labs.*
  Framework documentation written specifically for coldpress-os. Inevitably
  references BMAD concepts but the text is new. `step-file-spec.md`
  documents coldpress-os's conventions, which overlap with BMAD's but are
  not a port.

### `data/`

- **`data/methods/brainstorming-techniques.csv`** — *Derived — close port.*
  Byte-identical (on the rows sampled) to BMAD's
  `core/bmad-brainstorming/brain-methods.csv`.

- **`data/methods/`** other CSVs (`design-thinking-methods.csv`,
  `elicitation-methods.csv`, `innovation-frameworks.csv`,
  `problem-solving-methods.csv`, `story-types.csv`) — *Derived — close port
  (assumed).* These follow the same pattern as the brainstorming CSV and very
  likely originate in BMAD or its referenced data assets. Assumed derived
  pending explicit row-level diff. (Note: the MEMORY index notes
  "~80% repurposable" content from BMAD/MAO, consistent with this assumption.)

- **`data/agents/agent-roster.csv`, `data/agents/skill-catalog.csv`** —
  *Original — ColdPress Labs.*
  The roster of 9 coldpress-os subagents and the catalog of coldpress-os
  skills; authored for this framework.

- **`data/classification/`** (`documentation-requirements.csv`,
  `domain-complexity.csv`, `project-types.csv`) — *Original — ColdPress Labs.*
  Classification taxonomies used by `coldpress.yaml`; no BMAD equivalent
  found.

- **`data/ci-cd/`** (`azure-pipelines.yaml`, `github-actions.yaml`,
  `gitlab-ci.yaml`, `harness-pipeline.yaml`) — *Original — ColdPress Labs.*
  CI/CD scaffolding templates for `ci-cd-setup`; no BMAD equivalent.

- **`data/testing/`** (`curriculum.yaml`, `quiz-questions.yaml`,
  `role-paths.yaml`, `session-content-map.yaml`, `tea-index.csv`) —
  *Original — ColdPress Labs.*
  Supports `teach-me-testing` and related testing skills; no BMAD equivalent
  found.

### Top-level / Root

- **`coldpress.yaml`** — *Original — ColdPress Labs.* Project configuration
  shape specific to coldpress-os (pattern A/B/C/D classification, stack-pack
  binding, sacred-docs locations, etc.).
- **`README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `REGISTRY.md`** —
  *Original — ColdPress Labs.*
- **`LICENSE`** — MIT boilerplate; holds both © BMad Code, LLC and © ColdPress
  Labs copyrights.
- **`NOTICE.md`** — *Original — ColdPress Labs.* Records the BMAD attribution.

---

## BMAD Artefacts Deliberately Not Ported

The following BMAD components are visible in `_bmad/` but have no counterpart
in coldpress-os. These were intentional omissions rather than oversights:

- **`_bmad/_config/`** — BMAD's installer manifest system
  (`agent-manifest.csv`, `files-manifest.csv`, `skill-manifest.csv`,
  `manifest.yaml`, `bmad-help.csv`, per-IDE configs under `ides/`). coldpress-os
  replaces this with its own `REGISTRY.md` + thin-wrapper install flow.
- **`_bmad/_config/ides/`** — Per-IDE rule files (cursor, windsurf, etc.).
  coldpress-os targets Claude Code first; other IDE adapters are a future
  concern, not a port.
- **`_bmad/bmm/config.yaml`, `_bmad/core/config.yaml`, `module-help.csv`** —
  BMAD's module configuration. coldpress-os's `coldpress.yaml` plays this
  role in a different shape.
- **`bmad-help`** skill (`_bmad/core/bmad-help/`) — BMAD's built-in help
  system. coldpress-os exposes help via `docs/` and the subagent system.
- **`bmad-init`** skill (`_bmad/core/bmad-init/`) — BMAD's project init.
  coldpress-os replaces this with its own `install/` flow and `project-init`
  lifecycle skill.
- **`bmad-edit-prd`, `bmad-validate-prd`** — BMAD has separate edit and
  validate skills for PRD. coldpress-os folds editing into the sacred-docs
  change workflow and keeps `validate-prd` as its own skill.
- **`bmad-create-story`** (distinct from `bmad-dev-story`) — BMAD's story
  creation skill. coldpress-os has `create-stories` which is a substantial
  rewrite for its epic/story breakdown model.
- **`bmad-agent-*` consolidated persona files** (e.g.
  `bmad-agent-analyst`, `bmad-agent-pm`, `bmad-agent-architect`,
  `bmad-agent-quick-flow-solo-dev`) — coldpress-os replaces these with the
  Claude Code-native subagent definitions (9 canonical agents), so the
  BMAD-shaped persona skill wrappers are not carried forward.
- **`bmad-sprint-retrospect`** (separate from `bmad-retrospective`) — BMAD
  has two related retro skills; coldpress-os consolidates to one
  `retrospective`.

---

## Known Uncertainties

- **`data/methods/` CSVs** other than brainstorming — We have confirmed the
  brainstorming CSV as a byte-level port. The other method CSVs are very
  likely from BMAD or BMAD's data sources; a row-level diff would confirm.
- **`skills/reviews/code-audit`** — No clear BMAD counterpart was found by
  name; it may be an original or a rename of `bmad-code-review`. Marked
  uncertain.

Corrections are welcome via `skills/meta/propose-change` or GitHub issues on
the coldpress-os repository.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.4 | 2026-04-23 | Cadbury-hq | Added Graphify v4 as fourth upstream — vendored verbatim into `graph/vendor/graphify/` as part of Wave 3 Block M (§3.1 + §3.2). Upstream MIT. Summary Table gains a row for the vendored tree with what-was-kept + what-was-stripped notes. Schema reshape / Butler integration land in subsequent Wave 3 blocks; this revision records the as-of-vendor state. |
| 1.3 | 2026-04-15 | Alfred | Three-upstream reclassification: CIS (Creative Intelligence Suite) and WDS (Whiteport Design System) now credited distinctly from BMAD-core, matching the `origin:` frontmatter on legacy personas and the final NOTICE.md. Summary table gains an Upstream column. `skills/creative/` retagged as CIS-origin; `templates/design/` reclassified with WDS as the primary upstream. Purpose and Method sections rewritten around three upstreams. |
| 1.2 | 2026-04-15 | Alfred | Legacy persona archive moved out of framework repo to `hq-p001-coldpress-os/legacy/agents-archive/`. Summary table and `agents/` section updated to reference new location and cite per-file `origin:` frontmatter as authoritative provenance record. |
| 1.1 | 2026-04-15 | Cadbury-hq | Resolved `templates/design/` attribution to *Derived — substantially modified*. Confirmed both upstreams (`bmad-create-ux-design` skill and BMAD `wds` module v6.2.2) are BMAD; removed from Known Uncertainties. |
| 1.0 | 2026-04-15 | Alfred | Initial attribution audit |
