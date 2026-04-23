# Changelog

All notable changes to coldpress-os are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) from v1.0 onward. Pre-1.0 minors may contain breaking changes — the changelog calls them out explicitly.

---

## [Unreleased]

*(No changes yet — next release staging.)*

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
