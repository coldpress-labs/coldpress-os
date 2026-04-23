# coldpress-os

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Status: pre-alpha](https://img.shields.io/badge/status-pre--alpha-orange.svg)](./CONTRIBUTING.md#project-status)
[![Version: 0.1.0-alpha](https://img.shields.io/badge/version-0.1.0--alpha-blue.svg)](./README.md)
[![Built on: BMAD-METHOD](https://img.shields.io/badge/built%20on-BMAD--METHOD-purple.svg)](https://github.com/bmad-code-org/BMAD-METHOD)
[![Made by: ColdPress Labs](https://img.shields.io/badge/made%20by-ColdPress%20Labs-black.svg)](https://coldpressai.com)

> An AI-native development framework that drives the full lifecycle of ColdPress Labs projects — from bootstrap to deployment to evolution.

**One framework. One format. One registry. Pluggable stack packs.**

---

## What is coldpress-os?

coldpress-os is a project-agnostic, end-to-end development framework designed for AI-assisted workflows. It organizes the entire software development lifecycle into 8 phases, powered by 9 specialized subagents and 65+ atomic skills.

It is consumed by projects as a **read-only git submodule**. Projects override and extend via their own `.claude/` wrappers and `coldpress.yaml` config.

## Quick Start

```bash
# In your project's devSandbox repo:
git submodule add https://github.com/coldpress-labs/coldpress-os.git coldpress-os

# Then tell Claude:
# "Run coldpress-os init"
```

The init skill scaffolds your project with:
- `.claude/` thin wrappers pointing to coldpress-os skills
- `coldpress.yaml` project configuration
- `_context/` artifact directories
- `CLAUDE.md` with framework routing instructions

**New to coldpress-os?** Read the [First 10 Minutes](docs/quick-start.md) guide for a hands-on walkthrough, or see the [TaskPulse Example](docs/example-walkthrough.md) for a full lifecycle demo.

## Architecture

```
coldpress-os/
├── lifecycle/          # 8-phase project lifecycle
├── agents/             # 9 subagent definitions (v2 format)
├── skills/             # 65+ atomic reusable skills
├── orchestrator/       # Generalized parallelization engine
├── governance/         # Sacred document protection & change workflows
├── data/               # Portable knowledge assets (CSV/YAML)
├── templates/          # Document, design, & infrastructure templates
├── install/            # Project scaffolding & init
├── docs/               # Internal documentation
├── REGISTRY.md         # Auto-generated skill/agent/phase registry
└── coldpress.yaml      # Default config template
```

## Lifecycle Phases

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

## Key Concepts

- **Subagents** are real Claude Code agents with independent context windows, mapped to lifecycle phases. Butler dispatches them via the Agent tool.
- **Skills** are the atomic unit of work. Each is self-contained with step-files and references.
- **Stack packs** are pluggable skill sets for specific technology stacks (Convex, Supabase, etc.).
- **Sacred documents** (context.md, tech-stack.md, architecture.md, PRD, PERT) are protected by governance change workflows.
- **The orchestrator** generalizes the parallelization pattern (DAG → waves → gates) across all lifecycle phases.

## How Projects Use coldpress-os

```
my-project/
├── coldpress-os/           # git submodule (READ-ONLY)
├── .claude/                # Generated thin wrappers
│   └── skills/             # 3-line wrappers → coldpress-os skills
├── docs/                   # Project-specific content
├── _context/                # Project artifacts
├── coldpress.yaml          # Project config
└── CLAUDE.md               # Framework routing for Claude
```

**Separation:** The framework is read-only. Project-specific content lives outside the submodule. Planning and orchestration never ship with the product.

## Updating

```bash
git submodule update --remote coldpress-os
# Then tell Claude: "Regenerate skill wrappers"
git add coldpress-os .claude/ && git commit -m "update coldpress-os"
```

## Documentation

| Guide | Description |
|-------|-------------|
| [First 10 Minutes](docs/quick-start.md) | Hands-on setup walkthrough — zero to running project |
| [Example Walkthrough](docs/example-walkthrough.md) | Full lifecycle demo with a sample project (TaskPulse) |
| [Troubleshooting & FAQ](docs/troubleshooting.md) | Common issues and solutions |
| [Architecture](docs/architecture.md) | Internal technical reference |
| [Decision Trees](docs/decision-trees.md) | How Butler routes your intent to skills |
| [Flow Map](docs/flow-map.md) | Visual mapping of phases, skills, and subagents |
| [Glossary](docs/glossary.md) | 34 defined terms |
| [Stack Pack Guide](docs/stack-pack-guide.md) | How to author a new technology stack pack |
| [Subagent Customization](docs/subagent-customization.md) | Modes, overrides, and custom agents |
| [Step-File Spec](docs/step-file-spec.md) | Format specification for workflow step files |

## Contributing

Feedback flows from projects to coldpress-os via GitHub Issues/PRs. Use the `meta/propose-change` skill to formalize improvements. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community standards.

**Security:** please do **not** open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md) for private disclosure instructions.

## Acknowledgments

coldpress-os stands on the shoulders of three open-source projects, each of which contributed substantial ideas, code, and craft. All are MIT-licensed, and all are credited in full in [NOTICE.md](./NOTICE.md) and [docs/attribution-audit.md](./docs/attribution-audit.md).

- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** by [BMad Code, LLC](https://github.com/bmad-code-org) — the core agent-skill-workflow architecture, document templates, and most utility and review skills. coldpress-os is a direct derivative of BMAD v6.2.2; this framework would not exist in its current form without theirs.
- **[Creative Intelligence Suite (CIS)](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite)** by BMad Code, LLC — a BMAD module that contributes the brainstorming, design-thinking, problem-solving, innovation-strategy, and storytelling workflows used across Discovery and Planning phases.
- **[BMAD-METHOD-WDS (Whiteport Design System)](https://github.com/whiteport-collective/BMAD-METHOD-WDS)** by [Mårten Angner](https://angner.com) / [Whiteport Collective](https://whiteport.com) — a BMAD module that contributes the opinionated UX design workflow (wds-0 through wds-8), design templates, trigger maps, and scenario-driven design methodology that power the `ux-designer` subagent.

"BMad", "BMad Method", "BMad Core", "Whiteport", and "Whiteport Design System" are trademarks of their respective owners. coldpress-os is an independent project and is not affiliated with or endorsed by any of the above.

## License

MIT — see [LICENSE](./LICENSE).

---

**Built by ColdPress Labs.** Built with intention. Scaled with purpose.

