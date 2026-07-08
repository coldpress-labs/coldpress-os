# coldpress-os

[![npm](https://img.shields.io/npm/v/@coldpress/core?color=blue)](https://www.npmjs.com/package/@coldpress/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](./CONTRIBUTING.md#project-status)
[![Built on: BMAD-METHOD](https://img.shields.io/badge/built%20on-BMAD--METHOD-purple.svg)](https://github.com/bmad-code-org/BMAD-METHOD)
[![Made by: ColdPress Labs](https://img.shields.io/badge/made%20by-ColdPress%20Labs-black.svg)](https://coldpressai.com)

> An AI-native development framework that drives the full lifecycle of AI-assisted software projects — from bootstrap to deployment to evolution.

**coldpress-os is Agent Skills-compatible and implements the Spec → Plan → Implement → Review spine, expanded to 11 phases (Shape A — v0.3.0) with sacred-doc governance, multi-agent orchestration, and the forward-carry quartet.**

The 11 phases: Bootstrap · Discovery · Tech Stack · Planning · **Design** · **Architecture** · Breakdown · Implementation · Deployment · Operate · Evolve. (Phases 5 & 6 added in v0.3.0-alpha — see [CHANGELOG](CHANGELOG.md#030-alpha--2026-05-03).)

**One framework. One format. Two runtimes. Pluggable stack packs.**

---

## Install

```bash
npm install -g @coldpress/core
```

Requires Node.js `>=22` and Claude Code (the CLI or the Agent SDK) on your machine. No Python is needed for the core framework. (Optional document-ingest and brownfield code-indexing capabilities install their own external tools on demand — see the brownfield capability pack — but the core lifecycle has no Python dependency.)

## Quick Start

```bash
coldpress init my-project
cd my-project
claude   # or: use the Agent SDK
```

`coldpress init` prompts you for a project name, slug, and user name, then scaffolds:

- `coldpress.yaml` — project configuration (Phase-1 fields only; later phases write back as you progress)
- `CLAUDE.md` — framework routing for Butler (your main Claude Code session)
- `.claude/agents/` — 8 subagent definitions (analyst, architect, pm, ux-designer, developer, verifier, devops, reviewer)
- `.claude/settings.json` — auto-enables the coldpress skill **plugin** (a local directory marketplace); the plugin ships the full skill library, so there are no per-skill wrappers to generate
- `_context/` — produced artefacts (planning, design, implementation, testing, tracking, handoffs, audit, sacred docs)
- `_input/` — raw inputs, legacy refs, vendor drops, assets
- `secure/` — credential manifest + pre-commit secret-scan hook
- `coldpress-os/` — framework files (read-only; upgraded via `coldpress update`)
- `AGENTS.md` + `.cursor/rules/` + `.roomodes` + `.openhands/microagents/` + `.clinerules/` — interop outputs so the project feels native in any agent tool

**New to coldpress-os?** Read the [First 10 Minutes](docs/quick-start.md) or see the [TaskPulse example](docs/example-walkthrough.md) for a full lifecycle demo.

## Runtime compatibility

coldpress-os's `.claude/` tree loads unchanged under both runtimes:

- **Claude Code CLI** (interactive dev-time) — `claude` in the project directory.
- **`@anthropic-ai/claude-agent-sdk`** (programmatic / CI pipelines) — import the SDK, point it at the project; all subagents and skills resolve.

See `test/agent-sdk-compat.test.ts` for the compatibility smoke test.

## Commands

```
# Everyday
coldpress init [project-name]     Scaffold a new project
coldpress doctor                  Verify the local environment (Node, git, Claude Code CLI)
coldpress update                  Regenerate interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline)
coldpress dashboard               Start the localhost project dashboard

# Lifecycle
coldpress gate check|enter        Evaluate a phase's exit gate / stamp phase entry
coldpress waves                   Compute implementation waves from the story graph
coldpress trace <verb> [id]       Traceability queries over schema'd artefacts
coldpress tokens build|contrast   Design-token build + WCAG 2.1 AA contrast validation
coldpress outcomes check          Validate outcome contracts (P4 gate)
coldpress verdict record          Record a clean-room verifier verdict
coldpress evals                   Run headless golden-task evals
coldpress evolve                  Aggregate run-logs into failure/cost leaderboards
coldpress security aggregate      Merge scanner results into the security gate
coldpress run list|inspect        Inspect recorded orchestration runs
coldpress wiring check            Verify the cross-phase artefact manifest

# Misc
coldpress import bmad <dir>       One-way BMAD module import
coldpress lane-upgrade            Upgrade a lite-lane project to the full lane
coldpress feedback                Open GitHub Issues in your browser
coldpress --version | --help      Version / full command reference
```

## Lifecycle phases (Shape A — v0.3.0-alpha)

11 phases, structured as **Spec → Plan → Implement → Review** expanded with the forward-carry quartet and a silent-divergence guard at the Design → Architecture boundary.

| Phase | Name | Owner | Purpose |
|-------|------|-------|---------|
| 1 | **Bootstrap** | butler | Project init, intake, graph-prime, working-mode detection |
| 2 | **Discovery** | @analyst | Research, personas, context, idea validation, product brief |
| 3 | **Tech Stack** | @architect | Stack discovery, evaluation rubric, locking, env provisioning |
| 4 | **Planning** | @pm | PRD authoring + section-scoped re-validation (PRD-only post-split) |
| 5 | **Design** *(new)* | @ux-designer | UX spec, brand guidelines, prototype, narrative, design-deltas |
| 6 | **Architecture** *(new)* | @architect | Sacred architecture.md + ADRs incl. REQUIRED ADRs for flagged design-deltas (silent-divergence guard) |
| 7 | **Breakdown** | @pm | Epics, story-slice (contracts keyed to architecture), story-graph → computed waves (`coldpress waves`) |
| 8 | **Implementation** | @developer + @verifier | Dev-story (plan mode), clean-room verification vs spec + tokens, wave orchestration |
| 9 | **Deployment** | @devops | Readiness hard-checklist (SBOM, headers, budgets, license), deploy packs (staging → human-gated prod) |
| 10 | **Operate** | @devops | Sprint status, correct-course, incident-response, ops-deltas |
| 11 | **Evolve** *(final)* | @reviewer | Retrospective, product evolution, innovation strategy → next-iteration Phase 1 |

**Forward-carry quartet** — `design-deltas` (P5 exit) · `architecture-deltas` (P7 entry) · `implementation-deltas` (P11 retrospective) · `ops-deltas` (P11 retrospective). Each delta resolves via four reconciliation options: `accept_into_prd`, `reject`, `flag_for_architecture_ADR`, `park_for_phase_11`.

## Subagents

**8 subagents + Butler.** Butler is your main Claude Code session (not a file); it dispatches the 8 specialists, each with its own context window, tool allowlist, and model.

Model routing is deliberate: the highest-leverage reasoning roles — planning, architecture, clean-room verification, and the evidence-linked retrospective — default to the most capable model (Opus), while high-throughput execution roles default to the fast frontier model (Sonnet) so a full lifecycle stays affordable. The verifier deliberately outranks the developer it checks. Every default is a one-line frontmatter override per project — see [Subagent customization](docs/subagent-customization.md).

| Slug | Default model | Primary phases | Role |
|------|-------|----------------|------|
| `analyst` | sonnet | 2 | Research, personas, idea validation (against explicit kill criteria), product brief with outcome metrics |
| `architect` | opus | 3, 6 | Stack + deploy lock, walking skeleton (P3); sacred architecture + ADRs, three-way keyed, silent-divergence guard (P6) |
| `pm` | opus | 4, 7 | Slice-able PRD (P4); story-graph breakdown — owns/produces/consumes + estimates → `coldpress waves` (P7) |
| `ux-designer` | sonnet | 5 | tokens.json, styleguide + live `/styleguide` route, ux-spec keyed to requirements, perf/a11y budgets |
| `developer` | sonnet | 8 | Implementation one story at a time in plan mode, red stubs → green within the packet boundary. Does **not** self-verify |
| `verifier` | opus | 8 (Butler-dispatched only) | **Clean-room** verification vs spec + tokens — dispatched only by Butler with spec + acceptance + diff, never the developer's reasoning. Read-only. **Replaces the old `@qa`** |
| `devops` | sonnet | 9, 10 | Readiness (SBOM/headers/budgets), staging → human-gated prod via the deploy pack (P9); steady-state ops digests (P10) |
| `reviewer` | opus | 11 | Evidence-linked retrospective — every claim cites a run-log event ID (final phase) |

Each subagent's definition lives at `.claude/agents/<slug>.md` in your scaffolded project.

> **v0.4 roster surgery:** `@qa` → `@verifier` (structurally independent, Butler-only dispatch); `@scrum-master` (wave planning → `@pm` + `coldpress waves`), `@communicator` (→ forkable creative skills), and `@valet` (→ the framework-internal loop) were removed.

## Key concepts

- **Subagents** are real Claude Code agents with independent context windows, tools, and models. Butler (your main session) dispatches them via the Agent tool. Not prompt-persona costume changes.
- **Skills** are the atomic unit of work. Each is self-contained with frontmatter + step-files + references.
- **Stack packs** are pluggable skill sets for specific technology stacks. Six ship in-tree at v0.3.0-alpha: `vibe-coder-fullstack` (Convex + Next.js + Clerk), `cli-npm-publishable` (TypeScript + tsup + Vitest), `browser-extension` (WXT + Manifest V3), `static-single-page`, `static-multipage-blog` (Astro variants), and `seo-pack` (cross-archetype audit/content/local/schema/technical). Activated via `stack_pack:` in `coldpress.yaml` after Phase-3 stack-locking.
- **Sacred documents** — `_context/sacred/{context,tech-stack,prd,architecture}.md` — are protected by governance change workflows and the `sacred-guard` hook. (The full lane uses this five-doc-minus-one set; the **lite lane** — the default — uses a single `spec.md`.)
- **`_context/` vs `_input/`** — produced artefacts vs material fed into the project. Inputs are not written by any skill.

## Architecture

```
@coldpress/core/
├── src/              # CLI + generators + enforcement hooks + trace/waves/evals (TypeScript)
├── template/         # Scaffolded into consumer projects (8-subagent set + plugin auto-enable)
├── lifecycle/        # 11-phase Shape A + lite-lane skill organisation
├── skills/           # atomic reusable skills + 6 stack packs
├── agents/           # Subagent schema + registry
├── schemas/          # JSON / Zod schemas (sacred docs, handoffs, audit, design, deploy, evals)
├── governance/       # Sacred-doc change workflows + 4 reconciliation options
├── data/             # Portable knowledge assets (CSV/YAML method playbook, profiles, deploy packs, taxonomy)
├── templates/        # Document / design / infrastructure / prompt-snippet templates
├── plugin/           # Claude Code plugin marketplace tree (141 spec-compliant SKILL.md)
└── docs/             # Framework documentation
```

## Claude Code plugin marketplace

```
/plugin marketplace add coldpress-labs/coldpress-os
/plugin install @coldpress/core
```

Installs the full skill library as an Agent Skills–compliant plugin. Source lives under `plugin/skills/`, regenerated by `npm run build:skills` from the rich internal SKILL.md corpus.

## Updating

```bash
npm update -g @coldpress/core   # pull the latest release
```

Inside an existing project:

```bash
coldpress update   # regenerate AGENTS.md / Cursor / Roo / OpenHands / Cline outputs
```

## How it relates to other tools

- **[Anthropic Agent Skills](https://agentskills.io/specification)** — *compatible + complementary.* Coldpress-os's skills conform to the Agent Skills SKILL.md spec (emitted to `plugin/skills/`). Installable as a Claude Code plugin via `/plugin marketplace add coldpress-labs/coldpress-os`. We wrap Anthropic's first-party skills where they overlap with ours (`docx` / `pdf` / `pptx` / `xlsx` under the forkable creative/export skills, `webapp-testing` under `@verifier`, `mcp-builder` under `@architect`). See [`docs/agent-skills-compatibility.md`](docs/agent-skills-compatibility.md).
- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** — *lineage.* Coldpress-os is a soft-fork of BMAD v6.2.2 (pinned upstream, no rebase — cherry-pick only). Full attribution in [`NOTICE.md`](./NOTICE.md).
- **GitHub Copilot Workspace** — *shared spine, richer expansion.* Both implement Spec → Plan → Implement → Review. Coldpress-os expands the 4-stage spine into 11 phases (Shape A) with sacred-doc governance and typed inter-phase handoffs. See [`docs/spec-plan-implement-review-mapping.md`](docs/spec-plan-implement-review-mapping.md).
- **[Graphify](https://github.com/safishamsi/graphify)** — *optional external backend (lineage).* Formerly vendored as the indexer + retrieval core; retired from the core in v0.4. Retrieval/traceability is now the native `coldpress trace`, and AST code-indexing is an optional brownfield-pack capability that can call Graphify (or an equivalent) as an on-demand external install — never re-vendored. See [`NOTICE.md`](./NOTICE.md) §4.

## Documentation

| Guide | Description |
|-------|-------------|
| [First 10 Minutes](docs/quick-start.md) | Hands-on setup walkthrough — zero to a running project |
| [Example Walkthrough](docs/example-walkthrough.md) | Full lifecycle demo with a sample project (TaskPulse) |
| [Troubleshooting & FAQ](docs/troubleshooting.md) | Common issues and solutions |
| [Architecture](docs/architecture.md) | Internal technical reference |
| [Spec → Plan → Implement → Review mapping](docs/spec-plan-implement-review-mapping.md) | 11-phase Shape A lifecycle grouped under the industry-standard spine |
| [Agent Skills compatibility](docs/agent-skills-compatibility.md) | How coldpress-os fits the Anthropic Agent Skills ecosystem |
| [Template Registry](TEMPLATES-REGISTRY.md) | Every template — by category, phase, consuming skill |
| [Skill Discovery Index](docs/skill-index.md) | Every skill grouped by phase + cross-cutting utilities |
| [Subagent × Phase Matrix](docs/subagent-phase-matrix.md) | 8-subagent × 11-phase reference — which subagents do what in which phases |
| [Phase → Subfolder Mapping](docs/phase-subfolder-mapping.md) | Canonical `_context/*` destinations per phase |
| [`coldpress.yaml` schema](docs/coldpress-yaml-schema.md) | Per-field phase ownership + write-back contract |
| [Interop generator](docs/interop-generator.md) | AGENTS.md, Cursor, Roo, OpenHands, Cline — spec + tool translation |
| [SKILL.md generator spec](docs/skill-md-generator-spec.md) | Agent Skills spec compliance + field mapping |
| [Anthropic skill wrapping](docs/anthropic-skill-wrapping-audit.md) | Where coldpress-os delegates to Anthropic's first-party skills |
| [Secure pattern](docs/secure-pattern.md) | `secure/manifest.yaml` + credential loader pattern |
| [Decision trees](docs/decision-trees.md) | How Butler routes your intent to skills |
| [Flow map](docs/flow-map.md) | Visual mapping of phases, skills, and subagents |
| [Glossary](docs/glossary.md) | Defined terms |
| [Stack pack guide](docs/stack-pack-guide.md) | Authoring a new technology stack pack |
| [Subagent customization](docs/subagent-customization.md) | Modes, overrides, custom agents |
| [Step-file spec](docs/step-file-spec.md) | Format specification for workflow step files |

## Contributing

Feedback flows from projects to coldpress-os via GitHub Issues and PRs. Use `coldpress feedback` to open the issue form in your browser. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community standards.

**Security:** please do **not** open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md) for private disclosure.

## Acknowledgments

coldpress-os stands on the shoulders of four open-source projects, each of which contributed substantial ideas, code, and craft. All are MIT-licensed, and all are credited in full in [NOTICE.md](./NOTICE.md) and [docs/attribution-audit.md](./docs/attribution-audit.md).

- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** by [BMad Code, LLC](https://github.com/bmad-code-org) — the core agent-skill-workflow architecture, document templates, and most utility and review skills. coldpress-os is a direct derivative of BMAD v6.2.2; this framework would not exist in its current form without theirs.
- **[Creative Intelligence Suite (CIS)](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite)** by BMad Code, LLC — contributes the brainstorming, design-thinking, problem-solving, innovation-strategy, and storytelling workflows used across Discovery and Planning.
- **[BMAD-METHOD-WDS (Whiteport Design System)](https://github.com/whiteport-collective/BMAD-METHOD-WDS)** by [Mårten Angner](https://angner.com) / [Whiteport Collective](https://whiteport.com) — contributes the opinionated UX design workflow (wds-0 through wds-8), design templates, trigger maps, and scenario-driven design methodology powering the `ux-designer` subagent.
- **[Graphify](https://github.com/safishamsi/graphify)** by [Safi Shamsi](https://github.com/safishamsi) — the original indexer + retrieval core behind coldpress-os's knowledge graph. Graphify was vendored through v0.3 and **retired from the core in v0.4**: retrieval/traceability is now the native `coldpress trace`, and tree-sitter AST code-indexing is an optional brownfield-pack capability that can call Graphify (or an equivalent) as an on-demand external install — never re-vendored. See [`NOTICE.md`](./NOTICE.md) §4.

"BMad", "BMad Method", "BMad Core", "Whiteport", and "Whiteport Design System" are trademarks of their respective owners. coldpress-os is an independent project and is not affiliated with or endorsed by any of the above.

## License

MIT — see [LICENSE](./LICENSE).

---

**Built by ColdPress Labs.** Built with intention. Scaled with purpose.
