# Changelog

All notable changes to coldpress-os are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) from v1.0 onward. Pre-1.0 minors may contain breaking changes — the changelog calls them out explicitly.

---

## [Unreleased]

### Added

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
| 1.0 | 2026-04-23 | Cadbury-hq | Changelog created as part of Wave 1 cross-cutting work per Phase I plan Q7 resolution. Retroactive one-line v0.1.0-alpha entry + full Unreleased/v0.2.0-alpha section covering Blocks A–E of Wave 1 (`_context/` rename, `_context/audit/`, project-template scaffolding for `_input/` + `secure/` + `.coldpress/`, sacred-doc §7 migration, coldpress.yaml bare-template redesign, cleanup sweep). |
