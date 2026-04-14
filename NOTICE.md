# Third-Party Attributions

coldpress-os builds on the work of the open-source community. This document
acknowledges the projects that coldpress-os is derived from or incorporates,
and records the nature of the derivation for each.

**Three upstream projects** are credited below:

1. **BMAD-METHOD** — the core agent/skill/workflow architecture
2. **Creative Intelligence Suite (CIS)** — a BMAD module providing creative
   and strategic workflows
3. **BMAD-METHOD-WDS (Whiteport Design System)** — a BMAD module providing
   an opinionated UX design workflow

All three are MIT-licensed; coldpress-os is also MIT. The only obligation
is preservation of copyright and license notices, which this file and
[LICENSE](LICENSE) together satisfy.

---

## 1. BMAD-METHOD

coldpress-os is a substantial derivative work of **BMAD-METHOD**, adapted and
extended by ColdPress Labs to fit an opinionated, AI-native project lifecycle.

| Field | Value |
|-------|-------|
| Upstream project | BMAD-METHOD (BMad Method™) |
| Upstream source | https://github.com/bmad-code-org/BMAD-METHOD |
| Upstream author | BMad Code, LLC |
| Upstream license | MIT |
| Derived from version | v6.2.2 (March 2026) |
| First incorporated | 2026-04 |

### Nature of the derivation

BMAD provided the conceptual and structural foundation for coldpress-os's
agent-skill-workflow architecture. Specifically, coldpress-os inherits and
extends:

- The **agent definition format** and dispatch model
- The **skill (task) abstraction** as the atomic unit of work
- The **workflow / step-file specification**
- Several **document and planning templates** (product brief, PRD, architecture,
  story structures)
- Core **lifecycle patterns** for planning → breakdown → implementation
- A number of **utility and review skills** (e.g., `distillator`, `shard-doc`,
  `index-docs`, `advanced-elicitation`, most code/test review skills)

coldpress-os departs from upstream BMAD in the following ways:

- An explicit **8-phase lifecycle** (Bootstrap → Evolve) with phase-aware gates
- A **9-subagent orchestration model** with dispatch routed through Butler
- **Sacred-document governance** — protected artifacts with formal change workflows
- A generalized **orchestrator** (DAG → waves → human gates) applied across phases
- **Stack packs** as a pluggable extension mechanism
- An opinionated **install/init** flow and thin-wrapper `.claude/` scaffolding
- Integration with **Claude Code's native subagent system** (v2 agent format)

### Personas borrowed from BMAD

The 19 legacy personas retained at `hq-p001-coldpress-os/legacy/agents-archive/`
include 10 with `origin: bmad` in their frontmatter:

> abby, arch, atlas, blitz, cody, granger, iris, rex, vera, zane

These personas were consolidated into the 9 canonical coldpress-os subagents
that ship with the framework. They are archived for historical reference only.

### Trademarks

"BMad", "BMad Method", and "BMad Core" are trademarks of **BMad Code, LLC**.
coldpress-os is an independent project and is **not affiliated with, endorsed
by, or sponsored by BMad Code, LLC**. Any references to BMAD in this repository
are for attribution and technical context only.

### Acknowledgment

ColdPress Labs is grateful to BMad Code, LLC and the BMAD contributor community
for releasing BMAD-METHOD under a permissive license. Their work materially
accelerated the development of coldpress-os, and this project would not exist
in its current form without theirs.

---

## 2. Creative Intelligence Suite (CIS)

coldpress-os incorporates workflows and agent personas from the **Creative
Intelligence Suite**, a BMAD module that extends BMad with structured
creativity and strategic-thinking tools.

| Field | Value |
|-------|-------|
| Upstream project | Creative Intelligence Suite (CIS) |
| Upstream source | https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite |
| Upstream author | BMad Code, LLC |
| Upstream license | MIT |
| Derived from version | bundled in BMAD v6.2.2 (March 2026) |
| First incorporated | 2026-04 |

### Nature of the derivation

CIS contributed the "fuzzy front-end" workflows that coldpress-os wires into
its Discovery and Planning phases. Specifically, coldpress-os inherits:

- The **`brainstorming`** skill (with its 150+ creative techniques)
- The **`design-thinking`** skill
- The **`innovation-strategy`** skill
- The **`problem-solving`** skill (29+ frameworks)
- The **`storytelling`** skill
- Several CIS-origin persona definitions

The brainstorming techniques CSV data at `data/methods/brainstorming-techniques.csv`
is byte-identical to the upstream CIS source; other methods CSVs derive from
the same module.

### Personas borrowed from CIS

The legacy archive includes 6 personas with `origin: cis` in their frontmatter:

> crux, iggy, kai, leni, nova, quill

These were consolidated into the coldpress-os `analyst`, `architect`, and
`communicator` subagents.

### Acknowledgment

CIS is authored by BMad Code, LLC as an official BMAD module. The same
trademark notice and acknowledgment as BMAD-METHOD (Section 1) apply.
ColdPress Labs is grateful for the creativity and craft that went into
CIS's technique libraries and method frameworks.

---

## 3. BMAD-METHOD-WDS (Whiteport Design System)

coldpress-os incorporates the UX design workflow, personas, and templates
from **BMAD-METHOD-WDS**, a BMAD module authored by Mårten Angner and the
Whiteport Collective.

| Field | Value |
|-------|-------|
| Upstream project | BMAD-METHOD-WDS (Whiteport Design System) |
| Upstream source | https://github.com/whiteport-collective/BMAD-METHOD-WDS |
| Upstream author | Mårten Angner / Whiteport Collective |
| Upstream license | MIT |
| Derived from version | bundled in BMAD v6.2.2 (March 2026, via PR #1281) |
| First incorporated | 2026-04 |

### Nature of the derivation

WDS provided the opinionated UX design workflow that coldpress-os's UX
Designer subagent runs. Specifically, coldpress-os inherits:

- The **numbered workflow structure** `wds-0` through `wds-8` (project setup,
  project brief, trigger mapping, scenarios, UX design, agentic development,
  asset generation, design system, product evolution)
- The **design template family** in `templates/design/` — including
  `00-design-system.template.md`, `00-trigger-map.template.md`,
  `00-ux-scenarios.template.md`, `stitch-prompt.template.md`, page
  specifications, scenario overviews, and design-delivery packaging
- The **`wds4-delivery-templates.md`** and **`wds8-delivery-templates.md`**
  handoff templates
- The **trigger map** and **scenario-driven design** methodology

coldpress-os adapts these to the sacred-docs model and the orchestrator-driven
phase gates, but the core design workflow is substantially WDS.

### Personas borrowed from WDS

The legacy archive includes 2 personas with `origin: wds` in their frontmatter:

> lyla, moxie

Lyla was consolidated into the coldpress-os `ux-designer` subagent; Moxie
was consolidated into the `analyst` subagent.

### Acknowledgment

ColdPress Labs is grateful to Mårten Angner and the Whiteport Collective
for 25+ years of UX/CX craft distilled into WDS, and for releasing it as
open source. The `ux-designer` subagent's capabilities are, to a significant
degree, WDS's capabilities.

### Trademarks

"Whiteport" and "Whiteport Design System" are used or registered marks of
Mårten Angner / Whiteport Collective. coldpress-os is **not affiliated with,
endorsed by, or sponsored by** Mårten Angner or Whiteport Collective; the
references here are for attribution only.

---

## License compatibility

All three upstreams (BMAD-METHOD, CIS, WDS) are licensed under MIT.
coldpress-os is also licensed under MIT (see [LICENSE](LICENSE)). The licenses
are identical in substance; the only addition in this repository is the
preservation of the respective copyright notices alongside ColdPress Labs'.

Users of coldpress-os are granted all rights under MIT with respect to all
copyright holders listed.

---

## File-level audit

For a file-by-file classification of which artifacts came from which upstream
(or are original to ColdPress Labs), see
[docs/attribution-audit.md](docs/attribution-audit.md).

