# Third-Party Attributions

coldpress-os builds on the work of the open-source community. This document
acknowledges the projects that coldpress-os is derived from or incorporates,
and records the nature of the derivation for each.

**Four upstream projects** are credited below:

1. **BMAD-METHOD** — the core agent/skill/workflow architecture
2. **Creative Intelligence Suite (CIS)** — a BMAD module providing creative
   and strategic workflows
3. **BMAD-METHOD-WDS (Whiteport Design System)** — a BMAD module providing
   an opinionated UX design workflow
4. **Graphify v4** — the indexer + retrieval core behind coldpress-os's
   knowledge graph (vendored into `graph/vendor/graphify/` under the same
   MIT terms)

All four are MIT-licensed; coldpress-os is also MIT. The only obligation
is preservation of copyright and license notices, which this file and
[LICENSE](LICENSE) together satisfy.

---

## 1. BMAD-METHOD

coldpress-os is a substantial derivative work of **BMAD-METHOD**, adapted and
extended by ColdPress Labs to fit an opinionated, AI-native project lifecycle.

> **Soft-fork divergence point:** coldpress-os diverged from BMAD-METHOD **v6.2.2** in **April 2026** and is maintained as a soft fork (no upstream rebase; quarterly cherry-pick review only). See "Fork relationship" subsection below for the full stance.

| Field | Value |
|-------|-------|
| Upstream project | BMAD-METHOD (BMad Method™) |
| Upstream source | https://github.com/bmad-code-org/BMAD-METHOD |
| Upstream author | BMad Code, LLC |
| Upstream license | MIT |
| Derived from version | v6.2.2 (March 2026) |
| First incorporated | 2026-04 |
| Divergence point | 2026-04 (BMAD v6.2.2 pinned; not tracked as living fork) |

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

- An explicit **11-phase lifecycle** (Shape A — Bootstrap → Discovery → Tech Stack → Planning → Design → Architecture → Breakdown → Implementation → Deployment → Operate → Evolve) with phase-aware gates and the forward-carry quartet (design / architecture / implementation / ops deltas)
- An **11-subagent orchestration model** with dispatch routed through Butler (Pattern 7 typed agent transitions across phase boundaries)
- **Sacred-document governance** — protected artifacts with formal change workflows
- A generalized **orchestrator** (DAG → waves → human gates) applied across phases
- **Stack packs** as a pluggable extension mechanism
- An opinionated **install/init** flow and thin-wrapper `.claude/` scaffolding
- Integration with **Claude Code's native subagent system** (v2 agent format)
- **Silent-divergence guard** (Phase 5 → Phase 6 ADR enforcement) and **inter-iteration cycle** (Phase 11 → next iteration's Phase 1 entry)

### Fork relationship — soft fork, not living fork

coldpress-os is a **soft fork** of BMAD-METHOD v6.2.2: a derivative work that
diverged at a pinned upstream version and is **not tracked as a living fork**.
Structural divergence is substantial — roughly 90% of the framework structure
(subagent format, step-file spec, orchestrator, governance, phases, install
model) is original to coldpress-os, while roughly 40% of the content (templates,
review skills, personas) still traces to BMAD/CIS/WDS.

Practical consequence of the soft-fork stance:

- coldpress-os does **not** rebase against BMAD upstream.
- coldpress-os **cherry-picks** specific upstream changes when they are worth
  importing. Cadbury-hq reviews upstream release notes on a quarterly cadence
  and files issues for any change worth pulling in. Imports re-attribute in
  this NOTICE and translate to coldpress-os conventions.
- The soft-fork stance is intentionally reversible. The relationship to
  upstream will be re-examined at coldpress-os v1.0, at which point either
  a hard-fork declaration or a re-convergence effort may be warranted.

This stance does not weaken attribution, trademarks, or licence compliance —
all three remain exactly as documented in this section and in the per-section
notices below.

### Personas borrowed from BMAD

The 19 legacy personas retained at `hq-p001-coldpress-os/legacy/agents-archive/`
include 10 with `origin: bmad` in their frontmatter:

> abby, arch, atlas, blitz, cody, granger, iris, rex, vera, zane

These personas were consolidated into the 11 canonical coldpress-os subagents
(9 from the original consolidation + @reviewer + @devops as post-schema additions in v0.3.0).
They are archived for historical reference only.

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

## 4. Graphify

coldpress-os vendors **Graphify v4** into `graph/vendor/graphify/` as the
indexer + retrieval core underpinning the project-context knowledge graph
introduced in Wave 3 of Phase I. The vendored source is the canonical
upstream-to-coldpress-os diff — anyone asking "what did coldpress-os change
from Graphify?" inspects that tree.

| Field | Value |
|-------|-------|
| Upstream project | Graphify |
| Upstream source | https://github.com/safishamsi/graphify |
| Upstream author | Safi Shamsi |
| Upstream license | MIT |
| Vendored version | v4 (tree head at clone time — see `graph/vendor/graphify/CHANGELOG.md` for upstream release line) |
| Vendored at | `graph/vendor/graphify/` |
| First incorporated | 2026-04-23 (Wave 3 Block M) |

### Nature of the derivation

Graphify provides coldpress-os with:

- A tree-sitter-backed code AST indexer covering 20+ languages (Python,
  TypeScript, JavaScript, Go, Rust, Java, C/C++, Ruby, C#, Kotlin, Scala,
  PHP, Swift, Lua, Zig, PowerShell, Elixir, Objective-C, Julia, Verilog).
- Markdown / document ingestion with knowledge-graph extraction (nodes,
  edges, community detection via Leiden).
- A manifest-driven build pipeline that emits a queryable graph artifact.

coldpress-os adapts Graphify by:

- Reshaping the graph schema to coldpress-os's folder semantics —
  `_context/sacred/`, `_context/planning/`, `_input/`, `sandbox/` vs `live/`
  environment tags, and the secure-manifest exclusion rule (credential
  values are never indexed; only credential *names* from
  `secure/manifest.yaml` appear as nodes). See
  [docs/graph-schema.md](docs/graph-schema.md) when Wave 3 §3.3 lands.
- Wiring Butler and the 9 subagents to query the graph as the primary
  context substrate, replacing direct-file-read context-gathering skills.
  See Wave 3 §3.6.
- Pinning a specific upstream version — coldpress-os does not rebase
  against Graphify main; upstream changes are cherry-picked at the
  vendored tree level when worth importing.

### Soft-fork stance

Parallel to the BMAD soft-fork stance (§1), the Graphify relationship is a
**soft fork** — we diverged at a pinned upstream commit and do not track a
living fork. Divergence is expected to be heavy (schema reshape, folder-
semantic integration), which is precisely why vendoring in-tree is
preferable to tracking upstream as a submodule. The vendored tree is the
canonical diff.

### Upstream assets retained

- `graph/vendor/graphify/LICENSE` — upstream MIT licence (preserved verbatim).
- `graph/vendor/graphify/README.md` — upstream README (for context).
- `graph/vendor/graphify/ARCHITECTURE.md` — upstream architecture doc.
- `graph/vendor/graphify/CHANGELOG.md` — upstream changelog up to vendor time.
- `graph/vendor/graphify/graphify/` — the full Python package (34 modules).
- `graph/vendor/graphify/pyproject.toml` — upstream dep manifest. Consumer
  projects need Python ≥ 3.10 + `pip install -e graph/vendor/graphify`
  (or similar) to run the indexer; wiring for this install step lands in
  Wave 3 Block N.

### Upstream assets removed at vendor time

- `.git/` — replaced by our own version control.
- `docs/translations/` — 26 README translations, unnecessary for our use.
- `tests/` — upstream's own test suite; coldpress-os writes its own tests
  against the reshaped integration layer.
- `scripts/` — upstream maintenance scripts, not used by coldpress-os.

Trimmed size: 2.6 MB → 1.5 MB.

### Acknowledgment

ColdPress Labs is grateful to Safi Shamsi for building and open-sourcing
Graphify, and for the tree-sitter-powered multi-language indexing that
gives coldpress-os its semantic graph surface.

---

## License compatibility

All four upstreams (BMAD-METHOD, CIS, WDS, Graphify) are licensed under MIT.
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

