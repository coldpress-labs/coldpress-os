# Changelog

All notable changes to coldpress-os are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) from v1.0 onward. Pre-1.0 minors may contain breaking changes — the changelog calls them out explicitly.

---

## [Unreleased] — v0.2.0-alpha

### Added

- **npm package foundation** (`@coldpress/core`). TypeScript source under `src/`, built with tsup to `dist/`. Test harness: vitest. Runtime deps: `commander` (CLI), `@clack/prompts` (interactive prompts), `picocolors` (terminal colors). Dev deps: `typescript`, `tsup`, `vitest`, `@types/node`. `package.json` `files` whitelist controls the tarball (ships: `dist`, `template`, framework dirs, docs, licence/notice/readme/changelog; does not ship: `test`, `node_modules`, source `.ts` files). Engine floor: Node >= 20.
- `coldpress` CLI stub with `--version` and `upgrade` implemented; `init` and `feedback` present as stubs until Block G.
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
