# coldpress-os

[![npm](https://img.shields.io/npm/v/@coldpress/core?color=blue)](https://www.npmjs.com/package/@coldpress/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Status: alpha](https://img.shields.io/badge/status-alpha-orange.svg)](./CONTRIBUTING.md#project-status)
[![Built on: BMAD-METHOD](https://img.shields.io/badge/built%20on-BMAD--METHOD-purple.svg)](https://github.com/bmad-code-org/BMAD-METHOD)
[![Made by: ColdPress Labs](https://img.shields.io/badge/made%20by-ColdPress%20Labs-black.svg)](https://coldpressai.com)

> An AI-native development framework that drives the full lifecycle of AI-assisted software projects — from bootstrap to deployment to evolution.

**One framework. One format. Two runtimes. Pluggable stack packs.**

---

## Install

```bash
npm install -g @coldpress/core
```

Requires Node.js `>=20` and Claude Code (the CLI or the Agent SDK) on your machine.

## Quick Start

```bash
coldpress init my-project
cd my-project
claude   # or: use the Agent SDK
```

`coldpress init` prompts you for a project name, slug, and user name, then scaffolds:

- `coldpress.yaml` — project configuration (Phase-1 fields only; later phases write back as you progress)
- `CLAUDE.md` — framework routing for Butler (your main Claude Code session)
- `.claude/agents/` — 9 subagent definitions
- `.claude/skills/` — ~66 thin wrappers pointing at canonical skills
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
coldpress init [project-name]     Scaffold a new project
coldpress update                  Regenerate interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline)
coldpress feedback                Open GitHub Issues in your browser
coldpress upgrade                 Print upgrade instructions
coldpress --version               Print installed version
```

## Lifecycle phases

| Phase | Name | Purpose |
|-------|------|---------|
| 1 | **Bootstrap** | Project init, machine setup, agent scaffold |
| 2 | **Discovery** | Research, context building, problem understanding |
| 3 | **Tech Stack** | Stack selection, evaluation, locking |
| 4 | **Planning** | Product brief, design brief, PRD, architecture, UX |
| 5 | **Breakdown** | Epics, stories, parallelization strategy, PERT |
| 6 | **Implementation** | Build, test, review, wave orchestration |
| 7 | **Deployment** | Readiness checks, security scan, deploy |
| 8 | **Evolve** | Retrospective, course correction, product evolution |

## Subagents

| Slug | Model | Primary phases | Role |
|------|-------|----------------|------|
| `analyst` | sonnet | 2, 4 | Research, interviews, brainstorming, product briefs |
| `pm` | sonnet | 4, 5 | PRD lifecycle, product decisions, epic oversight |
| `ux-designer` | sonnet | 4 | UX specs, design systems, scenarios |
| `architect` | opus | 3, 4 | Tech stack, architecture, ADRs |
| `developer` | sonnet | 6 | Implementation (standard or quick mode) |
| `qa` | sonnet | 6, 7 | Testing (rapid or strategic mode) |
| `scrum-master` | haiku | 5, 8 | Sprint planning, PERT, retrospectives |
| `communicator` | sonnet | 4, 8 | Documentation, narratives, presentations |
| `valet` | sonnet | meta | Framework evolution, meta skills |

Each subagent's definition lives at `.claude/agents/<slug>.md` in your scaffolded project.

## Key concepts

- **Subagents** are real Claude Code agents with independent context windows, tools, and models. Butler (your main session) dispatches them via the Agent tool. Not prompt-persona costume changes.
- **Skills** are the atomic unit of work. Each is self-contained with frontmatter + step-files + references.
- **Stack packs** are pluggable skill sets for specific technology stacks (Convex, Supabase, etc.). Activated via `stack_pack:` in `coldpress.yaml` after Phase-3 stack-locking.
- **Sacred documents** — `_context/sacred/{context,tech-stack,prd,architecture,pert-chart}.md` — are protected by governance change workflows in `coldpress-os/governance/`.
- **`_context/` vs `_input/`** — produced artefacts vs material fed into the project. Inputs are not written by any skill.

## Architecture

```
@coldpress/core/
├── src/              # CLI + generators (TypeScript)
├── template/         # Scaffolded into consumer projects
├── lifecycle/        # 9-phase skill organisation
├── skills/           # ~75 atomic reusable skills
├── agents/           # Subagent schema + registry
├── orchestrator/     # Parallelization engine specs
├── governance/       # Sacred-doc change workflows
├── data/             # Portable knowledge assets (CSV/YAML)
├── templates/        # Document / design / infrastructure templates
├── plugin/           # Claude Code plugin marketplace tree (build-skills output)
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

## Documentation

| Guide | Description |
|-------|-------------|
| [First 10 Minutes](docs/quick-start.md) | Hands-on setup walkthrough — zero to a running project |
| [Example Walkthrough](docs/example-walkthrough.md) | Full lifecycle demo with a sample project (TaskPulse) |
| [Troubleshooting & FAQ](docs/troubleshooting.md) | Common issues and solutions |
| [Architecture](docs/architecture.md) | Internal technical reference |
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

coldpress-os stands on the shoulders of three open-source projects, each of which contributed substantial ideas, code, and craft. All are MIT-licensed, and all are credited in full in [NOTICE.md](./NOTICE.md) and [docs/attribution-audit.md](./docs/attribution-audit.md).

- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** by [BMad Code, LLC](https://github.com/bmad-code-org) — the core agent-skill-workflow architecture, document templates, and most utility and review skills. coldpress-os is a direct derivative of BMAD v6.2.2; this framework would not exist in its current form without theirs.
- **[Creative Intelligence Suite (CIS)](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite)** by BMad Code, LLC — contributes the brainstorming, design-thinking, problem-solving, innovation-strategy, and storytelling workflows used across Discovery and Planning.
- **[BMAD-METHOD-WDS (Whiteport Design System)](https://github.com/whiteport-collective/BMAD-METHOD-WDS)** by [Mårten Angner](https://angner.com) / [Whiteport Collective](https://whiteport.com) — contributes the opinionated UX design workflow (wds-0 through wds-8), design templates, trigger maps, and scenario-driven design methodology powering the `ux-designer` subagent.

"BMad", "BMad Method", "BMad Core", "Whiteport", and "Whiteport Design System" are trademarks of their respective owners. coldpress-os is an independent project and is not affiliated with or endorsed by any of the above.

## License

MIT — see [LICENSE](./LICENSE).

---

**Built by ColdPress Labs.** Built with intention. Scaled with purpose.
