# Changelog

All notable changes to coldpress-os are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) from v1.0 onward. Pre-1.0 minors may contain breaking changes — the changelog calls them out explicitly.

---

## [Unreleased]

### WS11 "Structure & Diet" — structure-hygiene audit remediation

- **Internal overhaul workspace no longer ships (S2)** — `docs/overhaul/` (the
  execution ledger + working notes) was shipping in the npm tarball and being
  copied into every scaffolded project. Excluded it from both `package.json`
  `files:` (`!docs/overhaul`) and the `coldpress init` framework-copy, so client
  projects and the published package no longer carry the framework's internal
  work-tracking state.
- **Framework repo has a directive at last (S3.6-1)** — added
  `coldpress-os/CLAUDE.md`, the framework repo's first-ever `CLAUDE.md`. Framework
  sessions previously inherited the Project-root (Andy) directive and contributors
  got none. It defines Butler-the-maintainer with explicit scope boundaries vs the
  Project-root agent and vs consumer-Butler (`template/CLAUDE.md`), the 8-agent
  roster, the 4 sacred docs, the command surface, the green-bar dev workflow, and
  the no-tag/publish gate. Framework-repo-only — not shipped in the npm package,
  not scaffolded into consumer projects.

- **Recovered 3 silently-dropped stack-pack quickstarts (S1.3)** — the
  `cli-npm-publishable`, `vibe-coder-fullstack`, `static-single-page`, and
  `static-multipage-blog` quickstart skills all declared `name: quickstart`, so
  first-wins dedup emitted only one and dropped the other three from the plugin.
  Renamed each to `<pack>-quickstart` (matching `browser-extension-quickstart`);
  the plugin now emits 146 skills (was 143). `pack.yaml` references these by path,
  so no routing changed. Added a `name-parent-mismatch` allow-list to the skill
  generator for the intentionally pack/lane-namespaced sub-skills (the four
  quickstarts, `browser-extension-*`, `seo-*`, `lite-*`), so the build is
  warning-clean while genuine accidental drift is still caught.
- **Single-sourced the version → 0.4.0-alpha (S1.4)** — `package.json`,
  `.claude-plugin/marketplace.json`, and the generated plugin manifests now all
  read `0.4.0-alpha` (was split 0.3.2 / 0.3.0 / docs-0.4.0). `coldpress --help`
  says "8 subagents" (was 11). Still unreleased — no tag/publish. (S5 will make
  the marketplace manifest generated-from-package.json so the version can't
  re-drift.)
- **Gate checks now run (S1.1)** — the eight acceptance-check verbs the phase-gate
  runner spawns (`config-check`, `validate-adrs`, `validate-pack-match`,
  `validate-yaml-block`, `validate-schema-latest`, `validate-schema`,
  `file-exists-after`, `gate-check-supersessions`) are registered on the CLI.
  Previously every block-severity `gate.json` check failed as "unknown command"
  — the check functions existed and were unit-tested but were unreachable from
  `coldpress gate check`. Also fixed the schema-path resolution so a gate.json's
  `--schema schemas/<name>` string resolves under the framework `schemas/` dir
  instead of doubling to `schemas/schemas/<name>`. A build-free source invariant
  test asserts every gate.json command verb is CLI-registered (catches the class
  for any future gate), plus an end-to-end test spawning the built CLI.
- **Lane-aware gate phase ids (S1.2)** — `coldpress gate check|enter <phase>`
  accepts a full-lane number/name (`3`, `3-tech-stack`, `1-bootstrap`) or a
  lite-lane id (`lite:spec`). Previously the CLI did `Number(phase)`, so any
  non-bare-integer form parsed to `NaN` and no gate was ever found. Unparseable
  ids get a helpful error; lite phases with no gate report an honest "no gate for
  this phase"; `gate enter` on a lite phase is a no-op (the lite lane drops phase
  sequencing).

### v0.4 "Enforcement" overhaul — post-overhaul hardening

- **Optional deploy packs** — `netlify` (Netlify CLI; `--alias` previews,
  `restoreSiteDeploy` rollback) and `self-hosted` (SSH + rsync, atomic-symlink
  releases; symlink-swap rollback) join `vercel` + `cloudflare`. The stack×deploy
  matrix regenerates to 4 packs; the deploy-pack test schema-validates every pack.
- **BMAD upstream adopts** — `validate-idea` + `proposal` gain an adversarial
  Socratic **Forge** pass (evidenced-vs-bet); a P6 **breadth-coverage** exit gate
  (every architecture dimension decided/deferred/open); incident-response postmortem
  reshaped into a **forensic case-file** (evidence register + hypotheses ledger).
- **Dependency hygiene** — `npm audit` clean to 1 low (dev-only); CI `npm audit`
  promoted to a hard gate; vitest 2 → 4.
- **PERT-schema chain excised** — `pert-chart` sacred schema + the
  `architecture-to-pert` / `pert-to-stories` handoff bridges removed (architecture →
  stories is direct via `story-slice`); `SACRED_DOC_SCHEMAS` down to 4 docs.
- **Agent routing fix** — scaffolded subagents no longer route to the removed `@qa`
  / `@scrum-master` (they now route to `@verifier` / `@pm`, matching the need-info
  router).
- **`coldpress trace release`** — the 5th trace verb: a P8→P9 release-scope preview
  (stories × requirements it satisfies × diffstat surface × verification state),
  wired into the Phase 9 `readiness` step-01.
- **`coldpress evolve` override leaderboard** — enforcement gates bypassed via
  `COLDPRESS_OVERRIDE` are now recorded as a durable `gate-override` EventStream
  event and ranked (with reasons), so a frequently-overridden gate is visible as a
  mis-designed gate.
- **quality-gate reads `testing.yaml`** — the Stop gate is now driven by the stack
  pack's enabled fast test layers (L0 static → typecheck/lint, L1 unit → test)
  rather than raw package.json script detection; heavier layers stay with the
  verifier. Falls back to script detection when no `testing.yaml` is present.
- **Removed the superseded archetype system** — `install/archetypes/`,
  `src/archetypes/load.ts`, and the archetype schema (folded into project profiles
  in WS9).

### v0.4 "Enforcement" overhaul — WS9: Profiles, proposal & harvest

Turn the framework's rigor into repeatable client delivery — start-configured by
intent, priced before signing, and improved from what ships.

#### Added

- **Project profiles** — `data/profiles/*.yaml` (6 harvested: brochure-site,
  saas-app, editorial-site, …) with a schema; an `intake` profile step preconfigures
  packs/tier/lane from a single answer, every default overridable.
- **`proposal`** (Phase 2) — a timeboxed pre-sales run of P1–P2 + a stack shortlist
  emitting a proposal pack (brief + 85%-confidence timeline + scope/price scaffold +
  assumptions register); won artifacts carry into the real project unchanged.
- **Verify-packs** — `data/verify-packs/{web,llm-app,research-spike}.yaml` +
  schema; the llm-app pack wires a product-eval gate.
- **Client-touchpoints registry** — `docs/generated/client-touchpoints.md`,
  generated + drift-checked.

### v0.4 "Enforcement" overhaul — WS8: Operate loop

Phase 10–11 made evidence-driven: steady-state ops that measure against the outcome
contract, and incidents that feed the self-improvement loop.

#### Added

- **`ops-check`** — scheduled digest (analytics/uptime/error/cert/backup/CVE) scored
  **actual-vs-target against `outcomes.yaml`**; a high+ CVE on the shipped lockfile
  **auto-creates an incident**.
- **`client-health-report`** — a monthly, outcome-trend, results-first client
  one-pager.
- **`pack-harvest`** + **`framework-feedback`** — graduate patterns from a shipped
  project back into packs / upstream framework feedback.

#### Changed

- **`incident-response`** wired into the evals loop — postmortems carry a
  failure-taxonomy tag that `coldpress evolve` counts; every incident adds a pinning
  test before its fix merges.
- **`retrospective`** rebuilt evidence-linked (every claim cites a run-log event ID),
  upgraded to opus.

### v0.4 "Enforcement" overhaul — WS7: Evals & the self-improvement loop

Close the loop: failures become a taxonomy, a headless scorer, leaderboards, and
golden tasks that guard against regression.

#### Added

- **`coldpress evals`** — a deterministic, **headless** eval runner (file-exists,
  gate-green, tests-green, grep/absent, no-secret, schema-valid) over a workspace;
  per-task pass/fail, exits non-zero on failure. Ships an 8-task golden starter set
  (`evals/`).
- **`coldpress evolve`** — failure/cost leaderboards + top-3 candidate patches from
  the EventStream.
- **Failure taxonomy** — `data/failure-taxonomy.yaml` + schema; failing eval tasks
  carry `guards_against` taxonomy tags.
- **`valet-loop`** (meta) — the loop skill that turns a recurring failure into a
  golden eval + fix.

#### Changed

- **EventStream session-boundary** enriched with `model` + token usage, so evolve's
  cost leaderboard is real.

### v0.4 "Enforcement" overhaul — WS6: Deploy packs

Make "deploy anywhere" real: uniform deploy skills over swappable, data-only packs,
with production behind a three-layer human gate.

#### Added

- **Deploy packs are data** — `data/deploy-packs/<name>/pack.yaml` (schema'd);
  reference packs **vercel** + **cloudflare**. Coupled to the P3 stack two ways
  (compatibility matrix ∩ locked stack; `stack_inputs` build config).
- **Uniform deploy skills** — `deploy-select` (P3), `deploy-staging` (model-ok),
  `deploy-prod` (human-only), `deploy-preview`, `smoke`, `rollback` — the same verbs
  ship to any pack by changing one config line.
- **`deploy-gate` hook** — a PreToolUse Skill guard: production deploy requires
  staging smoke green + P8 gate + an acceptance record.
- **`client-acceptance`** + acceptance-record schema, **`handover`** skill, and the
  generated **stack×deploy matrix**.

#### Changed

- **`readiness-check` → `readiness`** rebuilt (SBOM/headers/budgets/license);
  superseded `ops/security-scan` + `dep-health-check`.

#### Removed

- The transitional `deploy` umbrella skill (split into the uniform verbs above).

### v0.4 "Enforcement" overhaul — WS5: Skills consolidation & Claude Code alignment

The skill corpus is consolidated to a canonical set, distributed as a Claude Code
plugin, and modernised to current SKILL.md frontmatter — and the core P7–P9 loop
skills are rebuilt around the v0.4 enforcement machinery.

#### Added

- **The skill plugin is the distribution vehicle** — `coldpress init` copies a
  self-contained plugin (`coldpress-os/plugin/`, each skill bundled with its
  `steps/`) and the scaffolded `.claude/settings.json` **auto-enables** it via a
  local directory marketplace — no manual `/plugin install`, no generated skill
  wrappers. Validated with `claude plugin validate`.
- **`story-slice`** (Phase 7) — merges the former `create-epics` + `create-stories`
  into one slicer that cuts the **three-way-keyed architecture (PRD × components ×
  ADRs)** into story *contracts*: `owns`/`produces`/`consumes` globs, o/m/p
  estimates, risk (forced high on security-registry paths), styleguide refs,
  attached analytics events, and red acceptance stubs.
- **`story-graph`** (Phase 7) — rebuilt from `parallelization-strategy`: authors
  `story-graph.yaml` (typed edges) and runs **`coldpress waves`**, so waves,
  critical path, and schedule are *computed*, never hand-authored.
- **Modern SKILL.md frontmatter** — the generator now emits `disable-model-invocation`
  (on `deploy` + `sacred-change` — never model-auto-fired), `context: fork` (on
  `adversarial-review` — clean-room critique), and `disallowed-tools`; verified
  against the official docs.
- **Agent-team demo** — `docs/agent-team-demo.md`: a worked Phase 8 wave in team
  mode (plan-approval + TaskCompleted gates, boundary-guard/quality-gate, clean-room
  verifier outside the team).

#### Changed

- **`dev-story` + `deploy` rebuilt** to the v0.4 model — `dev-story`: plan-mode
  entry, packet `owns` boundary, red stubs (test-integrity), quality-gate, styleguide
  self-check, DLT for out-of-scope, clean-room verifier hand-off. `deploy`:
  staging-first → human prod trigger → smoke → release record.
- **Canonical skill count** counts lifecycle + cross-cutting skills (excludes
  stack-pack payload, forkable creative atomics, framework-authoring meta, and
  tool-primitives). Consolidations (research trio, editorial, doc utilities, P7
  merges) landed it at **84**. `plugin.json`/marketplace versions now stamp from
  `package.json` (drift fixed).
- **`sprint-status` skill → `operate-loop`** (Phase 10 entry/orchestrator; the
  scrum-era name retired, function preserved).

#### Removed

- **Init-time skill wrapper generation** (`src/utils/wrappers.ts`) — the plugin
  replaces it.
- **Merged/renamed away:** `editorial-prose`+`editorial-structure` → `editorial`;
  `distillator`+`shard-doc`+`index-docs` → `docs`; `create-epics`+`create-stories`
  → `story-slice`; `parallelization-strategy` → `story-graph`.
- **PERT chart retired** at the skill + gate level — the computed wave plan
  supersedes it (P7/P8 gate checks repointed to the story graph). Removed the dead
  `phase-transition` graph-rebuild step (post-Graphify).

### v0.4 "Enforcement" overhaul — WS4: Verification & design system

The studio's differentiator: verification made structurally independent, and the
design system made mechanically enforceable.

#### Added

- **Design tokens as an enforcement contract** — `tokens.json` (schema'd) +
  **`coldpress tokens build`** generates `tokens.css` (CSS custom properties +
  dark-mode), so the build consumes tokens by construction.
- **`coldpress visual-verify`** — fails on any used style that isn't a token
  (off-palette color, non-token font, off-scale size/spacing). The `visual-verify`
  + `acceptance-stubs` skills; the verifier wraps Anthropic's `webapp-testing`.
- **`testing.yaml` schema** (L0–L7 test architecture) and the **outcome contract**
  (`outcomes.yaml` + `coldpress outcomes check`) — a P0/P1 requirement with no
  measurable outcome target fails the P4 gate.
- **P6 structured artifacts** — `api-contract`, `data-model`, `analytics-plan`,
  `integration-inventory` (schemas + skills), each keyed to requirements.
- **Trace requirement/component keying** — stories declare `implements[]`;
  `coldpress trace impact <requirement>` reaches the implementing stories, and
  `trace orphans` flags an unmapped requirement (P6 gate).

#### Changed

- **Subagent roster: 11 → 8 + Butler** (§4.5). `qa` → **`verifier`** (dispatched by
  Butler only, clean-room context, read-only — cannot edit code); `reviewer`
  upgraded to opus (evidence-linked); `scrum-master` / `communicator` / `valet`
  removed. All agents gained `description:` frontmatter; `agent-roster.csv` is now
  generated from frontmatter + drift-checked.

### v0.4 "Enforcement" overhaul — WS3: Two-lane lifecycle

The lite lane becomes the structural default — full ceremony by consent, not by
default. Completes the v0.4 foundation phase.

#### Added

- **Lite lane** — `coldpress init` now defaults to `lane: lite`: four consolidated
  phases (**Spec → Build → Verify → Ship**, `lifecycle/lite/*`) with one `spec.md`
  instead of the five-doc sacred set. *The lane changes ceremony, never safety* —
  the same hooks, verifier, and deploy packs apply. `--lane full` for the 11-phase
  lane.
- **`.coldpress/state.yaml`** is now seeded at init (the orchestration spine the
  hooks route off).
- **`coldpress lane-upgrade`** — promote a lite project to the full lane without
  data loss: flips the lane and back-fills the full-lane sacred-doc skeletons from
  `spec.md`, which (with `decisions.md`) is preserved.
- **`coldpress statusline`** — one-line orchestration status (lane · phase · tier ·
  enforcement · gates), wired into Claude Code's statusLine.
- Scaffolded `CLAUDE.md` gains a **lane routing table** (external users / payment /
  novel architecture / effort → recommend full).

### v0.4 "Enforcement" overhaul — WS2: Trace + story graph

Traceability and parallelism become computed, enforceable machinery — and the
sacred PERT chart is retired.

#### Added

- **`coldpress trace`** — a derived, in-memory traceability graph over the
  project's schema'd artifacts (story-graph, ADRs, deltas today; requirement/
  component keying activates in WS4). Verbs: `orphans` (dependency integrity +
  the **silent-divergence guard** — every `flag_for_architecture_ADR` delta must
  resolve to a real ADR — + the unresolved-delta phase-exit gate; exit 1 on a
  blocking finding), `why` (upstream lineage), `impact` (downstream blast radius),
  `coverage`. Wired into the P6 + P7 exit gates.
- **`coldpress waves`** — validates the story graph (acyclic; a contract story on
  every `interface` edge; intra-wave ownership disjointness) and derives the wave
  plan: topological waves, critical path via `(o+4m+p)/6`, team-mode qualification,
  auto-generated `IN-<wave>` integration stories. Emits `docs/generated/{waves,
  schedule}.yaml` + a mermaid render. Waves are computed, never authored.
- **Data-contract schemas**: `handoff.schema.ts` (one packet per inter-agent
  boundary — scoped inputs + forbidden globs + return contract), `delta.schema.ts`
  (the forward-carry quartet; `resolution: null` blocks phase exit),
  `story-graph.schema.ts` (stories with o/m/p estimates + ownership globs + typed
  edges — replaces the sacred PERT chart).
- **`boundary-guard`** hook (PreToolUse) — blocks a write matching the active
  handoff packet's `forbidden` globs, so a delegated subagent cannot write outside
  its lane. **`git-guard`** hook (PreToolUse Bash) — trunk-based protocol: blocks
  direct subagent commits to `main`.

#### Changed

- `sacred-change` skill computes the blast radius (`coldpress trace impact`) and
  flips impacted stories to re-verify when a sacred doc changes.

### v0.4 "Enforcement" overhaul — WS1: Enforcement layer

The heart of v0.4: the framework's rules stop being prose an agent may ignore and
become **hooks that can fail**. Closes the audit's headline finding ("zero Claude
Code hooks exist; sacred-doc protection, phase gates, and quality gates are 100%
instructional prose").

#### Added

- **Enforcement hook stack** (`.claude/settings.json` + `scripts/hooks/run.mjs`,
  scaffolded into every project). Eight hooks, each with a unit test, an
  `--explain`, and a uniform `COLDPRESS_OVERRIDE="<gate>:<reason>"` escape hatch
  that is loudly logged:
  - `sacred-guard` (PreToolUse) — blocks `_context/sacred/*` writes without an approved change record.
  - `schema-validate` (PostToolUse) — schema'd `_context/` artifacts must validate; errors fed back in-loop.
  - `secret-scan` (PostToolUse) — catches common secret patterns at edit time.
  - `quality-gate` (Stop) — cannot complete while typecheck/lint/test are red.
  - `phase-gate` (PreToolUse Skill, full lane) — no skipping ahead of ungreen phase gates.
  - `test-integrity` (PostToolUse) — flags dropped assertions / added skip markers.
  - `run-log` (Stop/SubagentStop) — records a `session-boundary` event for the evolution loop.
  - `load-state` (SessionStart) — injects the orchestration summary.
  - Logic lives in `src/hooks/` (via the new `coldpress hook <name>` CLI); the shipped
    scripts are thin, dependency-free wrappers.
- **`.coldpress/state.yaml` schema** (`schemas/state.schema.ts`) — the single
  orchestration truth (lane, phase, security tier, enforcement mode, gate ledger).
- **`coldpress.yaml` whole-file schema** (`schemas/coldpress-yaml.schema.ts`) — the
  previously-missing config validator.
- **`sacred-change` skill** — the one change workflow for all sacred docs; produces
  the record `sacred-guard` enforces.
- **`check:drift`** (`npm run check:drift`) — regenerates derived artifacts and fails
  on drift; wired into CI.

#### Changed

- Extended `validate-schema` routing to 17 previously-orphaned schemas (design,
  planning, audit, tracking artifacts); fixed 4 dangling schema paths.
- EventStream schema gains a `session-boundary` event kind; phase bound widened to 11 (Shape A).

#### Removed

- The five `governance/*-change/workflow.md` prose change workflows (folded into
  `sacred-change` + `sacred-guard`); `pert-change` deleted outright (PERT desanctified).
  `governance/` is 67% smaller.

### v0.4 "Enforcement" overhaul — WS0: Hygiene & cuts

The first workstream of the v0.4 overhaul: remove ~a third of the surface before
migrating anything. Pre-approved cut list §8, items 1–4, 13, 14 (item 8, the
wrapper generator, is deferred to WS5). No behavioural change to the core lifecycle
beyond the interop default; core installs with **no Python**.

#### Removed

- **Vendored Graphify** (`graph/vendor/graphify/`, ~1.5 MB / 73 files) and the
  `coldpress graph rebuild|stats|query|view` verbs, the graph-staleness gate check,
  and `src/graph/staleness.ts`. Retrieval/traceability moves to the forthcoming
  native `coldpress trace`; AST code-indexing demotes to an optional brownfield
  capability pack (external, on-demand install — never re-vendored). The
  `graph-freshness` gate step is removed from the Phase 2 and Phase 3 exit gates.
  Python is no longer a core requirement (removed from README + quick-start).
- **`orchestrator/`** (17 spec files + one non-wired Inngest reference) — superseded
  by native agent teams + the forthcoming `coldpress waves` script.
- **Committed build artifacts** — root `coldpress-core-0.3.2-alpha.tgz` and
  `packages/otel-exporter/node_modules/` (159 MB); `*.tgz` added to `.gitignore`.

#### Changed

- **Interop emission default is now AGENTS.md-only** (was: all IDE targets). AGENTS.md
  is the vendor-neutral manifest emitted by default; Cursor / Roo / OpenHands / Cline
  outputs are opt-in via `--interop`.
- **`_sandbox/`** relocated to `reference/` (holding area until the brownfield pack lands).
- **Unused CI templates** (Harness, GitLab, Azure) moved to `reference/ci-cd/`; GitHub
  Actions stays in `data/ci-cd/`.
- **`governance/promotion-flow.md`** terminology aligned to `sacred-docs.md` §6
  (`devSandbox → App` ⇒ `sandbox/ → live/`).
- **NOTICE.md** §4 rewritten: Graphify credited as optional-backend **lineage**, no
  longer vendored — no source-redistribution obligation remains.

---

## [0.3.2-alpha] — 2026-05-17

### Fixed

- **`coldpress init` now copies the framework tree.** v0.3.1-alpha (and v0.3.0-alpha) scaffolded only the 5 top-level framework files (CHANGELOG, LICENSE, NOTICE, README, coldpress.yaml) into `<project>/coldpress-os/` — all 8 framework dirs (`lifecycle/`, `skills/`, `orchestrator/`, `governance/`, `data/`, `agents/`, `templates/`, `docs/`) were silently dropped. As a result, `.claude/skills/` ended up empty (the wrapper generator scans `coldpress-os/skills/` + `coldpress-os/lifecycle/` and found nothing).

  Root cause: `copyFramework`'s `cp` filter rejected any source path containing `/node_modules/`. That check is correct in dev (no `/node_modules/` between repo root and source dirs), but when the package is installed via npm/npx, `packageRoot` itself resolves to `~/.npm/_npx/<hash>/node_modules/@coldpress/core` — so EVERY recursive source path contained `/node_modules/` and the filter rejected them all. The top-level files copied fine because they go through a second `cp` call without the filter.

  Fix: drop the `/node_modules/` exclusion entirely. The `frameworkDirs` whitelist (8 dirs) is already sufficient scoping — none of those whitelisted trees contain a nested `node_modules/`. Verified locally with `npm pack` + clean-dir install: scaffold now produces 112 skill wrappers + the full 8-dir framework tree.

  Surfaced by the post-publish smoke test for 0.3.1-alpha. Recommended deprecation: `npm deprecate @coldpress/core@0.3.1-alpha "Broken — framework tree not copied at init. Use 0.3.2-alpha or later."`

---

## [0.3.1-alpha] — 2026-05-17

### Fixed

- **`zod` declared as a runtime dependency.** v0.3.0-alpha shipped to npm with `zod` used by `src/` and `schemas/` at runtime but only available locally as a transitive dependency of `@anthropic-ai/claude-agent-sdk` (a devDependency). `npx @coldpress/core@alpha init` failed at startup with `ERR_MODULE_NOT_FOUND: Cannot find package 'zod'`. Surfaced by the post-publish smoke test. Added `zod: "^4.3.6"` to `dependencies`. The 0.3.0-alpha publish should be deprecated via `npm deprecate @coldpress/core@0.3.0-alpha "Broken — missing zod runtime dependency. Use 0.3.1-alpha or later."`.

### Docs

- **Hello Butler reference (`docs/butler.md`)** — codifies the canonical `Hello Butler` session entry point. Butler is the main orchestrator (your default Claude Code session running with CLAUDE.md as its directive), not a subagent. Documents the 11-subagent dispatch tree, cadence modes, routing patterns, gate behaviour, customisation hooks.
- **Shape A v0.3.0-alpha propagation across 25+ public docs.** README + quick-start + example-walkthrough fully refreshed at v0.3.0-alpha tag time; this release extends the sweep to every doc under `docs/`. Old "9-phase" / "Phase 5 Breakdown" / "Phase 6 Implementation" references replaced with the 11-phase Shape A numbering (Bootstrap=1 … Evolve=11). Subagent counts 9 → 11 (added @reviewer for P11, @devops for P9-P10). Skill counts ~66 → ~128 (built wrappers) / ~75 → ~85 (atomic source). Node engine prerequisite ≥20 → ≥22 in all install instructions.
- **Public-author cleanup.** All Version Control table rows in public docs rewritten so the Author column reads "ColdPress Labs". Internal agent names (Alfred / Cadbury-hq / Andy-coldpress-os) were leaking through the npm tarball and GitHub browse view. History preserved; byline flattened.
- **Hello Butler footers on 24 spec docs** that previously didn't mention Butler — small "Orchestration context" callout linking to butler.md.

---

## [0.3.0-alpha] — 2026-05-03

### Summary

The **Shape A 11-phase lifecycle restructure** — the largest framework change since v0.1.0-alpha. Old Phase 4 Planning split into Phase 4 (Planning, PRD-only) + Phase 5 (Design, NEW) + Phase 6 (Architecture, NEW); old phases 5–9 cascade to 7–11. Adds 2 post-schema agents (@reviewer, @devops, total 11), the **forward-carry quartet** (design-deltas / architecture-deltas / implementation-deltas / ops-deltas), Pattern 7 agent transitions, the silent-divergence guard (P5 → P6 ADR enforcement), and the inter-iteration cycle (P11 → next iteration's P1). 7 new schemas. New CLI flag `validate-prd --sections=<list>` for lightweight section-scoped re-validation. Audit punch-list 10/10 cleared.

### Added — audit-fix work (units #21–#24)

- **`template/.claude/agents/devops.md`** — single agent, two phase-modes (Phase 9 ship-path / Phase 10 steady-state). Mirrors @qa rapid/strategic and @developer standard/quick patterns. Color: orange. (Audit punch-list #1.)
- **7 missing schemas authored:**
  - `schemas/handoffs/phase-handoff.schema.json` — generic phase boundary handoff (used at every boundary 1→2 through 10→11; nullable to_phase for Phase 11 terminal). $refs design-delta + ops-delta for forward-carry payloads.
  - `schemas/audit/retrospective.schema.json` — Phase 11 retrospective; cause analysis for accept_into_phase_11_retrospective deltas.
  - `schemas/audit/product-evolution-backlog.schema.json` — Phase 11 backlog with priority + estimated_size.
  - `schemas/audit/innovation-strategy.schema.json` — Phase 11 strategic ideation; horizon + themes + experiments_recommended.
  - `schemas/audit/readiness.schema.json` — Phase 9 readiness report (pre-deploy + post-deploy variants).
  - `schemas/audit/course-correction.schema.json` — Phase 10 corrections; trigger + diagnosis + decision + actions + surfaced_ops_deltas.
  - `schemas/audit/deploy-log.schema.json` — Phase 9 deploy execution log; strategy enum + outcome + rollback object.
  *(Audit punch-list #2.)*
- **`validate-prd --sections=<list>` flag** — SKILL.md v1.2 + workflow.md v1.1 mode-routing + new `step-04-sections-mode.md` (7-step short-path emitting `prd-validation-amendment-{date}.md` per `prd-amendment.schema.json`). First real consumer: Phase 7 `breakdown-entry-sync` Step 1 architecture-deltas reconciliation. (Audit punch-list #5.)
- **Pattern 7 transition buffer mechanism** — `_context/handoffs/pattern-7-transitions-wip-{date}.yaml` (YAML list, append-only during phase). `pattern-7-agent-personas.md` rewritten with buffer + emitter + flush convention. `phase-transition/steps/step-03-handoff-log.md` extended with new Step 2a (flush + cross-buffer write entry-transition to next phase). `step-02a-reconciliation.md` updated to write to buffer (not handoff log markdown directly). Per-skill emission retrofit across Phase 6-11 step files documented but DEFERRED (incremental). (Audit punch-list #3 — mechanism wired; full retrofit v0.4.0.)
- **`data/methods/method-defaults.yaml` `phase_2/3/4` reconstruction** — reauthored from each phase's deep-dive §8 (~250 lines YAML; phase_2 = 8 skills × ~25 wire-ins, densest in framework; phase_3 with Round-5 corrections per audit; phase_4 with Shape A boundary notes for design-thinking/architecture moved to phase_5/6). Recovers from incident #1 (2026-05-02 `rm -rf data` working-tree-only loss). (Audit punch-list #4.)
- **`docs/cross-cutting/cross-cutting-skills.md`** v1.0 — codifies canonical-vs-router pattern (e.g., `skills/creative/storytelling/` canonical with @communicator, `lifecycle/5-design/narrative/` router with @ux-designer); audit guidance for distinguishing real conflicts from by-design pattern. (Audit punch-list #7.)
- **`docs/skill-md-generator-spec.md` mirror policy section** — explicit "Mirror policy — `plugin/skills/` is build output, not source" right under intro: documents flat-namespace, dropped-fields-by-design (`type`, `category`, `phases`, `inputs`, `outputs`), no-direct-edit, CI-guard-invariant, and auditor rules. (Audit punch-list #8.)
- **Comprehensive system review** at `docs/system-review-2026-05-02.md` v1.0 (475 lines, 10 punch-list items, 17 recommendations across 6 categories). Update note appended to §3.2 confirming all 14 "unreferenced" TS schemas have at least one consumer (tests + CHANGELOG + agent files + llm-gates.md); finding RESOLVED, no archives. (Audit punch-list #9.)
- **REGISTRY Subagents 9 → 11.** Added @reviewer (Phase 11) + @devops (Phase 9, 10) as post-schema additions. UX-Designer Primary Phases 4 → 5; Architect "3, 4" → "3, 6" (Shape A correction).
- **`docs/v0.3.0-scope-and-roadmap.md`** v1.0 — comprehensive scope doc: §1 deliveries / §2 ship gate / §3 v0.4.0 roadmap (4 tiers, 14 candidate units) / §4 production-readiness gap analysis / §5 strategic open questions / §6 references.
- **`docs/to-do.md`** v6.0 — restructured around v0.3.0 ship gate + v0.4.0 roadmap + production-readiness; Phase H closeout content preserved as historical archive.

### Added — autonomous loop (units #1–#19)

- **Phase 11 Evolve — FINAL phase Shape A scope refresh** (cascade rename of old Phase 9; deep-dive v1.0 + Part 11 v1.27). Same 3 skills (no new); @reviewer takeover from @devops:
  - `retrospective` (entry skill per Q1) — Step 0 absorbs entry-sync; **ops-deltas reconciliation pass per Q2** (4-option resolution); cause analysis problem_solving heavy.
  - `product-evolution` — next-iteration backlog from accept_into_phase_11_product_evolution deltas.
  - `innovation-strategy` — long-horizon strategic ideation; brainstorming heavy.
- **Phase 11 is FINAL** — no phase-12-handoff. Inter-iteration cycle per Q4: closure copies outputs to `_input/prior-iteration/` for NEXT iteration's Phase 1 entry.
- **ops-deltas consumption point** — fourth forward-carry deltas reconciled at retrospective Step 0; closes the forward-carry quartet lifecycle.
- **Method playbook `phase_11:` section** — problem_solving + brainstorming heavy; rest medium.
- **Pattern 7 seventh + FINAL invocation** — 2 transitions (#18 entry / #19 exit FINAL). Full Pattern 7 lifecycle summary added (7 sustained invocations across canonical 11-phase cycle).
- **Phase 11 gate.json** with 4 checks. Phase 11 trigger entries (5 inter-iteration rows). REGISTRY Phase 11 sub-section. skill-catalog 3 Phase 11 rows.
- **🎯 11-phase Shape A restructure COMPLETE.** All 11 phases (Bootstrap / Discovery / Tech-Stack / Planning / Design / Architecture / Breakdown / Implementation / Deployment / Operate / Evolve) have deep dives + plan parts + implementation. Forward-carry quartet activated (design / architecture / implementation / ops deltas). Pattern 7 spec'd with 7 invocations. **20-unit autonomous queue COMPLETE.**

- **Phase 10 Operate — Shape A scope refresh** (cascade rename of old Phase 8; deep-dive v1.0 + Part 10 v1.26). Same 3 skills (no new); @devops primary (continues from Phase 9 — no agent change at entry):
  - `sprint-status` (entry skill per Q1) — Step 0 absorbs entry-sync; iterative versioning.
  - `correct-course` — three-trigger flow per Q5 (incident / bug / friction); surfaces ops-deltas.
  - `document-project` — post-deploy end-user-facing canonical docs per Q4.
- **ops-deltas mechanism — FOURTH forward-carry instance** completing the quartet (Phase 5 design / Phase 7 architecture / Phase 8 implementation / **Phase 10 ops**). New `schemas/handoffs/ops-delta.schema.json`. phase-transition step-02a-reconciliation extended for from_phase==10 — forwards to Phase 11 handoff; does NOT amend PRD.
- **Phase 10 is continuous-by-default** — user-invoked Phase 11 retrospective triggers exit.
- **Method playbook `phase_10:` section** — problem_solving heavy (root_cause + five_whys + failure_mode_analysis + scenario_planning); advanced_elicitation medium; rest low.
- **Pattern 7 sixth sustained invocation** — 3 transitions (#16/#17/#18); #16 continues @devops from Phase 9; #18 hands to @reviewer at Phase 11 entry.
- **Phase 10 gate.json** with 5 acceptance checks. README enriched. REGISTRY Phase 10 sub-section. skill-catalog 3 Phase 10 rows. Phase 10 trigger entries in re-entry patterns.

- **Phase 9 Deployment — Shape A scope refresh** (cascade rename of old Phase 7; deep-dive v1.0 + Part 9 v1.25). Same 6 skills (no new); @devops primary. Inherits well-established security-gate + LLM-gates + phase-gate-protocol + observability-setup infrastructure (no re-spec):
  - `readiness-check` (entry skill per Q1) — Step 0 absorbs entry-sync; meta-aggregator over env/dep/security/db-migration; used pre-deploy AND post-deploy variants.
  - `env-check`, `security-scan` (5 classical + 3 LLM gates), `dep-health-check`, `db-migration-check` (brownfield-conditional), `deploy` (action skill emits deploy-log).
- **Pre-deploy + post-deploy gate split (per Q2):** 5 checks pre-deploy → deploy action → 3 checks post-deploy. Total 8 phase-9 gate.json checks.
- **No forward-carry mechanism (per Q3):** Phase 9 is verification + execution, not authoring. Divergence routes back via re-entry.
- **Method playbook `phase_9:` section** — problem_solving heavy; advanced_elicitation medium; rest low.
- **Pattern 7 fifth invocation** — 3 transitions (#14/#15/#16); @devops continues into Phase 10 (transition #16 unique — same agent across boundary).
- **Phase 9 trigger entries** added to phase-reentry-patterns.md — 7 trigger rows.
- **Phase 9 gate.json** with 8 acceptance checks. README enriched. REGISTRY Phase 9 sub-section. skill-catalog.csv 6 Phase 9 rows. Review skills phases arrays add 9 (and 10 for adversarial-review).
- **Phase 8 Implementation — Shape A scope refresh** (cascade rename of old Phase 6; deep-dive v1.0 + Part 8 v1.24). Same 9 skills (no new); now consumes fully-specified upstream stack. Owner @developer with @qa sub-persona for test-* + code-review:
  - `wave-orchestration` (entry skill per Q1) — Step 0 absorbs entry-sync (graph-first 12 graph_queries; ci-pipeline + test-framework dispatch; implementation-deltas WIP log init; 7th-consumer staleness helper).
  - `ci-pipeline` (pre-Wave-1 setup per Q5).
  - `test-framework` (one-time; @qa Pattern 7 sub-transition #11a).
  - `test-design` (per-story; archetype-conditional per Q3).
  - `dev-story` (reads story.archetype_granularity per Q2).
  - `quick-dev` (vibe-coder-lean light path per Q3).
  - `atdd` (skip if vibe-coder-lean per Q3).
  - `qa-automation` (per-wave; surfaces implementation-deltas).
  - `code-review` (per-story; adversarial-review + edge-case-hunter wire-ins per Q6; @qa Pattern 7 sub-transition #11c recurring per story).
- **Implementation-deltas reconciliation** — third forward-carry instance completing the trio (Phase 5 design-deltas at Phase 5 EXIT + Phase 7 architecture-deltas at Phase 7 ENTRY + Phase 8 implementation-deltas at Phase 8 EXIT). Reuses design-delta schema. phase-transition step-02a-reconciliation extended for from_phase==8.
- **3 new schemas:** `wave-status.schema.json`, `code-review.schema.json`, `dev-story-output.schema.json`.
- **Method playbook `phase_8:` section** — problem_solving heavy; advanced_elicitation medium; brainstorming + design_thinking + story_types low.
- **Pattern 7 fourth sustained invocation** — 7 transitions per Phase 8 run (most so far). Recurring sub-transitions #11c/#11d per story for code-review.
- **Phase 8 gate.json** with 8 acceptance checks. README enriched. REGISTRY Phase 8 sub-section. skill-catalog.csv 9 Phase 8 rows. Phase 8 trigger entries in re-entry patterns.
- **Phase 7 Breakdown — Shape A scope refresh** (cascade rename of old Phase 5; deep-dive v1.0 + Part 7 v1.23). Same 5 existing skills + 1 NEW (`breakdown-entry-sync`); now consumes a richer upstream (PRD v{latest} + UX-spec + brand-guidelines + sacred architecture + ADRs + prototype-manifest):
  - `breakdown-entry-sync` (NEW per Q1) — graph-first context load (14 graph_queries; 6th consumer of staleness helper) + **architecture-deltas reconciliation pass at Phase 7 ENTRY** (per Q2; forward-carry from Phase 6) + breakdown-scope memo emit. **First real consumer of `validate-prd --sections=<list>` lightweight-amendment path** that Phase 5 reconciliation deferred.
  - `create-epics` (existing — Shape A refresh) — graph-first inputs; expanded to read breakdown-scope, UX-spec, ADRs, prototype-manifest, personas, idea-validation; outputs validated-distillate `epics-v{N}.md`.
  - `create-stories` (existing — Shape A refresh; per-story files per Q4; archetype-conditional granularity per Q5) — outputs migrated to per-story files at `_context/implementation/stories/story-NNN-<slug>-v{N}.md` + `stories-index.md`. Granularity: vibe-coder-lean thin (1-3h, AC), standard medium (4-8h, BDD), design-led richer.
  - `parallelization-strategy` (existing) — produces sacred PERT chart per Q3. Sacred-doc governance via `governance/pert-change/`.
  - `sprint-planning` (existing) — owner formalised as @scrum-master (Pattern 7 sub_phase_boundary transitions #8a + #8b from @pm).
  - `implementation-readiness` (existing) — 9-point structured checklist per Q6 (PRD/UX/architecture coverage / flagged-deltas resolved / PERT valid / sprint complete / no ADR contradictions / prototype available / legacy reflected).
- **Architecture-deltas reconciliation pass** — second cross-phase mechanism (mirror of Phase 5 design-deltas at Phase 7 ENTRY instead of EXIT per Q2). Schema reuses `design-delta.schema.json` with `source_skill: architecture-design`.
- **6 new schemas:** `breakdown-scope.schema.json`, `epic.schema.json`, `story.schema.json`, `stories-index.schema.json`, `implementation-readiness.schema.json` + (referenced) `pert-chart.schema.json` for PERT sacred + `pert-meta.schema.json` for sidecar.
- **Method playbook `phase_7:` section** at `data/methods/method-defaults.yaml` — story_types heavy with 4-archetype selection (Q5 mapping); problem_solving heavy (first_principles + scenario_planning + failure_mode_analysis); brainstorming + advanced_elicitation medium; design_thinking low.
- **Pattern 7 third sustained invocation** — 5 transitions per Phase 7 run (#8 phase-6-to-7 entry: phase-transition → @pm; #8a / #8b internal sprint-planning sub_phase_boundary @pm ↔ @scrum-master; #9 phase-7 exit; #10 phase-7-to-8 entry). Documented in `docs/cross-cutting/pattern-7-agent-personas.md`.
- **Phase 7 trigger entries** added to `docs/cross-cutting/phase-reentry-patterns.md` — 6 trigger rows.
- **Phase 7 gate.json** with 10 acceptance checks (incl. `architecture-deltas-resolved` at #3 + `implementation-readiness-pass` at #8 with Q6 9-point checklist as sub-evaluation).
- **`lifecycle/7-breakdown/`** README enriched (replaces old stub). Phase 7 sub-section in REGISTRY. `editorial-structure` + `editorial-prose` phases arrays add 7 (`adversarial-review` already had 7).
- **Phase 6 Architecture — NEW lifecycle phase** (Shape A 11-phase restructure, deep-dive v1.0 + Part 6 v1.22). Single-skill phase owned by @architect; first phase where PRD + UX-spec + brand-guidelines + tech-stack are all simultaneously available:
  - `architecture-design` (rewritten + renamed from `create-architecture` per Q2; relocated from Phase 4) — graph-first inputs (11 graph_queries + 6 existence_checks); 7-step workflow including new Step 1 flagged-deltas-intake (CRITICAL silent-divergence guard); produces `_context/sacred/architecture.md` + sidecar + ADRs.
- **Silent-divergence guard activated** — Phase 6 enforces the mitigation specced by Phase 5 §7.4. Phase 5 reconciliation may resolve design-deltas as `flag_for_architecture_ADR` (PRD stays unchanged; design diverges). Phase 6 Step 1 consumes `architecture_adrs_required[]` from phase-5-to-6 handoff and queues required ADRs; Step 5 authors them with `resolves_design_delta` field linking to source delta; Phase 6 exit gate check #5 (`architecture-adrs-for-flagged-deltas-emitted`, block-severity) verifies every flagged delta has corresponding ADR. Mitigation converts silent PRD↔design divergence into auditable architectural-decision provenance.
- **`schemas/planning-artefacts/adr.schema.json` extended** with 5 new optional fields (`resolves_design_delta`, `prd_section_affected`, `design_decision_taken`, `architecture_implication`, `prd_amendment_deferred_reason`) for REQUIRED ADRs that resolve flagged deltas. `phase_authored` now accepts `[3, 6]` (Phase 3 stack ADRs OR Phase 6 architecture ADRs).
- **`schemas/handoffs/architecture-meta.schema.json`** NEW — Phase 6 → 7 handoff sidecar contract. Fields: component_count, integration_count, nfr_axes_addressed, adrs_authored (with resolves_design_delta_or_null per ADR), brownfield_modules_handled, flagged_deltas_resolved (silent-divergence guard count), architecture_deltas_surfaced (forward-carry).
- **Method playbook `phase_6:` section** at `data/methods/method-defaults.yaml` — `problem_solving` heavy (architectural trade-off analysis: first_principles + failure_mode_analysis + scenario_planning); `advanced_elicitation` heavy (vague_architectural_pattern / vague_nfr_strategy / vague_integration_boundary triggers); `design_thinking` medium (define + ideate); `brainstorming` medium; `story_types` low (feature_story for ADR rationale only).
- **Pattern 7 transitions for Phase 6** — second sustained invocation. 3 transitions per Phase 6 run (#5 phase-5-to-6 entry: phase-transition → @architect; #6 Phase 6 exit: @architect → phase-transition; #7 phase-6-to-7 entry: phase-transition → @pm). Documented in `docs/cross-cutting/pattern-7-agent-personas.md` with v0.3 no-sub-personas decision.
- **Phase 6 trigger entries** added to `docs/cross-cutting/phase-reentry-patterns.md` — 5 trigger rows. PRD-targeted gaps route to architecture-deltas reconciliation pass (forward-carry mechanism, mirror of Phase 5 design-deltas). UX-targeted gaps route to Phase 5 re-entry. Tech-stack-targeted gaps route to Phase 3 ADR amendment.
- **Architecture amendment workflow (Q6 reuse)** — hybrid model per Phase 6 deep-dive Q5: significant structural changes re-emit architecture.md (VC major bump); incremental decisions land as new ADRs referenced from § ADR Index (VC minor bump). Both routes use existing `governance/architecture-change/workflow.md` (per-sacred-doc pattern, same as `governance/tech-stack-change/`).
- **`lifecycle/6-architecture/`** scaffolded with `gate.json` (8 acceptance checks; silent-divergence guard at #5 block-severity), enriched README. **`templates/documents/architecture.md`** Phase 4 stale reference fixed; sacred-doc amendment workflow referenced. `editorial-structure` phases array → `[2,3,4,5,6,8,11]`; `editorial-prose` → `[2,4,5,6,8,11]` — both add Phase 6. REGISTRY.md Phase 6 sub-section. `skill-catalog.csv` architecture-design row.
- **Architecture-deltas (forward-carry)** — Phase 6 may surface PRD/UX gaps at architecture time. Mechanism mirrors Phase 5 design-deltas: surface as `architecture_delta` in handoff log; route through reconciliation pass at Phase 6 exit. Schema reuses `design-delta.schema.json` with `source_skill: architecture-design`. Implementation deferred to Phase 6 implementation Wave 6.X (post-MVP) per decisions log #22.
- **Phase 5 Design — NEW lifecycle phase** (Shape A 11-phase restructure, deep-dive v2.0 + Part 5 v1.21). 5 mandatory skills + 1 conditional, all owned by @ux-designer:
  - `design-brief` (rewritten from Phase 4) — Phase 5 entry; absorbs entry-sync into Step 0; bridge-mode-only; graph-first inputs; 5 step files; validated-distillate at `_context/planning/design-brief-v{N}.md`.
  - `ux-design` (rewritten + renamed from `create-ux-design`) — UX design spec; persona-grounded direct-read; tech-stack-feasibility supersede-check; PRD user-story coverage check; validated-distillate at `_context/design/ux-design-spec-v{N}.md` (sacred=false; distillate=true per Q4 resolution).
  - `brand-guidelines` (NEW) — canonical tokens + voice + tone + a11y rules + identity (scope iii broadest per Q3); auto-validates contrast vs active a11y baseline; archetype-conditional output (tokens-only / standard / design-led / WDS).
  - `prototype` (NEW) — archetype-shaped output (code-skeleton default / mock-spec for vibe-coder-lean / clickable-html for design-led/WDS per Q2); embeds PRD acceptance-criteria as code comments referencing US-IDs; tech-stack imports verification.
  - `narrative` (NEW; wrapper around cross-cutting `skills/creative/storytelling/` per Q5 hybrid) — 4-step thin wrapper; in-session delegation; story types: origin_story / persona_scenario / value_prop_narrative / brand_voice_samples / feature_story.
  - `legacy-ui-assessment` (NEW; conditional per Q6) — runs only when `_input/legacy/` has UI/design assets; cross-references Phase 4 `legacy-migration-plan`; decisions enum keep/refresh/discard/reference-only.
- **PRD Reconciliation Pass mechanism** — Phase 5 central new contract per deep-dive §7. Every Phase 5 skill surfaces `design_delta` entries during finalisation; aggregated by `phase-transition` at Phase 5 exit (new step-02a-reconciliation.md); 4 reconciliation_options per delta (accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11); `flag_for_architecture_ADR` deltas carry forward as MANDATORY ADR requirements at Phase 6 entry — silent-divergence guard.
- **8 new schemas:** `schemas/handoffs/design-delta.schema.json`, `schemas/sacred-docs/prd-amendment.schema.json`, `schemas/design/{design-brief,ux-design-spec,brand-guidelines,narrative,legacy-ui-assessment,prototype-manifest}.schema.json`.
- **Pattern 7 — Agent persona transition** spec at `docs/cross-cutting/pattern-7-agent-personas.md`. Canonical transition shape (8 fields); Phase 5 first sustained invocation with 4 transitions; v0.3 no-sub-personas decision (no @brand-specialist / @prototype-engineer). Pattern 7 entry added to `docs/prompt-patterns.md`.
- **Phase 5 trigger entries** added to `docs/cross-cutting/phase-reentry-patterns.md` — 9 trigger rows; PRD-targeted gaps NEVER use re-entry (boundary clarification: route through reconciliation); 4-option Butler prompt pattern.
- **Method playbook `phase_5:` section** at `data/methods/method-defaults.yaml` — `design_thinking` heavy (5 stages), `brainstorming` heavy, `advanced_elicitation` heavy (4 vague-style triggers), `problem_solving` medium, `story_types` heavy. 5 new story types added to `data/methods/story-types.csv`.
- **`lifecycle/5-design/`** scaffolded with `gate.json` (10 acceptance checks), enriched README. **`templates/documents/ux-design-spec.md`** Section 8 rewritten to reference brand-guidelines (no token duplication; resolves B25). REGISTRY.md Phase 5 sub-section. `skill-catalog.csv` 6 Phase 5 rows. `skills/creative/storytelling/SKILL.md` `phases:` updated to `[2, 5, 8, 11]`.
- **Handoff registry** (`docs/handoff-registry.md`) — canonical enumeration of every inter-phase and high-stakes intra-phase handoff in coldpress-os. 11 entries (9 inter-phase + 2 high-stakes intra-phase) spanning the 9-phase post-split lifecycle. Each entry: `from_phase`, `to_phase`, `artefact_path`, `artefact_type`, `producing_skill`, `consuming_skill(s)`, `stakes` (high/med/low), `schema_ref`. Resolves brief-sourced Open Question #4.
- **Zod schemas for the 4 high-stakes handoffs** at `schemas/handoffs/*.schema.ts`:
  - `prd-to-architecture` — architectural drivers, NFRs, constraints, out-of-scope.
  - `architecture-to-pert` — components, dependencies, risk ratings, cross-cutting concerns.
  - `pert-to-stories` — epics, wave assignments, acceptance-criteria shape.
  - `stories-to-implementation` — file scope, test-coverage targets, acceptance-criteria IDs.
  Every schema pins `schema_version: z.literal(1)`, `produced_by: z.literal("<skill-id>")` (prevents stolen-identity emission), `produced_at` ISO-8601 timestamp, and `project_slug` sanity-check against `coldpress.yaml`.
- **`src/handoffs/validate.ts`** — `validateHandoff(id, payload)` API returning `{ ok: true, data }` or `{ ok: false, issues: { path, message }[] }`. Never throws on validation failure; caller decides how to surface errors (CLI gate message, phase-transition abort).
- **`produced_by` field convention** — every subagent handoff carries `produced_by: "<skill-id>"` in its frontmatter. Ports MetaGPT's `cause_by` routing. Per-skill emission wires in Wave 4 Lifecycle Alignment; convention documented now.
- **`.meta.json` sidecar convention** for high-stakes handoffs. Producer writes `<artefact>.md` + `<artefact>.meta.json` atomically; both producer and consumer validate the sidecar via Zod. Validation failure = gate failure, not a warning.
- `docs/handoff-schema-spec.md` — full spec for the 4-layer handoff convention (registry, schemas, `produced_by`, sidecars) + validation semantics + extension recipe.
- `zod` `^3.25` runtime dep (for validation surface; reused across future Wave 3 work and Wave 4 skill-side write contracts).
- Added `schemas/` to the npm tarball `files` whitelist so consumer projects can resolve the schemas at runtime.
- **Test harness:** 23 new tests in `test/handoff-schemas.test.ts` (valid fixture + invalid fixtures per required field for all 4 schemas + validator error-shape assertions). Total: 78 tests across 7 suites.

### Changed

- `tsconfig.json` — added `schemas/**/*` to `include` so the schema files typecheck.
- **Graphify v4 vendored as fourth upstream** at [`graph/vendor/graphify/`](graph/vendor/graphify/). Python package (34 modules) trimmed from 2.6 MB → 1.5 MB (stripped `docs/translations/`, `tests/`, `scripts/`). Adds tree-sitter AST indexing across 20+ languages + markdown/document ingestion with graph extraction. Upstream MIT. Upstream `LICENSE`, `README`, `ARCHITECTURE.md`, `CHANGELOG.md`, `pyproject.toml`, and `AGENTS.md` preserved verbatim inside the vendored tree for attribution and reference.
  - **Attribution scaffolding:** `LICENSE` gains a 4th copyright line (Safi Shamsi); `NOTICE.md` extended with a full "4. Graphify" section (nature of derivation, soft-fork stance, what was kept / stripped, trademarks); `docs/attribution-audit.md` Summary Table gains a row for the vendored tree (classified "Vendored — verbatim upstream"); README acknowledgments grow from three upstreams to four.
  - **Path deviation from plan §3.1:** plan said `src/graph/vendor/graphify/`; relocated to `graph/vendor/graphify/` at repo root. Reason: `src/` is not in the npm tarball `files` whitelist (only `dist/` ships from the TypeScript side), so Python source placed under `src/` would not reach consumers. The `graph/` path is added to the `files` whitelist; Python source now ships in the tarball. Documented in plan v2.12.
  - **No visualizer/UI stripping needed** — Graphify v4's tree has no viz/UI layer to remove; the upstream is a pure indexer + query library.
  - **Schema reshape + Butler wiring deferred** to Wave 3 Blocks N/O/P. The vendored tree is verbatim upstream today.
- **`graph/` added to the npm tarball `files` whitelist** so Graphify's Python source ships with `@coldpress/core`. Running the indexer requires Python ≥ 3.10 + upstream Python deps (`pip install -e graph/vendor/graphify`); `coldpress doctor` will check for both in a future block.
- **Graph schema** (`docs/graph-schema.md`) — coldpress-os's knowledge-graph specification. Base format is NetworkX node-link JSON (produced by Graphify); coldpress-os extends each node with a `coldpress` namespace (`node_type`, `env_tag`, `dir_role`, optional `governance`). 7 `node_type` values (Document, SacredDoc, Artefact, CodeModule, CodeSymbol, CredentialName, Input); 10 `relation` values (imports_from, calls, references, descends_from, implements, tests, deploys_to, promoted_from_sandbox, superseded_by, consumes). Secure-manifest exclusion rule codified: credential values never indexed; only `CredentialName` nodes from `secure/manifest.yaml`.
- **`src/graph/types.ts`** — TypeScript types + Zod schema for the graph JSON. Passthrough on all object shapes so additive upstream changes don't break consumers. Validates `schema_version: 1` at the graph level.
- **`src/graph/index.ts` — `Graph` class** — Node-side in-memory wrapper. `loadGraph({ projectDir })` reads `.coldpress/graph/graph.json`, validates against Zod, throws `GraphNotFoundError` or `GraphSchemaError` with actionable remediation prose. Query surface: `node(id)`, `nodesByType()`, `nodesByDirRole()`, `nodesByEnvTag()`, `edgesByRelation()`, `neighbors(id, { relation? })`, `stats()`. Defense-in-depth `assertNoCredentialValue(values)` — substring-scans the serialised graph for credential values from `secure/.env*` and reports any matches; primary defence is the adapter-layer exclusion (Wave 3 Block O).
- **`coldpress graph rebuild` + `coldpress graph stats` CLI subcommands.**
  - `rebuild` spawns `python3 -m graphify.build --input <cwd> --output .coldpress/graph/graph.json`, with up-front probes for Python ≥ 3.10 + `import graphify` working (fails loud with `pip install -e` remediation hint).
  - `stats` loads + prints counts + histograms (nodes by type, nodes by env tag, edges by relation). Verified end-to-end against the vendored `worked/httpx/graph.json` fixture — 144 nodes / 330 edges / 6 communities printed correctly.
- **21 new tests** in `test/graph.test.ts` covering: Zod schema passthrough behaviour, loadGraph error-paths (not-found, invalid-JSON, schema-violating content), query surface against the real httpx fixture, coldpress-extension filtering with a synthetic fixture, credential-value guardrail. Total test suite: 99 tests across 8 suites.
- **tsup external list extended with `zod`** — without this, zod was getting bundled into the CLI (bundle jumped 33 KB → 552 KB). Runtime deps are now `commander`, `@clack/prompts`, `picocolors`, `yaml`, `zod`; all marked external. Bundle: 33.65 KB → 47.74 KB (+14 KB for the new graph code).
- **Graph enrichment adapter** (`src/graph/enrich.ts`) — pure-function post-processor that populates the `coldpress.{node_type, env_tag, dir_role}` namespace on every Graphify-produced node from the node's `source_file` path and `file_type`. Classification matrix covers all 15 dir roles (`_context/*`, `_input/*`, `secure`, `sandbox`, `live`, `other`) and the 7 `node_type` values. Preserves pre-set `node_type` (e.g., CredentialName from the secure adapter) — never overwrites an existing classification. Stamps graph-level metadata (`schema_version: 1`, `coldpress_version`, `project_slug`, `counts`) on the output.
- **Secure-manifest adapter** (`src/graph/secure-manifest.ts`) — reads `secure/manifest.yaml` with the `yaml` package, emits one `CredentialName` node per declared key. Node carries only `id` / `label` / `file_type` / `source_file` / `coldpress` (no `service`, `required`, or `notes` fields). **Credential values are never read** — the adapter touches `manifest.yaml` only, never `secure/.env*`. Dedup-safe across repeated `mergeCredentialNodes()` calls. No-op when `manifest.yaml` is absent (valid state).
- **`coldpress graph rebuild` now runs the post-process chain** — after `python3 -m graphify.build` completes, the CLI reads the emitted JSON, runs `applySecureManifest` (appends CredentialName nodes), then `enrichGraph` (populates the coldpress namespace + graph-level metadata), and writes back. Fully deterministic if input corpus is unchanged. Edges from `CodeModule` → `CredentialName` (representing "code X reads env var Y") deferred to Block O2 — emitting them requires source-code scanning beyond what Graphify does natively.
- **43 new tests** in `test/graph-enrich.test.ts` covering: `inferDirRole` across all 15 path patterns (including `./` prefix tolerance), `inferEnvTag` for sandbox/live/neither, `inferNodeType` precedence (pre-set CredentialName wins → sacred → input → code L1 vs deeper line → audit → tracking yaml → fallback), full enrichment output shape + metadata stamping + non-mutation invariant, secure-manifest parsing (missing file, with keys, orphan entries), `buildCredentialNodes` no-leak assertion (node carries only the canonical 5 fields; no `service`/`required`/`notes`), `mergeCredentialNodes` dedup + non-overwrite, `applySecureManifest` composition, full post-process composition test. Total: **142 tests across 9 suites**.
- **`coldpress graph query` — skill-facing query CLI** (`src/commands/graph.ts`). Options: `--node-type`, `--dir-role`, `--env-tag` (node filters, AND-composed), `--relation` (edge filter), `--id` (exact lookup), `--neighbors <id>` (neighbourhood, composable with `--relation`), `--limit`, `--format json|pretty` (auto-defaults: pretty on TTY, json off). Output shape: `{ kind, query, data, count, graph_path }` with `kind` in `"nodes" | "edges" | "node" | "stats"`. Exit-code contract designed for skill fallback paths: **0** = query ran (may return empty set), **2** = no graph found (skills fall back to direct file reads), **1** = schema error or unexpected failure (skills surface error, don't fall back).
- **`docs/graph-query.md`** — query API spec: options, exit codes, output shape, the idiomatic skill pattern (try graph → fall back on exit 2), worked examples, performance notes, graph-first-skill-roster section.
- **2 context-gathering skills migrated to graph-first** (per plan §3.6 "replace 2-3 skills as proof"):
  - `skills/utilities/index-docs` — graph-first path for `_context/*` enumeration via `--dir-role` or `--node-type SacredDoc`; fallback on exit 2 to direct directory scan.
  - `skills/reviews/code-audit` — graph-first scope derivation via `--neighbors <story-id> --relation implements` + epic composition; fallback on exit 2 to git-diff / ls-based.
- **`plugin/skills/` regenerated** via `npm run build:skills` to keep the spec-compliant emissions in sync with source (CI drift check passes).
- **13 new tests** in `test/graph-query.test.ts` — exercises the CLI as a subprocess via `spawnSync` to test the exit-code contract the way skills will experience it. Covers: exit-2 on missing graph with machine-readable error payload, exit-1 on schema-invalid graph, exit-0 on success (including empty result sets), `--id` found / not-found, `--neighbors` + `--relation` composition, `--limit` caps `data.length` but `count` reports full total, JSON-output parseability (the skill contract), pretty-output human header, non-TTY → JSON default. Total: **155 tests across 10 suites**.
- **`skills/ingest/parse-document/`** — document-ingest skill with dual-backend routing between **markitdown** (Microsoft, MIT — text-native PDFs / Office / HTML, near-zero ML weight) and **Docling** (IBM, MIT — scanned PDFs / images / complex tables, ~500MB-1GB ML models on first use). Routing heuristic: PDFs try markitdown first with fallback to Docling on suspiciously short output; images always Docling; Office / HTML always markitdown; `.md` / `.txt` passthrough copy. Output lands at `_input/.parsed/<path>/<name>.md` preserving `_input/` subpath structure. Output is ready for `coldpress graph rebuild` to pick up on the next index pass.
- **Node entry `scripts/parse.mjs`** — pure Node orchestrator, no build dependency. Routes input by extension, spawns the right Python adapter, handles PDF fallback logic, writes output. Exits with clear install hints when Python or an adapter is missing. Companion `parse.d.mts` ambient declaration carries the routing contract into the TS test suite.
- **Python adapters** — `scripts/markitdown_adapter.py` + `scripts/docling_adapter.py`. Each is a minimal subprocess target: read input path from argv, convert via the upstream library, print markdown to stdout. Exit codes signal missing install vs runtime failure.
- **Ingest licence blocklist** documented in `docs/anthropic-skill-wrapping-audit.md` §Ingest. **Blocked:** Marker (GPL-3), PyMuPDF (AGPL-3), Surya (GPL-3), Unstructured (Apache-2.0 but heavy enterprise deps). Reconsideration policy: issue + concrete failure case + legal review before any release-notes reference.
- **17 new tests** in `test/parse-document-routing.test.ts` covering `routeFile` across PDF / Office / image / markdown / unsupported, case-insensitive extensions, extension-set invariants (no overlap between markitdown/docling/passthrough), `defaultOutputPath` subpath preservation + flattening, `parseArgs` for all flags, import-safety invariant (main() not triggered on module import). Total: **172 tests across 11 suites**.
- **Python 3.10+ added as an optional prereq** in `README.md` Install section and `docs/quick-start.md` Prerequisites table. Install command: `pip install graphifyy markitdown docling` (on demand at Phase 2).
- **Plugin tree regenerated** — parse-document joined the corpus: 75 SKILL.md files emitted (was 74). `skills_count` in `plugin/plugin.json` bumped.

### Changed — Wave 4 Block R

- **Phase → canonical subfolder mapping codified.** Every skill writes to one of **8 canonical `_context/*` subfolders** (sacred, planning, design, implementation, testing, tracking, handoffs, audit) or `_input/.parsed/` for ingest-shaped skills. Specialised categories nest under the most semantically appropriate canonical dir — no more top-level `_context/ops/`, `_context/reviews/`, `_context/creative/`, etc.
- **~16 skills renormalised to canonical roots:**
  - `_context/ops/` → `_context/audit/ops/` (7 ops health-check skills)
  - `_context/reviews/` → `_context/audit/reviews/` (5 review skills)
  - `_context/creative/` → `_context/planning/creative/` (6 creative skills)
  - `_context/meta/` → `_context/audit/meta/` (propose-change)
  - `_context/discussions/` → `_context/planning/discussions/` (party-mode)
  - `_context/extractions/` → `_input/.parsed/` (pdf-deep-parser — ingest-shaped)
  - `_context/distillates/` → `_context/planning/distillates/` (distillator)
  - `_context/docs/` → `_context/audit/docs/` (document-project — reverse-engineering)
- **`docs/phase-subfolder-mapping.md`** — authoritative mapping: the 8 canonical subfolders, what lives in each, phase → primary subfolder table, nesting conventions inside canonical dirs, migration table for pre-v0.3 paths, extension protocol.
- **`test/skill-output-paths.test.ts`** — regression test: scans every `SKILL.md` under `skills/` and `lifecycle/`, extracts `location:` values, asserts each roots under one of the 8 canonical `_context/*` dirs or a permitted non-context destination. Future skills that drift get caught at test time. 7 tests.
- Total: **179 tests across 12 suites.**

### Added — Wave 5 Block X (Phase-gate JSON protocol, plan §5.0)

- **`schemas/phase-gate.schema.ts`** — Zod schema for the phase-gate protocol. Three top-level types: `AcceptanceCheckSchema` (the unit of an exit criterion), `PhaseGateSchema` (a phase's gate document, schema_version pinned to `1`, phase clamped to 1-9, `acceptance_checks[]` non-empty), `GateEvaluationSchema` (the evaluator's output, `overall: pass | fail | pending-human`, ISO-8601 timestamp, blockers + warnings arrays). Every `AcceptanceCheck` is one of three `kind`s — `artefact-present` (requires `artefact_path`), `automated` (requires `skill_ref`), `human` (requires `human_approver`) — enforced by three Zod `.refine()` rules. `severity: block | warn | info` drives how a FAIL is treated at transition time.
- **9 × `lifecycle/<N>-<phase>/gate.json`** — one shipped gate per phase, covering Phase 1 Bootstrap through Phase 9 Evolve. Each gate declares its `entry_conditions`, its `acceptance_checks[]` (artefact-present for sacred docs, automated with `skill_ref` for validator-backed checks, human for user sign-off), and its `next_phase`. Phases 1-7 each carry at least one block-severity check (enforced by test); Phases 8 and 9 lean warn/info by design (operate/evolve are continuous, not transitioning).
- **`skills/governance/evaluate-phase-gate/SKILL.md`** — the evaluator skill spec. Reads a phase's `gate.json`, runs every `acceptance_check` (artefact-present asserts file exists; automated dispatches to `skill_ref` and interprets exit code; human checks for a sign-off record at `.coldpress/signoffs/<gate_id>/<check_id>.yaml`), aggregates by severity, emits a structured `GateEvaluation` to `_context/audit/gate-eval-phase-{N}-{date}.json` and to stdout. Exit-code contract: `0` = pass, `1` = block-severity fail, `2` = pending-human. Orchestrator (`wave-orchestration`) consumes the exit code at phase-transition time.
- **`docs/phase-gate-protocol.md`** — 4-layer protocol write-up: (1) the schema, (2) per-phase `gate.json`, (3) the evaluator skill, (4) orchestrator integration. Documents the three check kinds, the three severities, the `GateEvaluation` shape, the sign-off record convention (YAML at `.coldpress/signoffs/<gate_id>/<check_id>.yaml`), and the extension recipe (adding a new check, adding a new gate, schema-version bumps). Supersedes the prose-only `orchestrator/engine/gate-protocol.md` spec; "when prose disagrees with `gate.json`, trust `gate.json`" policy codified. Replaces prose-only exit conditions flagged as a scaling blocker in the framework audit (2026-04-23 §3, §9).
- **§5.1 security stack + §5.5–§5.7 LLM gates compose through this protocol** — no bespoke "security gate" or "LLM gate" layer. The Phase 7 `gate.json` has distinct `acceptance_check` entries with `skill_ref: "aggregate-gate-results"`, `skill_ref: "llm-quality-gate"`, etc.; the evaluator consumes each as a normal automated check. Gates compose; the protocol is single-surface.
- **17 new tests** in `test/phase-gate.test.ts`: `PhaseGateSchema` unit (accepts well-formed, rejects empty acceptance_checks, rejects phase outside 1-9, rejects schema_version ≠ 1); `AcceptanceCheckSchema` × kind invariants (automated requires skill_ref, human requires human_approver, artefact-present requires artefact_path, rejects unknown severity/kind); `GateEvaluationSchema` (valid shape, rejects malformed timestamp, rejects unknown status enum); shipped-gate integrity (all 9 phase dirs have `gate.json`, every gate validates against schema, every gate's `phase` matches its dir prefix, every `gate_id` follows `phase-N-exit`, phases 1-7 each have ≥1 block-severity check). Total: **196 tests across 13 suites**.
- **Plugin tree regenerated** — `evaluate-phase-gate` joined the corpus: 76 SKILL.md files emitted (was 75). `skills_count` in `plugin/plugin.json` bumped.

### Added — Wave 5 Block Y (§5.1 security stack + §5.2 governance)

**§5.1 — 5-scanner classical security gate**

- **`schemas/security-gate-result.schema.ts`** — normalised Zod schema for scanner output. Three types: `FindingSchema` (per-finding shape), `ScanResultSchema` (per-scanner run, `schema_version: 1`, ISO-8601 `scanned_at`, severity histogram), `AggregateResultSchema` (aggregator output, `overall: pass | fail`, `blockers[]`, policy). 5-rung severity ladder (`critical > high > medium > low > info`) with `SEVERITY_RANK` + `meetsThreshold()` helpers. `SeverityCountsSchema` enforces `total === sum(buckets)` via `.refine()`.
- **5 scanner wrapper skills** — each parses the scanner's native output and normalises to `ScanResult`:
  - [`skills/security/scan-code/`](skills/security/scan-code/) — Semgrep OSS (LGPL-2.1). ERROR → high, WARNING → medium, INFO → info.
  - [`skills/security/scan-secrets/`](skills/security/scan-secrets/) — Gitleaks (MIT). All findings → high by default. **Secret-value stripping guardrail:** the wrapper MUST drop `Secret`/`Match` from every finding (never persists raw leaked values to `_context/audit/`).
  - [`skills/security/scan-deps-and-containers/`](skills/security/scan-deps-and-containers/) — Trivy (Apache-2.0). Filesystem + container layers in one run. CRITICAL → critical, HIGH → high, MEDIUM → medium, LOW → low, UNKNOWN → info.
  - [`skills/security/scan-vulns/`](skills/security/scan-vulns/) — OSV-Scanner (Apache-2.0). CVSS-to-severity-ladder mapping codified (≥9.0 critical, 7.0-8.9 high, 4.0-6.9 medium, 0.1-3.9 low, unscored info).
  - [`skills/supply-chain/sbom/`](skills/supply-chain/sbom/) — Syft (Apache-2.0). Emits SPDX-JSON SBOM as the primary deliverable plus a `ScanResult` stub (zero findings; status tracks SBOM-generation health for gate hygiene).
- **`skills/security/aggregate-gate-results/`** — meta-skill the phase-gate evaluator dispatches to via `skill_ref: aggregate-gate-results` in Phase 7's `gate.json`. Wired as `coldpress security aggregate` CLI subcommand. Exit-code contract matches the evaluator: `0` pass, `1` fail or tool error. Loads every `(semgrep|gitleaks|trivy|osv|syft)-*.json` from `_context/audit/security/`, validates each against `ScanResultSchema`, loads waivers from `.coldpress/signoffs/security-gate/<finding-id>.yaml`, runs `aggregate()`, writes `AggregateResult` to `_context/audit/security/aggregate-{date}.json`.
- **Pure-function aggregator** at `src/security/aggregate.ts` — no disk access; caller assembles `ScanResult[]` + `GatePolicy`. Threshold-aware (`block_severity` default `"high"`) + waiver-aware. Unit-testable with fixtures.
- **`docs/security-gate.md`** — 4-part protocol: the 5 scanners, the normalised schema, the aggregator (pure-function + CLI), Phase-7 gate wiring. Extension recipes (sixth scanner, waivers, threshold tightening). Clarifies what's NOT in scope (IaC scanners, Sigstore signing, SBOM diffing — all deferred).

**§5.2 — governance**

- **`src/governance/validate-schema.ts` + `skills/governance/validate-schema/`** — Ajv-backed structural validator for sacred-doc frontmatter. In-process JS (no subprocess, no install). 5 JSON Schemas shipped at `schemas/sacred-docs/` (context, tech-stack, prd, architecture, pert-chart). Each requires `sacred: true`, `version`, `governance`, `workflowType`; doc-specific fields layer on (PRD `adr_references[]`, architecture `approvers[]`, pert `waves[]`). Uses `Ajv2020` + `ajv-formats` for draft-2020-12 + date formats. Validator cache prevents re-compilation across invocations.
- **`skills/governance/validate-sacred-doc/`** — Conftest (Apache-2.0) spec for semantic policy enforcement. Three seed Rego policies at `templates/governance/policies/`:
  - `prd_has_adr.rego` — PRDs must reference ≥1 ADR matching `ADR-NNNN`.
  - `architecture_has_approvers.rego` — architecture.md must carry ≥1 approver.
  - `pert_references_architecture.rego` — pert-chart.md must list architecture.md in `inputDocuments[]`.
  Structural-first, semantic-second run order documented. Subprocess adapter deferred pending Conftest install.
- **ADR scaffold** — `template/docs/adr/` seeded with `0000-use-adr.md` (Nygard ADR-0) + `README.md` (format reference + adr-tools link). `coldpress init` auto-copies the whole `template/` tree, so new projects are ADR-ready.
- **RFC template** — `templates/governance/rfc-amendment.md` (Motivation / Detailed design / Drawbacks / Alternatives / Open questions) + `template/docs/rfc/README.md` for consumer projects.
- **`docs/governance.md`** — protocol doc: the two validators, the ADR/RFC split, extension recipes, what's NOT enforced. Clarifies: no policy in coldpress-os is load-bearing in a way a project can't override.

**CLI + build**

- **`coldpress security aggregate`** CLI subcommand with `--block-severity`, `--input-dir`, `--output`, `--dry-run` options.
- **Runtime deps:** `ajv@^8.18.0` + `ajv-formats@^3.0.1`. Added to tsup `external` list to prevent re-bundling (matches the `yaml`/`zod` precedent).
- **Bundle:** 47.74 KB → 68.31 KB (+20 KB for the aggregator + Ajv validator).

**Tests**

- **52 new tests** — `test/security-gate-schema.test.ts` (20: severity enum, counts invariants, Finding/ScanResult/GatePolicy/AggregateResult shapes, `meetsThreshold` ranking), `test/security-aggregate.test.ts` (14: pass/fail, waivers, totals rollup, threshold at every rung, deterministic timestamp), `test/validate-schema.test.ts` (18: all 5 sacred-doc schemas, frontmatter extraction edge cases, docId override, `sacred: false` rejection, ADR-reference pattern enforcement). Total: **248 tests across 16 suites.**

**Plugin tree regenerated** — 76 → 84 SKILL.md files emitted (+5 scanner wrappers + aggregator + 2 governance skills).

### Added — Wave 5 Block Z (§5.3 BMAD-import bridge)

- **`src/imports/bmad.ts`** — one-way inbound adapter (pure core, no network). Reads a BMAD module directory (`config.yaml` + `agents/` + `workflows/` + `templates/`) and emits coldpress-os-shaped equivalents. Translation matrix:
  - `config.yaml` → module metadata (id / name / version / licence).
  - `agents/<name>.md` → `.claude/agents/bmad-<module>-<name>.md`. Persona body preserved verbatim; frontmatter synthesised (default model `sonnet`, standard tool set, `color: purple` to visually flag imports); original BMAD frontmatter preserved in a `<details>` block for reference.
  - `workflows/<name>/` → `coldpress-os/skills/meta/bmad-imports/<module>/<name>/SKILL.md`. Step files listed as opaque references (no logic synthesis); original `workflow.yaml` preserved in a fenced block.
  - `templates/` → `coldpress-os/templates/imports/<module>/` with `@coldpress-os:imported-from=bmad` comment header on text files; binary files copy verbatim.
  - Emits `ATTRIBUTION.md` at the import root listing source / imported / dropped / non-translating concerns / licence / review checklist.
- **`coldpress import bmad <source-dir>`** CLI subcommand wrapping the adapter. Options: `--module-slug <slug>` (override), `--overwrite` (default: refuse to overwrite; collisions land in `dropped[]`). Exit 0 on success (including partial imports), 1 on fatal errors.
- **`skills/meta/bmad-import/SKILL.md`** — skill spec documenting inputs / outputs / the lossy-translation contract / explicitly-not-translated items (BMAD runtime orchestration, `<commands>` blocks, `module-help.csv`, MetaGPT).
- **`docs/bmad-import.md`** — protocol doc: principles, translation matrix, marker convention (`@coldpress-os:imported-from=bmad`), ATTRIBUTION.md shape, why-not-MetaGPT rationale, extension recipes.
- **Test fixture** at `test/fixtures/bmad-minimal/` — hand-authored minimal BMAD module (2 agents, 1 workflow with step files + `workflow.yaml`, 1 template, `module-help.csv`). Exercises every transformation path. Lives outside the npm tarball (`test/` not in `files` whitelist).
- **12 new tests** in `test/bmad-import.test.ts` — slugify semantics, happy-path round trip (agents + workflows + templates + attribution), collision refusal without `--overwrite`, overwrite semantics, module-slug override, error path when `config.yaml` is missing, no-crash on optional-dir absence. Total: **260 tests across 17 suites.**
- **Bundle:** 68.31 KB → 85.77 KB (+17 KB for the adapter + CLI wiring).
- **Plugin regenerated** — 84 → 85 SKILL.md files.

**Explicit non-goals codified:**

- **MetaGPT inbound** — deferred indefinitely. Per BMAD-family brief §Q5, MetaGPT is adapter-hostile (Python classes with inline prompts, not declarative).
- **Outbound export** (coldpress-os → BMAD) — not planned; coldpress-os's canonical subfolder mapping + phase-gate protocol don't have BMAD equivalents.
- **Full behavioural fidelity** — structural translation only. Imported outputs are placeholders that need hand-review before being relied upon.

**Deferred — real-module validation against CIS, WDS, and BMAD's `bmm` core** pending local fixture availability. The adapter's heuristics may need tweaking for real-world BMAD conventions; add a fixture per module under `test/fixtures/` + smoke tests when they land (matches Block Y scanner-install-deferred precedent).

### Added — Wave 5 Block AA (§5.4 `<NEED_INFO>` protocol)

**Claim:** coldpress-os is the only BMAD-family framework with a named, protocol-level hallucination mitigation. Ports ChatDev's Communicative Dehallucination pattern as a first-class orchestrator message type across all 9 subagents.

- **`schemas/need-info.schema.ts`** — Zod types for `NeedInfoMessage`, `NeedInfoResolution`, `NeedInfoBudget`. 10 canonical uncertainty kinds (`prd-ambiguity`, `architecture-unclear`, `tech-stack-unclear`, `scope-boundary-unclear`, `acceptance-criteria-unclear`, `design-intent-unclear`, `process-step-unclear`, `credential-missing`, `handoff-shape-unclear`, `other`). `topic` is a kebab-case slug used by the retry-budget for bookkeeping. `DEFAULT_RETRY_BUDGET = 3`.
- **`src/need-info/parse.ts`** — pure-function parser. Extracts `<NEED_INFO>…</NEED_INFO>` tags from subagent text in two surface forms: **rich** (fenced YAML inside the tag with `topic` / `kind` / `context_refs[]` / `question`) or **terse** (just the question, routes to `kind: "other"` → human). Handles malformed payloads by collecting issues into `issues[]` instead of throwing. `renderNeedInfo()` round-trips a message back to canonical rich form; `deriveTopic()` produces stable kebab-case slugs from question text.
- **`src/need-info/route.ts`** — routing lookup. `NEED_INFO_ROUTES` maps each `kind` to its default upstream owner (one of the 9 subagents, or `"human"` for escalation). Budget-exhausted routing ALWAYS forces `"human"` regardless of kind. Full-coverage invariant — test enforces every Zod enum value has a route entry.
- **`src/need-info/budget.ts`** — `NeedInfoBudgetTracker` class for per-topic retry bookkeeping. Default limit 3; `spend(topic)` increments and reports whether the limit was crossed; `reset(topic)` clears on resolution; topics are independent. In-memory by default; the `NeedInfoBudget` shape is serialisable for future YAML persistence at `.coldpress/need-info/budgets.yaml`.
- **`orchestrator/engine/need-info-routing.md`** — canonical routing-table doc (10 rows, one per `kind`). Documents the retry budget, the two surface forms, how subagents invoke the protocol, how to add a new `kind`. Kept in lockstep with `src/need-info/route.ts` — test enforces it.
- **`docs/need-info-protocol.md`** — 4-layer protocol write-up: schema, parser, routing+budget, agent convention. Integration notes with phase-gate protocol (§5.0), handoff schemas (Wave 2 Block L), and sacred-doc governance (§5.2). Codifies what's NOT in this protocol: no auto-resolution, no nested NEED_INFOs, no cross-project routing.
- **All 9 subagent templates updated** (`template/.claude/agents/*.md`) — each carries a `## When to Emit <NEED_INFO>` section tailored to its role. Developer is the primary emitter; PM / Architect / Scrum-Master / UX-Designer / Valet are primary receivers; Analyst / QA / Communicator emit when upstream inputs are ambiguous. Every section references `coldpress-os/docs/need-info-protocol.md` using bare-inline-code convention (matches existing template path refs).

**Runtime orchestration deferred to Wave 6:** the schema + parser + router + budget are the stable substrate; full orchestrator dispatch (catching live emissions, suspending/resuming the emitter) requires the orchestrator shell Wave 6 delivers. For now the protocol is available to orchestration-aware skills and human consumers reading `_context/audit/need-info-log.md`.

**Tests**

- **34 new tests** in `test/need-info.test.ts` — covers schema invariants (kinds enum, message shape, resolution enum, budget shape), parser (terse + rich forms, malformed payloads, topic derivation, multi-tag parsing, render round-trip), routing (coverage invariant, canonical routes, budget-exhausted override), budget tracker (spend/exhaust/reset/independence/snapshot), and the 9-subagent convention (every template agent carries a NEED_INFO section + protocol-doc reference).
- Total: **294 tests across 18 suites.**

No new runtime deps; no new CLI surface this block (consistent with "substrate-only" scope — runtime wiring is Wave 6).

### Added — Wave 5 Block BB (§5.5–§5.7 LLM-specific gates)

Three non-overlapping LLM gates wrap cleanly into the §5.1 `ScanResult` schema. Together with §5.1's five classical scanners, Phase 7 now has gap-free coverage across classical (code / dep / secret) AND LLM-specific (correctness / regression / adversarial) surfaces.

- **`skills/deployment/llm-quality-gate/`** — wraps [DeepEval](https://github.com/confident-ai/deepeval) (Apache-2.0). Runs the project-declared metrics (default: faithfulness, hallucination, g_eval, answer_relevancy) against prompts/agents in `eval.targets[]`. Each failing metric → one `Finding` at `eval.deepeval.fail_severity` (default `high`). Dispatched by Phase-7 gate's `llm-correctness-gate` acceptance_check via `skill_ref: llm-quality-gate`.
- **`skills/deployment/prompt-regression/`** — wraps [Promptfoo](https://github.com/promptfoo/promptfoo) (MIT). Runs `promptfoo eval` against the project's `promptfooconfig.yaml` (default path; customisable). Each failing row → one `Finding` at `eval.promptfoo.fail_severity` (default `medium`). Dispatched by Phase-7's `llm-regression-gate`.
- **`skills/deployment/llm-security-scan/`** — wraps [Giskard](https://github.com/Giskard-AI/giskard) (Apache-2.0). Runs `giskard scan` against declared LLM endpoints. Native levels `major/medium/minor` map to `high/medium/low`; `eval.giskard.fail_severity` applies as a **floor** (raises sub-threshold findings without downgrading super-threshold ones). Dispatched by Phase-7's `llm-adversarial-scan`.
- **All three skills degrade gracefully** when the project's `coldpress.yaml` has no `eval:` block / no LLM endpoints / per-tool `enabled: false` — emit `status: "skipped"` ScanResults with zero findings. Non-LLM projects pass the LLM gates trivially.

**Schema + normalizers**

- **`schemas/eval-config.schema.ts`** — Zod schema for the `coldpress.yaml` `eval:` section. `EvalTargetSchema` (kebab-case id, prompt_ref, tool-extras) + per-tool `DeepEvalConfigSchema` / `PromptfooConfigSchema` / `GiskardConfigSchema`. Every sub-block carries `enabled: true` + a `fail_severity` default tuned to the tool.
- **`src/llm-gates/normalize-deepeval.ts`** — pure function mapping DeepEval's `test_cases[].metrics[]` output → `ScanResult`. Failing metrics become findings; successful metrics are ignored.
- **`src/llm-gates/normalize-promptfoo.ts`** — pure function mapping Promptfoo's `results.results[]` output → `ScanResult`. `gradingResult.reason` used as finding description; falls back to score-based synthesis.
- **`src/llm-gates/normalize-giskard.ts`** — pure function mapping Giskard's `issues[]` output → `ScanResult`. Codifies the severity-floor contract in `applyFloor()`.

**Docs**

- **`docs/llm-gates.md`** — 3-gate protocol write-up: non-overlapping-by-design claim, shared-schema rationale (everything is a `ScanResult`), configuration block, severity-mapping mechanics, Phase-7 wiring, extension recipes, explicit skips (Ragas, OpenAI Evals, LangChain benchmarks, TruLens, MLflow LLM per plan §5.5–§5.7).

**Tests**

- **20 new tests** in `test/llm-gates.test.ts` — `EvalConfigSchema` defaults + invariants, per-normalizer happy/sad paths, Giskard severity-floor mechanics at every rung, edge cases (empty results, unknown levels, missing fields). Each `ScanResult` output round-tripped through `ScanResultSchema` to verify contract compliance.
- Total: **314 tests across 19 suites.**

**Plugin regenerated** — 85 → 88 SKILL.md files (+3 LLM gate skills).

**Deferred:** subprocess adapter scripts for all three tools pending Python installs (matches Block Y scanner-install-deferred precedent). Normalizers are unit-testable without the tools present; adapter scripts translate tool CLI invocation → stdout capture → normalizer call.

**Deferred — `eval:` section row in `docs/coldpress-yaml-schema.md`** — avoided commingling with pre-existing un-staged `butler:` WIP in that file. Follow-up refresh to add the row when the butler section lands. Canonical schema in `schemas/eval-config.schema.ts` + docs in `docs/llm-gates.md` cover the shape in the meantime.

### Added — Wave 6 Block CC (§6.1 Graphify visualizer)

First Wave 6 block. Turns `.coldpress/graph/graph.json` into reviewable diagrams via four canonical subgraph builders and three output formats.

- **`src/graph/subgraphs/index.ts`** — four pure-function subgraph builders, each taking a `Graph` and returning `{ name, title, description, nodes, edges, layout }`:
  - `sacred-doc-lineage` — SacredDoc nodes + `descends_from` / `references` edges between them (tree layout).
  - `prd-to-impl` — forward traversal from PRD through `references` / `implements` / `descends_from` to epics → stories → CodeModules (tree layout).
  - `promotion-status` — all nodes tagged `env_tag ∈ {sandbox, live, both}` + any edges between them, including `promoted_from_sandbox` (cluster layout — groups by env_tag).
  - `deps` — CodeModule nodes + `imports_from` edges only (DAG layout).
  - `SUBGRAPH_REGISTRY` exposes builders by kebab-case slug; `listSubgraphNames()` + `getSubgraphBuilder()` for lookup.
- **`src/graph/render/mermaid.ts`** — Mermaid renderer. Shapes per `node_type` (SacredDoc `[[...]]`, CodeModule `(...)`, CredentialName `{{...}}`, CodeSymbol `((...))`, Input `[/.../]`). `classDef` colouring for sacred / sandbox / live / promoted / credential. Deterministic (input order preserved). Node cap default 150 (Mermaid chokes above ~200 in most viewers). `sanitise()` maps graph ids to Mermaid-safe `[A-Za-z0-9_]+` identifiers.
- **`src/graph/render/dot.ts`** — Graphviz DOT renderer. `rankdir` per layout (tree TB, dag LR); `cluster_N` subgraph blocks for cluster layout. Edge styles per relation (`promoted_from_sandbox` → bold, `superseded_by` → dashed). Node cap default 500. Coldpress-os emits DOT text; users pipe through `dot -Tsvg` / `-Tpng` / `neato` / `fdp` themselves.
- **`src/graph/render/html.ts`** — standalone interactive HTML renderer. Inlines graph-elements JSON + CDN `<script>` tag pulling Cytoscape.js (`unpkg.com/cytoscape`). Layout hint maps to Cytoscape (`breadthfirst` / `dagre` / `cose`). Legend + click-to-inspect UX built-in. `cytoscapeSrc` option overrides the CDN URL for offline rendering (Project Dashboard §6.10 will use this to serve Cytoscape from its own vendor dir). Node cap default 1000. HTML special chars in titles properly escaped.
- **`coldpress graph view <subgraph-name>`** CLI subcommand. Options: `--format mermaid|dot|html` (default `mermaid`), `--output <path>` (default stdout), `--max-nodes <n>` (renderer-specific defaults; `0` disables), `--cytoscape-src <url>` (HTML only). Exit codes: `0` rendered, `1` unknown subgraph / schema error, `2` no graph found.
- **`docs/graph-visualizer.md`** — visualizer protocol doc: CLI surface, the four canonical subgraphs, the three renderers, output determinism contract, extension recipe for adding a fifth subgraph, integration notes with the Project Dashboard (§6.10).

**Tests:** 31 new in `test/graph-visualizer.test.ts` — registry coverage, each subgraph builder against a hand-authored synthetic fixture carrying every `node_type` + `env_tag` + relation, Mermaid / DOT / HTML renderer invariants (shapes, cluster blocks, class definitions, sanitise, truncation, HTML escaping, Cytoscape layout mapping), real-httpx-fixture smoke. Total: **345 tests across 20 suites.**

**Bundle:** 85.77 KB → 105.35 KB (+20 KB for subgraph builders + 3 renderers + CLI wiring).

**Plugin:** unchanged — visualizer is core runtime, not a skill.

**Not in this block:**
- **SVG emission from coldpress-os itself.** Users pipe DOT through `dot -Tsvg`. Keeps package pure-JS; no Graphviz runtime prereq.
- **Graph query language** (plan §6.1 mentioned "documentation of graph query language"). `coldpress graph query` (Wave 3 Block N) already IS the query surface; re-documenting would duplicate `docs/graph-query.md`.
- **Graph diffing between commits.** Deferred to a Phase-7-gate integration if demand surfaces.

### Added — Wave 6 Block DD (§6.4 EventStream event log)

Append-only execution-trace representation persisted to `.coldpress/runs/<run-id>/events.jsonl`. Ports OpenHands' EventStream + Action/Observation/Condenser pattern. Not exposed to the LLM directly — purely for debugging, replay, gate evaluation, and the Project Dashboard (§6.10) Stats tab.

- **`schemas/event-stream.schema.ts`** — Zod discriminated union over 8 event kinds. Actions: `wave-start`, `wave-end`, `skill-invoke`, `gate-evaluate`. Observations: `skill-result` (paired via `cause_seq` to its invoke), `gate-pass`, `gate-fail` (with `blockers[]`). Meta: `condensation` (wave-boundary summary with `from_seq`/`to_seq` range). Common base fields enforce `schema_version: 1`, monotonic `seq`, kebab-case `run_id`, ISO-8601 `timestamp`. Phase clamped 1-9. `makeRunId()` emits `run-YYYYMMDD-HHMMSS-<6hex>` — lexicographic sort matches chronological order.
- **`src/event-stream/writer.ts`** — `EventStreamWriter.open(projectDir, { runId?, now? })` class. Resumption-safe: re-opening an existing run rehydrates `seq` from the last line. Single-writer-per-run assumption (not concurrency-safe by design; reader is independent). `append(input)` fills base fields, validates against `EventSchema`, writes one JSON line + `\n`. Idempotent `close()`. Refuses to write malformed events — throws with Zod issue list.
- **`src/event-stream/reader.ts`** — pure-function API: `readRun(runId, { projectDir? })` → typed `Event[]` in seq order; `listRuns({ projectDir? })` returns run ids sorted chronologically; `assertSeqIntegrity(events)` invariant check. Fail-loud error types: `EventStreamNotFoundError`, `EventStreamParseError` (carries line number). Blank lines tolerated; invalid JSON or schema-violating events never silently skipped.
- **`src/event-stream/inspect.ts`** — pure-function timeline renderer. Pretty-prints events with colour-friendly markers (`▶/■/✗` for wave start/success/fail, `→/←` for skill invoke/result, `✓/✗` for gate pass/fail, `◈` for condensation). Delta timestamps (`+Nms`) by default; `--time absolute` shows ISO. Summary footer aggregates kind counts + skill pass/fail + gate pass/fail.
- **`coldpress run list`** + **`coldpress run inspect <run-id>`** CLI subcommands. `list` returns chronological ids. `inspect` renders the timeline (exit `0` rendered, `2` run not found, `1` malformed stream). `--no-colour` / `--time delta|absolute` options. Auto-strips ANSI when stdout is not a TTY. **No write-side CLI** — event emission is an orchestrator-integration concern; programmatic API is `EventStreamWriter`.
- **`docs/event-stream.md`** — protocol doc: big-picture rationale, event-family tables, writer/reader invariants, CLI surface, integration points with §5.1 security gate and §6.10 dashboard, explicit non-goals (no runtime wiring yet, no snapshot/rewind, no cross-run correlation, no concurrent writers, no streaming read).

**Runtime wiring deferred to Wave 6 orchestrator follow-up** (§6.5 LangGraph checkpointer + later). Block DD ships the stable persistence substrate; skills and the phase-gate evaluator start emitting events when the orchestrator shell lands.

**Tests:** 29 new in `test/event-stream.test.ts` — `makeRunId` format + sortability, per-kind schema invariants, discriminated-union rejection paths (bad phase, non-slug run_id, malformed timestamp), writer (fresh + resume seq continuity, multi-append monotonicity, validation rejects malformed, idempotent close), reader (happy, not-found, malformed JSON, schema-invalid, blank-line tolerance), `listRuns`, `assertSeqIntegrity`, `renderTimeline` (empty stream, every badge kind, gate-fail visual, absolute/delta time-style). Total: **374 tests across 21 suites.**

**Bundle:** 105.35 KB → 117.60 KB (+12 KB for schema + writer + reader + inspector + CLI wiring).

**Plugin:** unchanged — EventStream is core runtime, not a skill.

### Added — Wave 6 Block EE (§6.2 @reviewer + §6.9 Vercel AI SDK tool-signature)

Two independent additions packaged as one block.

**§6.2 — `@reviewer` subagent (10th subagent)**

- **`template/.claude/agents/reviewer.md`** — pure-critic persona with read-only tools (`Read`, `Grep`, `Glob`); no Edit/Write/Bash. The read-only constraint is load-bearing — critics that can also produce tend to collapse reviewing into re-authoring. Model: `haiku` (rubric-grounding is high-recall low-creativity work). Color: `grey`. `maxTurns: 10`. Carries the standard `## When to Emit <NEED_INFO>` section per Block AA convention; defaults to `acceptance-criteria-unclear` (routes to @scrum-master) — reviewers don't typically emit `prd-ambiguity` themselves since the PM owns that route as receiver.
- **`schemas/reviewer-rubric.schema.ts`** — Zod schema for the `ReviewRubric` JSON output. `RubricRow` requires kebab-case `id`, `description`, `status` (`pass | fail`), `severity` (`low | medium | high`), `evidence` (quote/line ref FROM THE ARTEFACT — pure grounding), one-sentence `remediation` (gap statement, not a fix). `ReviewRubric` aggregates rows via `computeOverall(criteria)`: `pass` if every row passes, `fail` if any row is `status: fail` AND `severity: high`, `warn` otherwise. Schema enforces declared `overall === computeOverall(criteria)` via `superRefine` — no fudging the verdict.
- Reviewers write to `_context/audit/reviews/<artefact-basename>-review-{YYYYMMDD}.json` (per Block R canonical-subfolder mapping).
- **`docs/reviewer-subagent.md`** — protocol doc: hard-rule pure-critic table, canonical review pairings (PRD/architecture/stories/impl/NFR), rubric shape + aggregation rule, critical rules for the persona, integration with phase-gate / EventStream / NEED_INFO / interop generator. Explicit non-goals: no auto-remediation, no cross-artefact rubrics, no rubric versioning across runs, no skill dispatching from reviewer.
- **Interop generator unchanged** — `runInterop` reads `.claude/agents/*.md` dynamically, so reviewer.md is auto-included in AGENTS.md, .cursor/rules/reviewer.mdc, .roomodes (10 customModes), .openhands/microagents/reviewer.md, .clinerules. Test counts updated 9→10 in `test/interop.test.ts` (parser + file-count) and `test/need-info.test.ts` (subagent convention coverage).
- **Bundled-agent count: 10** — reviewer joins analyst / architect / communicator / developer / pm / qa / scrum-master / ux-designer / valet. Phase-gate-evaluator dispatch + reviewer invocation timing shipped as schema substrate; runtime wiring (orchestrator-level "review at phase boundary" hook) deferred to §6.5 checkpointer follow-up.

**§6.9 — Vercel AI SDK tool-signature convention**

- **`src/tool-signature/index.ts`** — `tool({ description?, parameters: ZodObject, execute: (args) => Promise<R> | R })` helper. **A convention, not a dependency.** TS-agent ecosystem has converged on this shape across Vercel AI SDK, Mastra, AgentKit; coldpress-os adopts the *shape* without inheriting `vercel/ai`'s heavy provider/runtime surface or Mastra's ELv2 licensing. Two responsibilities: (1) stamp `TOOL_SIGNATURE_MARKER` for reflective detection via `isTool(value)`; (2) validate `parameters` is a `z.object(...)` at the top level (rejects `z.string()` / arrays / non-Zod inputs at runtime — fail-loud). Compatible with Zod 3.25+ `_def.type` AND legacy `_def.typeName` discriminator.
- **`docs/agent-sdk-compatibility.md`** — protocol doc covering BOTH §2.13 (Claude Agent SDK type-conformance from Wave 2) AND §6.9 (this block). When-to-use: anywhere `@coldpress/core` exposes a tool-shaped primitive to third-party code. Today: nothing exposed publicly; future surface candidates include a post-v1.0 `@coldpress/sdk` package and plugin-marketplace skill-tool wrappers. Explicit non-goals: no execution runtime (Vercel AI SDK does that), no streaming, no tool-discovery API.

**Tests**

- **9 new in `test/reviewer-rubric.test.ts`** — enum coverage, `RubricRow` schema invariants (slug id, evidence non-empty), `computeOverall` aggregator at every rung (pass/warn/fail/fail-dominates-warn), `ReviewRubric` superRefine (rejects mismatched declared verdict), shape round-trip.
- **9 new in `test/tool-signature.test.ts`** — `tool()` happy + sync/async execute + rejection paths (non-Zod, non-ZodObject top-level, null), `isTool()` true/false coverage, marker presence.
- **Existing test updates:** `test/interop.test.ts` agent count + slug array + file count (23→25) + roomodes comment, `test/need-info.test.ts` AGENTS array + describe-block label (9→10).
- Total: 487 across 32 suites (additional suites are pre-existing un-staged user WIP — Block EE adds 18 new tests on top of Block DD's 374).

**Plugin:** unchanged — `@reviewer` is a subagent (not a skill); subagent definitions live in `template/.claude/agents/`, not `plugin/skills/`. Tool-signature helper is core runtime.

### Added — Wave 6 Block FF (§6.3 Project archetypes)

Specialise the framework WITHIN the 9-phase spine — never fork it. Schema + 4 v1 manifests + loader + doc shipped as substrate; `coldpress init --archetype` CLI wiring deferred until init.ts settles (see "deferred" note below).

- **`schemas/archetype.schema.ts`** — Zod schema for archetype manifests. Three override classes:
  - `subagent_overrides[]` — phase-specific subagent swaps (`{ phase: 1..9, replace, replace_with, reason }`).
  - `skill_overrides` — `{ disable[], enable[] }` with `superRefine` enforcing mutual exclusion (a skill can't be both disabled and enabled).
  - `template_overrides[]` — `{ template, source, reason }` for archetype-specific template presets.
  - Other fields: `schema_version: 1` literal, kebab-case `id`, `name` (≤80 chars), `description`, `status: experimental | stable`, `priority: 0..100` (reserved for future smart-detection), optional free-form `notes`. `SHIPPED_ARCHETYPES` registry pinned to the four v1 slugs.
- **`install/archetypes/{app-build,data-heavy,infrastructure,research}.yaml`** — 4 v1 manifests:
  - **`app-build`** (stable, priority 50) — the baseline. No overrides. The reference contract for "default coldpress-os".
  - **`data-heavy`** (experimental, priority 30) — Phase 6 + Phase 7 swap @developer for `data-interpreter` variant; PRD template leads with Hypothesis / Dataset / Success Metrics; disables `quick-dev`. Ports MetaGPT Data Interpreter pattern.
  - **`infrastructure`** (experimental, priority 30) — Phase 4 collapses @pm into @architect (IaC projects rarely have product-PRD shape); PRD template leads with Topology / SLO / Cost-target; architecture template adds Network Diagram + Failure Modes + DR sections; disables `quick-dev`.
  - **`research`** (experimental, priority 30) — Phase 6 swaps @developer for @analyst (research-as-impl); PRD template leads with Research Question / Hypotheses; disables `quick-dev`, `deploy`, `readiness-check`, `env-check`. Phase 7 deploy gate auto-passes when no `deploy:` config exists.
- **`src/archetypes/load.ts`** — pure-function loader. `loadArchetype(slug, { archetypesDir? })` reads the YAML, validates against `ArchetypeManifestSchema`, cross-checks `id === filename` (catches rename slips). `loadShippedArchetypes()` returns all 4 in registry order. `isShippedArchetype(slug)` type guard. Typed errors: `ArchetypeNotFoundError` (slug not on disk) and `ArchetypeManifestError` (YAML parse / schema-violation / id mismatch — surfaces specific issue paths).
- **`docs/archetypes-guide.md`** — protocol doc. Hard-rule "never fork the spine" table (✅ swap subagents / disable skills / override templates; ❌ add phases / change schema / bypass governance / etc.); the 4 v1 archetypes with override summaries; manifest shape; loader API; explicit non-goals (no multi-archetype composition, no runtime archetype switching, no smart auto-detection in v1, no project-local archetype overrides yet).
- **`package.json` `files` whitelist extended** with `install/` so consumers installing via npm can resolve archetype manifests at runtime.

**Deferred to a follow-up commit (rationale):** `coldpress init --archetype <name>` CLI wiring. `src/commands/init.ts` is in active flux at Block FF time (init-non-interactive flow + git-init + pre-commit-hook setup); layering `--archetype` on top would collide and risk breaking the in-flight refactor. Block FF ships the complete substrate (schema + manifests + loader) so the CLI integration is a small follow-up commit once init.ts settles. Same pattern as Block DD's "runtime wiring deferred" + Block EE's "reviewer dispatch at phase boundaries deferred" — substrate first, integrations follow.

The follow-up apply-time logic will:
1. Resolve the archetype (default `app-build` if no `--archetype`).
2. After `copyTemplate(...)` runs, walk `subagent_overrides[]` and replace `.claude/agents/<replace>.md` with the variant.
3. Walk `skill_overrides.disable` and skip wrapper generation under `.claude/skills/`.
4. Walk `template_overrides[]` and replace targeted templates.
5. Print the override list with reasons.
6. Write `coldpress.yaml` `archetype: <slug>` so future commands see it.

The `data-interpreter` and research-impl subagent variants are NOT shipped in v1 — they'll land alongside the CLI wiring follow-up. Until then, the schema validates structurally; apply-time will surface a clear error when CLI tries to swap a missing variant.

**Tests:** 26 new in `test/archetypes.test.ts` — schema invariants per override class, manifest defaults, loader happy + 4 sad paths (not-found / malformed YAML / id↔filename mismatch / specific Zod issue surfacing), shipped-archetype contract checks (each manifest validates, app-build is baseline, data-heavy + research swap subagent at Phase 6, infrastructure swaps @pm → @architect at Phase 4), `isShippedArchetype` type guard, disk↔registry coverage invariant. Total: **555 tests across 37 suites.**

**Plugin:** unchanged — archetypes are framework-level config, not skills.

### Added — Wave 6 Block GG (§6.10 Project Dashboard)

The user-added Wave 6 scope. Localhost-served single-page dashboard that aggregates project-management state from existing artefacts. Reflective of coldpress-os usage — NOT the product being built. Builds and evolves as the project grows; no separate authoring step.

- **`src/dashboard/server.ts`** — pure `node:http` server. Binds to 127.0.0.1 ONLY by design (single-user dev tool; no auth). Routes:
  - `GET /` → single-page HTML (renderDashboardPage)
  - `GET /api/<tab>` → JSON per tab (status / stats / sanity / tech-stack / todos / graph / quick-links)
  - `GET /graph/<subgraph>.html` → Block CC visualizer output for embedding via iframe
  - `GET /file/<path>` → static read-only file under projectDir; path-traversal hardened via `safeJoin()`
  - `GET /healthz` → `{ok: true}`
  - Other methods → 405 Method Not Allowed (read-only enforcement)
- **`src/dashboard/tabs/*.ts`** — 7 pure-function data assemblers. Each takes `projectDir`, returns typed JSON. No daemon state; every request reads fresh from disk:
  - `status.ts` — project identity (coldpress.yaml), current phase (latest gate-eval), gate-eval history, sacred-doc signoffs from `.coldpress/signoffs/<gate>/<check>.yaml`
  - `stats.ts` — skill-invocation totals + pass/fail + per-skill counts (from EventStream JSONL); sacred-doc presence (5 expected); graph node/edge count; recorded run count + latest
  - `sanity.ts` — 5 fail-loud panels (secure manifest, sacred-doc frontmatter, security gate aggregate, sprint-status freshness, open reviewer failures); aggregates to overall ok/warn/fail
  - `tech-stack.ts` — `_context/sacred/tech-stack.md` frontmatter rendered as JSON view
  - `todos.ts` — gate blockers (latest gate-eval), pending `kind: human` signoffs (cross-references shipped framework gates against signoffs on disk), open sprint-change-proposals
  - `graph.ts` — graph metadata + list of registered subgraphs; rendering happens via iframe
  - `quick-links.ts` — sandbox / live URLs + repo URL (from `coldpress.yaml`), 8 most recent audit JSON files, CHANGELOG link
- **`src/dashboard/render/page.ts`** — single-page HTML template. Vanilla JS for tab switching + per-tab polling. ~10 KB; CSS inline. Each tab fetches its endpoint independently every `pollIntervalMs` (default 10s) so a slow tab doesn't block fast ones. No websockets/SSE in v1 — naïve polling traded for dependency-lightness.
- **`src/commands/dashboard.ts`** — CLI runner. Logs URL on bind, opens browser if `--open`, blocks until SIGINT. Cross-platform `open` / `xdg-open` / `start` for browser launch.
- **`coldpress dashboard`** CLI subcommand wired in (with the same isolation pattern as Block DD — un-staged init.ts WIP on cli.ts preserved). Options: `--port <n>` (default 7777), `--open`, `--poll-ms <n>`.
- **`docs/dashboard.md`** — protocol doc covering quickstart, architecture, the 7 tabs, endpoint map, polling cadence, security posture (loopback only / no auth / read-only / path-traversal hardened / no telemetry), Cytoscape sourcing rationale, explicit non-goals (no file-watch v1, no authoring UI, no multi-project view, no mobile, no persistence, no auth/RBAC), extension recipe.

**Tests:** 32 new in `test/dashboard.test.ts`:
- Per-tab unit tests against synthetic fixture projects (empty + populated states for each of the 7 tabs)
- Integration tests spawning the server on port 0 (random), HTTP-GET each endpoint, asserting JSON shape + HTML render
- Read-only enforcement (POST → 405)
- Path-traversal: URL-encoded `..` returns 403 explicitly; plain `..` either 403 or 404 depending on URL normalisation (canonical contract is the encoded case)
- Loopback-only binding (server.host === "127.0.0.1")
- Total: **583 tests across 38 suites.**

**Bundle:** 117.60 KB → 183.78 KB (+66 KB for server + 7 assemblers + SPA template + CLI command).

**Plugin:** unchanged — dashboard is core runtime, not a skill.

**v1.5 follow-ups codified:**
- File-watch / SSE in place of polling (if jitter proves annoying)
- Vendored Cytoscape served from `/vendor/cytoscape.min.js` for offline graph rendering (currently CDN via Block CC's renderHtml default)
- htmx for richer interactivity if v1 vanilla JS proves too constrained

### Added — Wave 6 Block HH (§6.5 LangGraph checkpointer + §6.6 SWE-agent ACI)

Two related substrate additions packaged as one block. Both ship the schema + helpers + docs; runtime wiring stays deferred until the orchestrator shell lands (same pattern as Blocks DD/EE/FF/GG deferrals).

**§6.5 — Checkpointer + content-addressed skill cache**

Ports LangGraph's `BaseCheckpointSaver` + `interrupt()` primitive (interface, not the code) AND Prefect's content-addressed task cache pattern. Two distinct concepts sharing one schema file.

- **`schemas/checkpoint.schema.ts`** — Zod for two shapes:
  - `CheckpointSchema` — orchestrator-state snapshot at an interruptible point. Fields: `schema_version: 1`, kebab-case `run_id` matching the EventStream, ISO-8601 `created_at`, `last_event_seq`, `interrupt_kind` (5-rung enum: `phase-boundary | need-info | human-gate | manual | error`), `reason` (paragraph), opaque `state` (orchestrator authors layer their own Zod on top).
  - `SkillCacheEntrySchema` — content-addressed cache entry. Fields: `schema_version: 1`, SHA-256 `hash`, `skill_id`, `version_marker` (manual invalidation knob equivalent to Prefect's `cache_key_fn`), ISO-8601 `cached_at`, `result` ({exit_code, artifact_path?, message?} mirroring EventStream `skill-result` shape), `inputs` audit trail.
- **`src/checkpoint/save.ts`** — `saveCheckpoint(...)`. Atomic single-file writes (`tmp + rename`); no partial-write corruption survives a crash. Validates against schema before writing; refuses malformed.
- **`src/checkpoint/restore.ts`** — `readCheckpoint(...)`. Three typed errors: `CheckpointNotFoundError`, `CheckpointParseError` (schema violation with issue paths), `CheckpointDriftError` (live EventStream moved past `last_event_seq` — refuse to resume; state has drifted). `skipDriftCheck: true` for inspect-only callers (Project Dashboard); real resumption MUST verify.
- **`src/checkpoint/cache.ts`** — `hashInputs({skillId, versionMarker, args})` pure function emitting deterministic SHA-256 (canonical JSON key-sort; `{a,b}` and `{b,a}` hash identically; rejects non-finite numbers). `SkillResultCache` class with `get(hash)` (returns null on miss OR schema-invalid disk file — never throws hot-path) + `put(...)` (atomic write, validates entry). **Cache is NEVER load-bearing** — orchestrators MUST be able to fall back to running the skill if cache misses or is corrupted; codified throughout the doc.
- **`docs/checkpointer.md`** — protocol doc: two-distinct-concepts table, checkpoint shape + atomic-write rationale + drift-check semantics + time-travel recipe, cache shape + `version_marker` convention + trust posture + redaction-before-cache rule, explicit non-goals (no multi-checkpoint history, no distributed support, no encryption-at-rest, no TTL/GC, no cross-run cache sharing, no streaming updates).

**§6.6 — SWE-agent ACI command grammar (4 discipline-encoding skills)**

Ports the *interface*, not the Docker-sandbox runtime. Claude Code's existing `Edit` / `Read` / `Grep` / `Glob` / `Bash` tools provide the runtime; these skills add the discipline (bounded steps + verifier feedback + 2-fail escalation).

- **`skills/edit/aci-primitives/aci-edit/`** — bounded edit + immediate verifier feedback (typecheck/lint per file extension) before next step. Two-fail escalation budget. Rejects multi-edit batches; rejects `--no-verify` bypasses.
- **`skills/edit/aci-primitives/aci-scroll/`** — bounded read window + explicit cursor trailer (`→ cursor at line N; file ends at line M`). Multi-step file walks don't recompute position.
- **`skills/edit/aci-primitives/aci-search-dir/`** — capped-result Grep + structured `file:line:snippet` shape (one match per row). Default cap 50.
- **`skills/edit/aci-primitives/aci-find-file/`** — capped-result Glob + one-path-per-line shape. Default cap 25.
- All four tagged `phases: [6, 9]` (Implementation + Evolve, post-Phase-8-split).
- **`docs/aci-primitives.md`** — protocol doc: 4-skill table, why-interface-not-runtime rationale (port the discipline; don't port the sandbox), when ACI vs. raw tools, 2-fail escalation budget, example multi-step loop, explicit non-goals (no worktree primitive, no cross-language verifier registry, no diff-aware preview, no replay/record).

**Tests:** 26 new in `test/checkpoint.test.ts` — schema invariants per type, save (atomic write + overwrite semantics), restore (4 sad paths: not-found, malformed JSON, schema violation, drift), `skipDriftCheck` bypass, `hashInputs` invariants (canonical key-order, version_marker + skill_id + args sensitivity, 64-char hex output, non-finite rejection), `SkillResultCache` (miss returns null, round-trip preserves entry, schema-invalid disk treated as miss, put refuses malformed, schema acceptance). Total: **609 tests across 39 suites.**

**Plugin:** 90 SKILL.md emitted (+4 ACI primitives). Bundle: 183.78 KB → unchanged for Block HH (no CLI surface added; `coldpress run inspect` already covers checkpoint inspection via the EventStream tail; checkpoint-specific CLI is part of the deferred orchestrator wiring).

**Runtime wiring deferred to orchestrator shell:**
- `EventStreamWriter` integration with `saveCheckpoint()` at phase boundaries
- `<NEED_INFO>` emissions automatically authoring `interrupt_kind: need-info` checkpoints
- Skill-dispatch layer consulting `SkillResultCache.get(hash)` before invoking
- ACI-primitive dispatch from `@developer` / `@reviewer` orchestrator handoffs
- Project Dashboard checkpoint metadata panel (assembler trivial; pending dashboard tab work)

### Added — Wave 6 Block II (§6.7 MetaGPT prompt-pattern refactor)

Five MetaGPT-derived prompt patterns ported as discipline conventions for the highest-stakes skills. Pure markdown + template work — no runtime, no schema changes, no CLI surface.

**The 5 patterns (documented in `docs/prompt-patterns.md`):**

1. **Inline section-level meta-descriptions** — each template section carries a short italicised description stating what belongs there; the output degrades gracefully when a section is unclear.
2. **"ATTENTION" preamble with numbered imperatives** — for machine-parsed outputs (PERT DAG, epic sharding). Imperatives resist paraphrase; prose advice doesn't.
3. **Forcing-function artefacts** — mandatory Mermaid diagrams / tables make skipped analysis reviewable. Empty cells / missing diagrams = visible gaps.
4. **Tripartite code-review CoT scaffold** — review triangle (correct / safe / maintainable) + `file:line`-grounded evidence + threshold-driven remediation. Ports into Block EE's `ReviewRubric.RubricRow.evidence` convention.
5. **Closing "Output Contract" block** — restates the format spec at generation time. The repetition is load-bearing.

**Reusable snippet library** at `templates/prompt-snippets/` — 5 copy-paste-ready fragments with placeholders:
- `attention-preamble.md` — Pattern 2 scaffold
- `forcing-function-mermaid.md` — Pattern 3 Mermaid example
- `forcing-function-table.md` — Pattern 3 table example
- `review-cot-triangle.md` — Pattern 4 triangle scaffold (review grounding + evidence-citation rules)
- `output-contract.md` — Pattern 5 scaffold

Each snippet carries an HTML-comment provenance header citing `§6.7` + `docs/prompt-patterns.md` (test-enforced).

**Retrofitted 3 canonical high-stakes skills:**

- **`lifecycle/4-planning/create-prd/SKILL.md`** (v1.0 → v1.1) — added Output Contract (Pattern 5) referencing the template's 12-section structure + frontmatter invariants incl. `adr_references` per `prd_has_adr` Rego policy.
- **`lifecycle/4-planning/create-architecture/SKILL.md`** (v1.0 → v1.1) — added Forcing-function artefacts (Pattern 3 — mandatory Component Interaction Diagram via Mermaid + mandatory Failure Mode Enumeration table with 5-row/4-column floor) + Output Contract (Pattern 5) with `approvers[]` + `inputDocuments[]` + `adr_references` invariants.
- **`lifecycle/7-breakdown/parallelization-strategy/SKILL.md`** (v1.0 → v1.1) — the full treatment:
  - ATTENTION preamble (Pattern 2) — 5 non-negotiable imperatives: exact column order, numeric wave ids, one-wave-per-epic invariant, kebab-case Epic slug matching, no prose-between-DAG-and-table.
  - Forcing-function artefacts (Pattern 3) — mandatory DAG Mermaid + wave grouping table (ATTENTION-enforced columns) + critical-path table with explicit `0` for critical-path slack (no blanks).
  - Output Contract (Pattern 5) — frontmatter per `pert-chart` JSON schema, section order, confirmation format with wave count + critical-path length.

**What's NOT in this block (explicit):**
- Rewriting sacred-doc templates beyond Pattern 1 (inline meta-descriptions) — templates (`templates/documents/*.md`) retain their current shape; deeper restructuring is follow-up.
- A scaffold-time prompt-pattern linter — would need orchestrator shell (deferred).
- Porting every MetaGPT pattern — 5 is the starting set per tier3-positioning-brief-2026-04-22.md §7.2; more when specific needs surface.
- Schema-level enforcement of Pattern 3 forcing-functions — they're drafting discipline + review concern, not Zod constraints. The downstream parser still accepts output missing the diagram; review catches it.

**Tests:** 9 new in `test/prompt-patterns.test.ts`:
- High-stakes skill coverage: each of the 3 retrofitted skills has the required pattern markers (Output Contract / ATTENTION / Mermaid forcing) per a declarative `HIGH_STAKES_SKILLS` spec in the test file — adding a new skill to the set updates the spec.
- Every retrofitted skill references either `docs/prompt-patterns.md` or `templates/prompt-snippets/` or `§6.7` for provenance.
- Snippet-library shape: all 5 canonical snippets present; every snippet carries the HTML-comment provenance header citing `§6.7` + the patterns doc.
- `docs/prompt-patterns.md` self-consistency: 5 pattern sections present; applied-set table mentions each retrofitted skill by name.
- Total: **618 tests across 40 suites.**

**Bundle:** unchanged (no code surface).

**Plugin:** regen will pick up the 3 SKILL.md revisions on next `build:skills`; plugin/ intentionally not staged (still commingles with user-WIP source skills — same rationale as Block HH).

### Added — Wave 6 Block JJ (§6.8 `@coldpress/otel-exporter`)

**The final Wave 6 block.** Optional observability sidecar shipped as a **separate npm package** (`@coldpress/otel-exporter`) that re-emits the §6.4 EventStream JSONL as OpenLLMetry-conformant OpenTelemetry spans. `@coldpress/core` stays dep-free of observability tooling by design; users who want Langfuse / Arize Phoenix / Jaeger / Tempo / Honeycomb ingest install the exporter separately.

- **`packages/otel-exporter/`** — new monorepo-sibling package alongside `@coldpress/core`. Standalone `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `LICENSE`, `NOTICE.md`, `README.md`. **No workspace wiring added to core** — the exporter reads the JSONL protocol directly (protocol-over-product, same decoupling pattern MCP / BMAD / Neuma adopted) and never imports from `@coldpress/core`. Its own `src/event-schema.ts` mirrors core's schema with `schema_version: 1` pinning; drift between core and exporter surfaces at parse time, never silently.
- **`packages/otel-exporter/src/event-schema.ts`** — Zod discriminated union over the 8 event kinds, mirrored from `schemas/event-stream.schema.ts`. Contract pinned at `schema_version: 1`; schema evolution in core requires a coordinated bump in the exporter.
- **`packages/otel-exporter/src/reader.ts`** — `readRun(runId, { projectDir? })` and `listRuns({ projectDir? })` mirroring core's reader. Fail-loud typed errors (`EventStreamNotFoundError`, `EventStreamParseError`); blank lines tolerated; malformed JSON / schema-violating events never silently skipped.
- **`packages/otel-exporter/src/ids.ts`** — deterministic SHA-256-truncated trace/span id derivation. `deriveTraceId(runId)` → 32-char hex (16 bytes); `deriveSpanId(runId, seq)` → 16-char hex (8 bytes). Re-running the exporter on the same run produces identical ids; backends that dedupe on ids (Jaeger, Tempo, Langfuse) handle re-emission cleanly. Guards against the forbidden all-zero id.
- **`packages/otel-exporter/src/conventions.ts`** — OpenLLMetry (Traceloop) attribute-name constants + a private `coldpress.*` namespace. Span-kind taxonomy (`workflow` / `task` / `agent` / `tool`); resource-attribute names; instrumentation-scope identity. Exported at the `@coldpress/otel-exporter/conventions` subpath for third-party integrations.
- **`packages/otel-exporter/src/mapper.ts`** — pure function `mapRunToSpans(events, options)` → `{ traceId, resource, spans: ReadableSpan[] }`. Mapping matrix (per plan §6.8):
  - `run_id` → trace (deterministic 16-byte id)
  - `wave-start` + `wave-end` → workflow span (`traceloop.span.kind = "workflow"`), status OK on `success`, ERROR on `failure`/`interrupted`
  - `skill-invoke` + `skill-result` → task span parented to its wave; status ERROR on non-zero `exit_code` with `exit_code=N` message fallback
  - `gate-evaluate` + `gate-pass`/`gate-fail` → task span parented to its wave; status ERROR on fail with `blockers` joined into the status message + JSON-encoded into `coldpress.gate.blockers_json`
  - `condensation` → span event on its wave span
  - Orphan actions (no matching observation) → UNSET status with "without matching …" message. Interrupted runs stay inspectable.
- Action/Observation pairing prefers `cause_seq`, falls back to `skill_id` / `gate_id` within the open set of the current wave. Cross-run events are refused at the top level (mapping is per-run).
- Resource attributes: `service.name` (default `coldpress-os`, honours `--service-name` CLI flag and `OTEL_SERVICE_NAME` env var), `service.version` (optional), `coldpress.project_slug` (optional), plus a free-form `extraResourceAttributes` escape hatch.
- Span emission is stably ordered by start time → seq tiebreak, so snapshot diffs against the same run are deterministic.
- **`packages/otel-exporter/src/exporter.ts`** — thin wrapper over `@opentelemetry/exporter-trace-otlp-http`. `createOtlpExporter({ endpoint?, headers?, timeoutMillis?, exporterOptions? })` + promisified `exportSpans(exporter, spans)`. Honours standard OTel env vars (`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_EXPORTER_OTLP_TRACES_HEADERS`). No coldpress-os-specific transport config. `exportSpans` rethrows on `FAILED` so the CLI exits non-zero instead of silently dropping spans.
- **`packages/otel-exporter/src/cli.ts`** — `coldpress-otel-export` binary. Options: `--run <id>`, `--latest`, `--all`, `--list`, `--project-dir`, `--endpoint`, `--header <k=v>` (repeatable), `--service-name`, `--service-version`, `--project-slug`, `--dry-run`, `--quiet`. Exit codes: 0 OK (including "no runs on disk"), 1 runtime failure (malformed stream / OTLP transport failure), 2 run not found or no selection flag given. `--dry-run` maps spans and reports counts without sending — unblocks CI use under no-network conditions.
- **`packages/otel-exporter/src/index.ts`** — public barrel: `mapRunToSpans`, `createOtlpExporter`, `exportSpans`, `readRun`, `listRuns`, id helpers, schema, conventions. Enables programmatic use alongside the CLI.
- **Runtime deps** (Apache-2.0, all `external` in tsup): `@opentelemetry/api`, `@opentelemetry/sdk-trace-base`, `@opentelemetry/exporter-trace-otlp-http`, `@opentelemetry/resources`, `@opentelemetry/semantic-conventions`. Plus `commander` (MIT, CLI) and `zod` (MIT, schema). Zero runtime bundle — ESM externals resolved from `node_modules` at execution time.
- **`packages/otel-exporter/README.md`** — CLI reference, mapping table, attribute conventions, determinism + idempotency claim, programmatic API snippet, exit-code contract.
- **`packages/otel-exporter/NOTICE.md`** — Apache-2.0 attribution for OpenTelemetry JS (consumer, not derivative — no upstream source vendored) and OpenLLMetry (attribute-name conventions only, no code imported). Licence-compatibility table.
- **`packages/otel-exporter/LICENSE`** — MIT with explicit Apache-2.0 runtime-dep note; points at NOTICE.md.
- **`docs/observability-setup.md`** — user-facing setup doc (lives in core's `docs/`, not in the exporter package). Three paths:
  - **Langfuse (MIT, recommended)** — `git clone && docker compose up -d` one-liner; OTLP endpoint + basic-auth header env-var pattern documented
  - **Arize Phoenix (⚠ Elastic License 2.0 — flagged)** — ELv2 caveat prose ("source-available, not OSI-approved"; restricts competing managed services; internal use typically fine but check legal before embedding); Docker one-liner
  - **Any other OTLP/HTTP backend** — Jaeger/Tempo/Honeycomb/Datadog/Signoz examples
  - Explicit-skips table (Helicone, W&B Weave, MLflow LLM, TruLens) with rationales
- **Decoupling rationale codified** in README + observability-setup.md: EventStream JSONL stays source-of-truth and offline-capable; exporter is pure indirection. Same architectural pattern MCP / BMAD / Neuma all adopted — protocol over product.

**Tests:** 5 suites / ~50 tests in `packages/otel-exporter/test/`:
- `ids.test.ts` (9) — 32/16-char lowercase-hex invariants, determinism per (runId, seq) pair, cross-run/seq distinctness, negative/non-integer seq rejection
- `event-schema.test.ts` (13) — every kind accepted, schema_version/phase/kebab-case rejections, gate-fail `blockers[]` required
- `reader.test.ts` (7) — happy path, blank-line tolerance, EventStreamNotFoundError/ParseError paths (bad JSON + schema-invalid), `listRuns` empty + chronological ordering
- `mapper.test.ts` (11) — minimal-run shape (wave → skill → gate parentage + statuses + OpenLLMetry + coldpress attrs + deterministic ids), gate-fail ERROR + blockers, non-zero exit_code ERROR + message fallback, condensation → span event, orphan UNSET, cause_seq fallback by skill_id, cross-run refusal, service-name from options + OTEL_SERVICE_NAME env var, stable emission ordering, round-trip idempotency, empty-input rejection
- `cli.test.ts` (9) — no-selection-flag → exit 2, `--list` → stdout run ids, `--list` on empty project → stderr note, `--dry-run` skip emission, `--latest`/`--all` + `--dry-run` scope check, `--run` on missing run → exit 2, `--quiet` suppresses progress
- `exporter.test.ts` (4) — `createOtlpExporter` shape check, `exportSpans` forwards, no-op on empty array, rethrows on FAILED result

**Test strategy:** OTel deps don't need to install to exercise the mapper / ids / reader / cli (zero-network surface); `exporter.test.ts` uses a fake `SpanExporter` satisfying the interface. Running tests requires `cd packages/otel-exporter && npm install && npm test` — kept separate from core's `npm test` by design (the exporter is optional).

**Bundle:** no change to `@coldpress/core` bundle — the exporter is a sibling package, not a dep. Exporter bundle is built lazily via its own `tsup` (source entries `index.ts`, `cli.ts`, `conventions.ts`; all OTel + commander + zod externalised).

**Plugin:** unchanged — exporter is a separate package, not a coldpress-os skill. Composes via OTLP, not `plugin/skills/`.

**Explicit non-goals (codified in docs/README):**
- **No live instrumentation.** The exporter is a *backfill over persisted JSONL*, not an in-process tracer. Live orchestrator-side emission is a future block; deferring avoids coupling `@coldpress/core` to OTel runtime.
- **No bundling into `@coldpress/core`.** Preserves "npm install and go" DX for users who don't want observability tooling.
- **No gate-evaluation wiring.** Phase 7's `llm-correctness-gate` staying a missing-trace health signal is a future `@coldpress/core` follow-up — the exporter has no opinion about it.
- **No coldpress-os-specific auth layer.** Users wire Langfuse API keys / Honeycomb tokens via standard OTel header env vars; no bespoke secret handling.

**Wave 6 status:** All 10 §6.x blocks (CC + DD + EE + FF + GG + HH + II + JJ) shipped. v0.3+ tag + publish stays deferred per the 2026-04-24 ship-gate directive (both phase-i AND phase-ii implementation plans must be complete before tagging).

### Added — Wave 6 plan amendment: §6.10 Project Dashboard (user directive 2026-04-24)

Added to plan §6 after Block CC kickoff. A localhost-served single-page dashboard that aggregates project-management state (status / stats / sanity / tech-stack / to-dos / graph / quick links) from existing artefacts. Reflective of the coldpress-os usage, NOT the product being built. Dependency-light (hand-rolled HTML + vanilla JS, optionally htmx); read-only; binds to 127.0.0.1 only; no auth. Ships as Block GG, depends on Block CC (§6.1 visualizer) + Block DD (§6.4 EventStream). Wave 6 completion gates updated. Sequencing: CC → DD → EE → FF → GG → HH → II → JJ.

**Additional ship-gate directive (2026-04-24):** nothing ships until BOTH phase-i AND phase-ii implementation plans are complete. v0.3+ tags and publishes stay deferred until both plans are done.

### Deferred (tracked for Wave 3 Block O2 / future waves)

- **Source-scan edges** from `CodeModule` → `CredentialName` nodes — requires reading source-code content beyond what Graphify emits. Block O2.
- **File-watch / incremental re-indexing / sandbox-to-live promotion detection** — Block O2.
- **SQLite + sqlite-vec** secondary data store — post-v0.3 if/when corpus sizes or vector-retrieval needs demand it.
- **Graph-query benchmark against real consumer graph** — awaits a populated real-project graph; revisit when we have one.
- **Per-skill yaml write-back implementation** (skills emitting `produced_by` + typed sidecars) — Wave 4 Lifecycle Alignment.

### Deferred (planned for later blocks / waves)

- **SQLite + sqlite-vec layer** (plan §3.7) — secondary data store for FTS5 full-text + vector search over graph nodes. Skipped for v0.3 because JSON + in-memory query is sufficient at the corpus sizes we care about (<10k nodes per project). Revisit when queries get slow or vector retrieval becomes load-bearing.
- **Graphify schema reshape to coldpress-os folder semantics** — the enrichment pass landed in Block O1: `src/graph/enrich.ts` post-processes Graphify's output to populate `coldpress.{node_type, env_tag, dir_role}` on every node based on path + `file_type`; `src/graph/secure-manifest.ts` emits `CredentialName` nodes from `secure/manifest.yaml`. `coldpress graph rebuild` now runs the enrichment automatically after Graphify completes. File-watch / git-aware / sandbox-to-live promotion detection are a separate concern, deferred to Block O2.
- **`coldpress doctor`** — upfront Python/pip/graphify probe as a standalone command. `graph rebuild` probes the same way inline today.

---

## [0.2.0-alpha] — 2026-04-23

### Added

- **npm package foundation** (`@coldpress/core`). TypeScript source under `src/`, built with tsup to `dist/`. Test harness: vitest. Runtime deps: `commander` (CLI), `@clack/prompts` (interactive prompts), `picocolors` (terminal colors). Dev deps: `typescript`, `tsup`, `vitest`, `@types/node`. `package.json` `files` whitelist controls the tarball (ships: `dist`, `template`, framework dirs, docs, licence/notice/readme/changelog; does not ship: `test`, `node_modules`, source `.ts` files). Engine floor: Node >= 20.
- **`coldpress` CLI — full command surface.** Four commands:
  - `coldpress init [project-name]` — interactive scaffold. Uses `@clack/prompts` for the gather flow (project name, slug, user name), confirms target directory, runs the full scaffold: template copy with placeholder substitution (`{project.name}`, `{project.slug}`, `{user.name}`), framework copy into `<project>/coldpress-os/`, `.claude/skills/` wrapper generation (one per non-router, non-stack-pack skill). Collision-safe — aborts if `coldpress.yaml`, `coldpress-os/`, or `.claude/` already exist in the target directory.
  - `coldpress --version` / `-v` — prints the installed version.
  - `coldpress feedback` — opens `github.com/coldpress-labs/coldpress-os/issues/new/choose` in the user's default browser (platform-dispatched: `open` on macOS, `xdg-open` on Linux, `start` on Windows).
  - `coldpress upgrade` — prints `npm update -g @coldpress/core`.
- **Test harness exercised:** 10 tests across two suites — `frontmatter.test.ts` (6) for the minimal YAML extractor, `init-scaffold.test.ts` (4) including an end-to-end tmpdir scaffold that verifies template copy, placeholder fill, framework copy, and wrapper generation produce the expected structure + content.
- **Interop generator** — reads `.claude/agents/*.md` as the single source of truth and emits five adjacent agent-format surfaces in one pass:
  - `AGENTS.md` at repo root (vendor-neutral — consumed by Aider / Sourcegraph Cody / any `AGENTS.md`-aware agent).
  - `.cursor/rules/<slug>.mdc` (one per subagent; 2025 `.mdc` frontmatter schema with `alwaysApply: false`) + legacy `.cursorrules` at repo root.
  - `.roomodes` (Roo / Kilo `customModes[]` YAML with tool translation: Read/Grep/Glob → `read`, Edit/Write → `edit` with `fileRegex`, Bash → `command`, WebFetch/WebSearch → `browser`, Task/Agent → `mcp`).
  - `.openhands/microagents/<slug>.md` (one per subagent; `type: repo` + `agent: CodeActAgent`).
  - `.clinerules/00-project-context.md` + `.clinerules/10-sacred-docs.md` (Cline / Roo / Kilo compat).
  Every generated file begins with the `@coldpress-os:managed` marker (Projen convention). Single-file outputs (`AGENTS.md`, `.roomodes`, `.cursorrules`) respect the marker — `coldpress update` refuses to overwrite files missing it. Per-subagent directories (`.cursor/rules/`, `.openhands/microagents/`, `.clinerules/`) are overwritten wholesale. Runs automatically at the end of `coldpress init`; `coldpress update` regenerates from scratch. Documented in `docs/interop-generator.md`.
- **`coldpress update` command** — regenerates all five interop surfaces; refuses to run outside a coldpress-os project (looks for `coldpress.yaml` + `.claude/agents/`).
- Runtime dep: `yaml` `^2.6.0` (for `.roomodes` emission; reused by future yaml write-back work).
- **SKILL.md generator — Agent Skills spec compliance.** Build-time generator (`src/generators/skill-md-generator.ts`) that reads coldpress-os's internal rich-frontmatter SKILL.md files from `skills/` and `lifecycle/`, transforms to the Agent Skills spec shape, and emits `plugin/skills/<name>/SKILL.md` (74 skills after router exclusion). Field mapping: rich `name` → spec `name` (validated `/^[a-z][a-z0-9-]*$/`, ≤64 chars, parent-dir match); rich `description` → spec `description` (≤1024 chars); `license: MIT` constant; `agent` + `phase` / `phases[0]` → `compatibility` prose; `tools[]` → space-separated `allowed-tools`; `version` passthrough. Internal-only fields (`type`, `category`, `inputs`, `outputs`) are dropped from spec output. Progressive-disclosure ceiling (500 lines) surfaced as warning, not enforced. Run via `npm run build:skills` (uses `tsx` devDep for TS execution outside the bundle).
- **`plugin/plugin.json`** — Claude Code plugin marketplace manifest at `plugin/plugin.json`. Hand-authored metadata (name, version, description, author, license, homepage, repository, category, keywords); `skills_count` + `generated_at` refreshed by `build:skills`. `/plugin marketplace add coldpress-labs/coldpress-os` will resolve against this tree.
- **Anthropic skill wrapping** — 4 subagents updated with "External Skills" delegation sections: `@communicator` (docx/pdf/pptx/xlsx via `document-skills` plugin — source-available, marketplace-install-only), `@qa` (webapp-testing via `example-skills`), `@architect` (mcp-builder via `example-skills`), `@valet` (skill-creator via `example-skills`; bundled-agent pattern decision: flatten). `coldpress init` now closes with the two `/plugin install` commands. New doc `docs/anthropic-skill-wrapping-audit.md` captures the license-hygiene table, the flatten decision, and the remaining-skills audit plan.
- `docs/skill-md-generator-spec.md` — canonical spec doc for the generator: input format, output format, field mapping, validators, skipping rules, extension points.
- Dev dep: `tsx` `^4.21.0` for running `src/generators/build-skills.ts` directly outside the tsup bundle.
- **Local project registry** (`src/utils/registry.ts`). First-write creates `~/.coldpress/registry.json`; subsequent `coldpress init` runs append entries. Schema: `{ version: 1, projects: [{ slug, path, created, version }] }`. Dedup by absolute path (re-init over the same dir replaces the entry). Opt-out via `COLDPRESS_NO_REGISTRY=1`. Failures (disk/permissions) never block init — registry is a courtesy. Public API: `readRegistry`, `recordInit`, `listProjects`, all with `{ registryPath }` override for testing. Exercised by 11 tests in `test/registry.test.ts`.
- **Claude Agent SDK compatibility smoke test** (§2.13). `test/agent-sdk-compat.test.ts` asserts our `.claude/agents/*.md` tree conforms to `AgentDefinition` from `@anthropic-ai/claude-agent-sdk` at both compile-time (TypeScript type-check via a `toAgentDefinition` mapper — breaks on required-field regressions) and runtime (every agent has non-empty description, prompt, valid model alias, valid tool names). Tests do NOT spin up live sessions — `query()` / `startup()` require credentials and network, inappropriate for credential-free CI. Interactive Claude Code usage remains the dev-time runtime. Dev dep added: `@anthropic-ai/claude-agent-sdk@^0.2.118`.
- **Bug caught in development:** `readRegistry` returned a shared module-level `EMPTY_REGISTRY` singleton; `recordInit`'s mutation then polluted subsequent reads. Test isolation failed silently when re-running the suite (alpha entries leaked into "empty" tests). Replaced the singleton with a factory (`emptyRegistry()`) returning a fresh object per call. Classic JS footgun; test suite caught it on the first full run.
- **README rewrite — npm-first install.** `npm install -g @coldpress/core` is the canonical install path; git-submodule install path retired (confirmed 2026-04-23: no external submodule consumers). README calls out both runtime compatibilities (Claude Code CLI + Agent SDK). Command surface documented inline. Added links to all docs (interop generator, SKILL.md generator spec, Anthropic wrapping audit, yaml schema, secure pattern) that landed in Waves 1–2.
- **`docs/quick-start.md` rewrite.** Zero-to-running-project in 10 minutes on the npm flow: install → `coldpress init` → tour → start Claude Code → install Anthropic companion plugins. Replaces the prior submodule-based walkthrough.
- **GitHub Actions workflows.** `.github/workflows/ci.yml` runs on every PR + push to main — typecheck, build, tests, `build:skills` + drift-check (fails if `plugin/` isn't up-to-date with source). `.github/workflows/release.yml` runs on `v*` tag push — same validation + creates a GitHub Release with auto-generated notes (pre-release flag set for `-alpha` / `-beta` / `-rc`). `npm publish` step ships commented-out in the workflow; enable by uncommenting after adding `NPM_TOKEN` secret (publishing is deliberately a manual step for v0.2).
- **Deterministic `plugin/plugin.json`.** Removed `generated_at` timestamp from the `build:skills` output so the drift check is meaningful — the file is reproducible from source, and any real content change surfaces in git diff. `skills_count` remains as a real signal.

### Fixed (v0.2 release prep)

- Version number in `package.json` normalised from `0.2.0-alpha.0` to `0.2.0-alpha` (matches `v0.1.0-alpha` convention; the `.0` suffix was spurious).
- `_context/audit/` subfolder for backward-looking artefacts (retrospectives, code reviews, security scans, deployment readiness reports). Four skills retargeted to write here.
- `_context/sacred/` canonical location for the five sacred documents — `context.md`, `tech-stack.md`, PRD, `architecture.md`, PERT chart. All references across the framework updated in a single atomic §7 *Structural Migration* (95 files). Existing consumer projects are grandfathered.
- `governance/sacred-docs.md` §7 *Structural Migrations* — one-time carve-out protocol for path-only sacred-doc relocations. Requires a DECISIONS-LOG entry *before* the migration commits.
- `_input/` scaffold in `template/` with `raw/`, `legacy/`, `reference/`, `vendor/`, `assets/` subfolders. Consumer projects have a clear place to drop source material distinct from produced artefacts.
- `secure/` pattern: `secure/manifest.yaml` (tracked, declares expected credentials by name), `secure/.env*` (ignored, values never committed), `scripts/check-secrets.sh` (pre-commit hook scanning the staged diff for AWS / GitHub / Stripe / Google / Slack / dotenv / private-key patterns), `docs/secure-pattern.md` (full write-up).
- `.coldpress/` runtime-state ignore rule (graph index + cache). Subdirs lazy-created at init time — not pre-stubbed.
- `docs/coldpress-yaml-schema.md` — canonical schema doc for `coldpress.yaml`. Documents per-field phase ownership, the write-back contract, deferred-field defaults, back-compat policy, and validation expectations.
- `templates/README.md` — inventory of template folders with disposition per folder. Four subdirs classified; full integration deferred to Wave 4 §4.7 (Template Registry).
- `CHANGELOG.md` (this file).

### Changed

- **BREAKING (for framework contributors):** `install/project-template/` → `template/` (path rename at repo root — 18 refs updated across 14 files). The `template/` contents ship inside the `@coldpress/core` npm tarball, scaffolded into consumer projects by `coldpress init`. Existing consumer projects are unaffected — their scaffolded `.claude/skills/` wrappers still resolve against the shipped framework regardless of the repo-level path.
- **BREAKING (for new projects):** `_output/` renamed to `_context/` throughout the framework — 410 references across 174 files. Existing consumer projects with filled `_output/` paths are not auto-rewritten; skills surface a migration hint when they detect stale paths.
- **BREAKING (for new projects):** `coldpress.yaml` template stripped from 76 lines to 22 lines. Only Phase-1 fields ship at init (`project.name`, `project.slug`, `user.name`, `user.communication_language`, `user.document_output_language`). Phase-3+ fields are written back by their owning skills as the lifecycle progresses. Commented `# convex:` / `# supabase:` stack-pack override examples removed — they biased stack selection by appearing as the canonical example.
- `project-init` flow realigned to match the bare template: `step-01-gather.md` no longer asks for project type, domain, or stack pack at init (those are Phase-3 questions); `step-04-config.md` writes only Phase-1 fields.
- `governance/sacred-docs.md` §6 refreshed: `devSandbox → app` terminology replaced with `sandbox → live` to match the current three-tier pattern.
- Status banners added to all five `orchestrator/strategies/*.md` docs and to `orchestrator/engine/runtime-adapters.md` — the Inngest / GitHub Actions adapters and the 5 strategy patterns are explicitly flagged as reference-only / aspirational. Claude Code (Local) remains the only adapter that actually executes framework skills today.
- `agents/_schema.md` + `REGISTRY.md` — updated references to the legacy persona archive (moved out of the framework per Decision #20; now lives at project level in `hq-p001-coldpress-os/legacy/agents-archive/`).
- `skills/reviews/code-audit/SKILL.md` and `skills/ops/security-scan/SKILL.md` — corrected stale references to a never-valid `docs/architecture.md` path (inherited upstream drift); now point at `_context/sacred/architecture.md`.

### Fixed

- Missing `audit: "_context/audit/"` line in the root `coldpress.yaml` (the install-template version had it; the root was missed during the initial Block A refactor and caught during Block C verification).

### Deferred (tracked for later waves)

- Per-skill `coldpress.yaml` write-back implementation (`stack-locking` writes `stack_pack`, `create-prd` writes `sacred_docs.prd`, etc.) — contract spec'd in `docs/coldpress-yaml-schema.md`; wiring lands in Wave 4 Lifecycle Alignment.
- Actual yaml schema validator code — deferred to Wave 2 (npm package). Until then, skills perform ad-hoc validation at their entry points.
- Template folder dispositions per `templates/README.md` — executed in Wave 4 §4.7 (Template Registry).

### Governance

- Estate-level `docs/docs/DECISIONS-LOG.md` Locked Decision #23 filed — records the sacred-doc path consolidation per the new §7 protocol. Entry filed before the migration committed, per §7.4.

---

## [0.1.0-alpha] — 2026-04-15

Initial public release — MIT-licensed, three-source upstream attribution (BMAD-METHOD v6.2.2, Carroll's Inline Syntax, Whiteport Design System), git-submodule install model. See `README.md` for the full feature set as of v0.1.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-23 | ColdPress Labs | Changelog created as part of Wave 1 cross-cutting work per Phase I plan Q7 resolution. Retroactive one-line v0.1.0-alpha entry + full Unreleased/v0.2.0-alpha section covering Blocks A–E of Wave 1 (`_context/` rename, `_context/audit/`, project-template scaffolding for `_input/` + `secure/` + `.coldpress/`, sacred-doc §7 migration, coldpress.yaml bare-template redesign, cleanup sweep). |
