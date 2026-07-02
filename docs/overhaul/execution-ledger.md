# coldpress-os v0.4 "Enforcement" Overhaul — Execution Ledger

> The single source of truth for **where we are** in the overhaul. The plan
> (`../coldpress-os-overhaul-action-plan.md`, project-root `docs/`) is the map;
> this ledger is the position. One entry per work session per §0.1.2. Never rely
> on conversation memory across sessions — read this first.

**Governing plan:** `coldpress-os-overhaul-action-plan.md` v2.2 (2026-07-02), at the
hq-p001 **project root** `docs/`. All build paths in the plan are relative to this
framework repo (`coldpress-os/`). Executor: **Butler**. Protocol: plan §0.1 (binding).

**Status board**

| WS | Title | State | Branch | Closed |
|----|-------|-------|--------|--------|
| WS0 | Hygiene & cuts (items 1–4, 13, 14) | 🟢 closed | `overhaul/ws0-hygiene-cuts` | 2026-07-02 |
| WS1 | Enforcement layer | 🟢 closed | `overhaul/ws1-enforcement` | 2026-07-02 |
| WS2 | Trace + story graph | 🟢 closed | `overhaul/ws2-trace-storygraph` | 2026-07-02 |
| WS3 | Two-lane lifecycle | 🟢 closed | `overhaul/ws3-two-lane` | 2026-07-02 |
| WS4 | Verification & design system | 🟡 in progress | `overhaul/ws4-verification-design` | — |
| WS5 | Skills consolidation & CC alignment | ⚪ not started | — | — |
| WS6 | Deploy packs | ⚪ not started | — | — |
| WS7 | Evals & the loop | ⚪ not started | — | — |
| WS8 | Operate with substance | ⚪ not started | — | — |
| WS9 | Profiles, proposal mode & compounding | ⚪ not started | — | — |

Legend: ⚪ not started · 🟡 in progress · 🟢 green/closed · 🔴 blocked/amber

---

## Plan deltas (numbered; the anti-drift record per §0.1.3)

> Tactical corrections (a path moved, a rename, a count off) are logged and
> proceed. Anything touching scope, sequencing, §8 deletions not listed, or new
> additions **waits for user approval** before implementation.

| # | Type | Summary | Status |
|---|------|---------|--------|
| D1 | tactical | `_sandbox/` (§8 item 4) is destined for the brownfield capability pack (§7.6), which does not exist yet. Getting it out of framework root now; parking the single file (`legacy-manifest.md`) under `reference/` as a holding location until the brownfield pack lands (WS6-era). Final home unchanged from plan intent. | applied |
| D2 | correction | Plan §2.9 calls `packages/otel-exporter/node_modules/` a "committed (~41 MB)" artifact. Reality: **0 files git-tracked** (already matched by the global `node_modules/` gitignore) and **159 MB** on disk. Action reduces to a disk deletion; no `git rm` needed. gitignore already covers the pattern. | applied |
| D3 | correction | Root `coldpress-core-0.3.2-alpha.tgz` (§8 item 3) is **untracked** (disk-only), not committed. Delete from disk + add `*.tgz` to `.gitignore` so it can never be committed. | applied |
| D4 | sequencing-note | §8 item 13 (this WS) moves 3 CI templates into a repo-level `reference/` dir, which does not exist yet — it will be created here. §8 item 12 (a LATER workstream) renames `templates/` → `reference/`; that will become a merge-into-existing rather than a bare rename. Flagged so the later WS expects pre-existing `reference/` content. No action now beyond this note. | noted |
| D5 | tactical | The `graph.test.ts` + `graph-visualizer.test.ts` fixtures (a 144-node/330-link httpx `graph.json`) lived *inside* the deleted `graph/vendor/graphify/worked/httpx/` tree, but they exercise the **retained** `src/graph/*` modules (§4.6 keeps `index.ts` to cannibalize for WS2 `trace`). Relocated only that one JSON output file to `test/fixtures/graph/httpx/graph.json` and repointed both tests. This is indexer *output data* (a test fixture), not the Graphify runtime/source — does not violate WS0's "no vendored graphify" gate. | applied |
| D6 | scope-boundary | A wider docs surface still advertises the removed `coldpress graph` command: whole docs `docs/graph-query.md` + `docs/graph-visualizer.md`, `docs/glossary.md` graph rows, and `graph-prime` references in `docs/coldpress-yaml-schema.md` + `docs/example-walkthrough.md`. Rewriting these belongs to the docs-regeneration workstream (§8 item 11 / WS1 drift checks) and the `graph-prime` skill deletion (§5 P1, a later WS) — **not** WS0's item set. Fixed only the single headline README feature-list line (README:160) now, as clearly implied by item 1. Remaining graph-doc surface carried forward for the docs-regen WS. Also carried: internal degraded-path strings in `src/graph/index.ts` + `src/dashboard/render/page.ts:290` still name `coldpress graph rebuild` (harmless; WS2 owns `src/graph/` rewrite). | carried-forward |
| D8 | scope-addition (user-approved) | User directive (via Andy, 2026-07-02): beyond §8 item 11's regenerate-or-fix treatment, sweep `coldpress-os/docs/` for point-in-time working notes vs living framework docs. **Outcome:** evaluated the 4 named candidates + scanned the rest. **Moved OUT** (2, zero inbound links, pure historical): `wiring-audit-2026-05-03.md` (Unit-#29 gap inventory) + `phase-2-orchestration-notes.md` (notes on the deleted orchestrator layer) → `../legacy/docs-superseded-2026-07-02/framework-docs/` + ARCHIVE-MANIFEST section. **Kept for §8.11** (2, shipped-doc material): `anthropic-skill-wrapping-audit.md` (5 living inbound links) + `attribution-audit.md` (companion to public NOTICE.md) — the directive's own "shipped-doc → fix/regenerate" branch; ripping their links / dropping public attribution now would be worse than a §8.11 fix later. Scan found no other orphaned dated notes (the `-spec` docs' `date:` fields are format-spec metadata; the tabular docs are §8.11 regen targets). Own commit at the WS0→WS1 boundary. | applied |
| D11 | scope-boundary | WS1-G deleted the 5 `governance/*-change/workflow.md`. Updated the functional/active references (cline.ts + cursor.ts interop generators, sacred-docs.md doctrine, 6-architecture README, decision-logger skill). **Deferred references** (not WS1-G's scope): PERT-change refs in `7-breakdown/gate.json`, `8-implementation/gate.json`, `parallelization-strategy/SKILL.md` → **WS2** (PERT desanctification removes these wholesale); `pre-project-interview` step refs → **WS5** (that skill is deleted per §8 item 6); `docs/decision-trees.md` + `docs/glossary.md` mentions → **§8 item 11** docs-regeneration (they are regen targets). Recorded so each owning WS clears its refs. | logged / deferred |
| D10 | scope-addition (user-approved, deferred) | Quarterly BMAD upstream review (`../docs/upstream-review-bmad-2026-07-02.md`, v6.2.2→v6.9.0) — four adopts logged for FUTURE workstreams, **do not act now**: **(1) WS5/P2** — `validate-idea` + proposal mode adopt adversarial Socratic interrogation (bmad-forge-idea pattern). **(2) WS4/P6** — add a breadth-coverage exit check: every architecture dimension is decided, deferred, or explicitly open. **(3) WS5 acceptance** — add criterion: every canonical skill must run non-interactively (WS7's eval runner depends on it). **(4) WS8/P10** — incident-response records adopt a forensic case-file shape; **WS5 low-priority** — refresh `elicitation-methods.csv` + use Create/Update/Validate intent naming in skill consolidation. Each owning workstream picks these up when reached. | logged / deferred |
| D9 | resolved | User (via Andy) confirmed stash@{0} is superseded, preserved as branch `wip/pre-overhaul-shape-a-propagation` + patch, and instructed `git stash drop stash@{0}` (do NOT apply). **Safety check before dropping (per standing rule — verify preservation exists):** branch + patch both verified to hold the **tracked** WIP (75 files, +1889/−217) — BUT both **MISSED the one untracked file** the `-u` stash held: `lifecycle/11-evolve/retrospective/steps/step-00-deltas-reconciliation.md` (209 lines, real Phase-11 content; the patch's hits on that path were all references in other files, `grep -c` for its new-file diff = 0). Extracted it from `stash@{0}^3` into `../legacy/docs-superseded-2026-07-02/pre-overhaul-wip-untracked/…` + manifest row, so nothing is lost (the other untracked entry, the `.tgz`, is disposable per §8 item 3). **Then** ran `git stash drop stash@{0}`. **Salvage candidates for later cherry-pick from the wip branch:** event-stream writer + tests → revisit at WS7; doctor-checks expansion + tests → revisit at G11/doctor work. | resolved |
| D7 | finding (needs decision) | The CI "Vulnerability scan" step (`npm audit --audit-level=moderate`) exits 1 — **12 advisories (8 moderate, 3 high, 1 critical)** in transitive deps (esbuild via tsup; hono; etc.). **Pre-existing**: WS0's only `package.json` change was removing `orchestrator`/`graph` from `files[]`; zero dependency changes, `package-lock.json` untouched — so this red is identical on baseline `main` and is NOT a WS0 regression. Fixing it means bumping dependency versions, which is outside WS0's §8 hygiene-and-cuts scope (deviation rule → user approval before touching deps). Every other CI-relevant gate WS0 controls is green (typecheck, build, test, gate.json validation, build:skills, plugin drift). **User decision (2026-07-02): close WS0; track the audit separately.** To be resolved in a dedicated dependency-hygiene pass before the §12 v0.4.0 ship gate (candidate owner: WS1 enforcement / CI-drift work). Not a WS0 blocker. | tracked / deferred to pre-§12 dep-hygiene |

---

## Sessions

### Session 1 — 2026-07-02 · WS0 kickoff

**Active WS:** WS0 — Hygiene & cuts.
**Executor:** Butler (Opus, per §0.1.7 model routing for WS0–WS4).

**Pre-flight**
- Read the action plan v2.2 in full (§0–§3, §8, §9, §10, §11, §12; skimmed §4–§7).
- Adopted §0.1 execution protocol as binding.
- **Blocker surfaced + resolved:** `main` carried ~1,889 lines of uncommitted
  "Shape-A" 9→11-phase count-propagation WIP (75 tracked files + 2 untracked),
  pre-dating this session, unrelated to WS0, and colliding with cut item 2
  (`orchestrator/README.md`) and item 3 (the untracked `.tgz`). Per user
  decision: **stashed** (`git stash push -u`, `stash@{0}` "Shape-A 9->11 phase
  propagation WIP (pre-Butler-WS0, parked 2026-07-02)"), leaving a clean tree.
  WS0 proceeds uncontaminated; the Shape-A work is preserved for later reapply.

**Baseline (recorded per §0.1.2 — commands actually run)**
- Environment: Node v25.9.0. No `git` identity issues. Python presence checked at acceptance.
- `npm run typecheck` → **exit 0** (green).
- `npm test` → **62 test files, 767 tests, all passing** (~4.4s). Green.
- Branch created: `overhaul/ws0-hygiene-cuts` off clean `main`.

**Scope for this WS (per Andy's handoff):** §8 cut-list items **1, 2, 3, 4, 13, 14** only.
Item 8 (wrapper generator) is explicitly deferred to WS5 (deleting it now would
scaffold skill-less projects — plan v2.2 sequencing fix).

**Cut-target inventory (verified before cutting)**
- `graph/` — 73 tracked files, all under `vendor/graphify/` (dir holds nothing else) → whole dir removed.
- `orchestrator/` — README.md, code/, engine/, strategies/, templates/ → whole dir removed.
- `packages/otel-exporter/node_modules/` — 159 MB, untracked (see D2) → disk delete.
- root `coldpress-core-0.3.2-alpha.tgz` — untracked (see D3) → disk delete + gitignore.
- `_sandbox/legacy-manifest.md` — 1 file (see D1) → relocate to `reference/`.
- `data/ci-cd/` — azure-pipelines, github-actions, gitlab-ci, harness-pipeline → move harness/gitlab/azure to `reference/`; keep github-actions.
- Tests to remove with item 1: `test/gate-check-graph-staleness.test.ts`, `test/graph-query.test.ts` (cover deleted staleness check + graph CLI verbs).
- `package.json` `files[]` lists `orchestrator` and `graph` → both removed from the array.

**Items completed this session** (each its own commit):
- [x] Item 3 — tgz + otel node_modules deleted (disk-only, D2/D3); `*.tgz` gitignored — `8bec1e9`
- [x] Item 2 — `orchestrator/` removed; dropped from `files[]` + `frameworkDirs`; comment pointers fixed — `4e89bc8`
- [x] Item 4 — `_sandbox/legacy-manifest.md` → `reference/` (D1) — `1250951`
- [x] Item 1 — vendored graphify + `staleness.ts` + graph-staleness gate check + `graph rebuild|stats|query|view` verbs + `commands/graph.ts` + 3 tests removed; gate.json ×2 excised; NOTICE.md §4 rewritten (optional-backend lineage); Python out of core docs; README:160; httpx fixture relocated (D5) — `f80a74a`
- [x] Item 13 — 3 CI templates → `reference/ci-cd/` (github-actions stays); promotion-flow.md terminology aligned to sacred-docs §6 — `e6bec22`
- [x] Item 14 — interop default `all` → `claude` (AGENTS.md only); cursor/roo/openhands/cline opt-in; 2 tests updated — `993147a`

**Acceptance criteria — evidence (commands actually run):**
- ✅ **No vendored graphify / orchestrator / committed tarball / otel node_modules tracked** — `git ls-files` counts all 0.
- ✅ **`coldpress init` succeeds + scaffolds a working skill set with no Python invoked** — real CLI run in scratchpad produced **112 skill wrappers** (legacy path intact per WS0 requirement, deferred to WS5) **+ 1 interop file (AGENTS.md only)** (item 14 live). `grep` confirms zero `python` invocations remain in `src/`.
- ✅ **typecheck** — `tsc --noEmit` exit 0.
- ✅ **test** — `vitest run`: **59 files, 744 tests, all pass** (was 62/767 baseline; −3 test files = deleted graph-verb/staleness tests).
- ✅ **build** — `tsup` success (dist/cli.js).
- ✅ **gate.json validation** — all 11 lifecycle gate.json valid shape.
- ✅ **build:skills + plugin drift** — 128 SKILL.md emitted; `git diff --exit-code plugin/` clean (exit 0).
- ⚠️ **`npm audit --audit-level=moderate`** — exit 1 (12 advisories). **Pre-existing, not a WS0 regression** (deps unchanged). See delta **D7** — escalated to user.

**CHANGELOG:** entry added under [Unreleased] (WS0).

### Session 2 — 2026-07-02 · WS0 merge + WS1 kickoff

**WS0 merged to main** via `--no-ff` (merge commit `1355440`; −34,344 lines, mostly
graphify). Not pushed to origin (awaiting user). Branch `overhaul/ws0-hygiene-cuts`
retained.

**WS1 — Enforcement layer** opened on branch `overhaul/ws1-enforcement` off main.
This is the largest, greenfield P0 workstream (§9). Read for this session: §0.1,
§11, §9 WS1, §4.1 (state), §4.4 (hook stack), operating-model §II.1 (state shape),
and the repo's existing Zod convention (`schemas/phase-gate.schema.ts`).

**Internal WS1 build order** (foundation → enforcement → drift → governance):
- **A. state schema** (§4.1) — the routing spine every hook reads. ← this session
- **B. coldpress.yaml schema** (§4.1, closes audit §2.5 gap) — validated by the P1 schema-validate hook.
- **C. hook harness** — `template/.claude/settings.json` + `template/scripts/hooks/` Node convention; the `COLDPRESS_OVERRIDE` protocol (G11) + `--explain` standard baked in from hook #1.
- **D. the hook stack** (§4.4) — WS1-scoped hooks only: `load-state`, `sacred-guard` (core block; trace blast-radius is WS2), `phase-gate`, `schema-validate`, `secret-scan`, `quality-gate`, `run-log`, `test-integrity`. `boundary-guard`/`deploy-gate`/`next-task` + delta records depend on WS2/WS6 machinery → deferred to those workstreams (noted so WS1 acceptance doesn't over-reach).
- **E.** extend `validate-schema.ts` routing to all surviving schemas; fix the 4 dangling SKILL.md schema paths.
- **F.** `check:drift` npm script + CI job.
- **G.** governance prose conversion (cut-list 9): 5 change workflows → one `sacred-change` skill + the sacred-guard hook.

**Increment A — state schema (done):**
- `schemas/state.schema.ts` (Zod) — operating-model §II.1 shape + §4.1 additions
  (`security_tier` T0/T1/T2, `enforcement` on/off/degraded) + §10 `iteration`.
  Top-level `.strict()` (typo guard on the routing spine); permissive sub-objects
  (`gates`, `deploy`) for phase/pack-specific keys. `parseState()` helper for hooks.
- `test/state-schema.test.ts` — 10 tests (valid full/lite/defaults/forward-compat +
  reject typo/out-of-range/bad-enum/missing/safeParse). typecheck green; **754 tests pass**.
- Commit `6ac246c`.

**Increment B — coldpress.yaml schema (done):**
- `schemas/coldpress-yaml.schema.ts` — whole-file validator, closes audit §2.5.
  Requires the Phase-1 core (`project.name/slug`); `.passthrough()` for stack-pack
  blocks (`convex:` etc.) + forward fields; types known lifecycle fields + the v0.4
  set (`profile`, `lane`, `security_tier`, `interop`, `deploy_pack`, `verify_pack`),
  reusing `LaneEnum`/`SecurityTierEnum` from state.schema (config↔state can't diverge).
- `test/coldpress-yaml-schema.test.ts` — 10 tests incl. validating the real
  `template/coldpress.yaml` (name/slug filled). **764 tests pass**. Commit `a0d8a35`.

**Increment C — hook harness + load-state reference hook (done):**
- Execution model confirmed with user: `.claude/settings.json` → thin dep-free
  `scripts/hooks/<name>.mjs` → `coldpress hook <name>` (logic in `src/hooks/`,
  unit-tested, reuses src). Verified the current Claude Code hook I/O contract via
  claude-code-guide (permissionDecision deny at exit 0; SessionStart
  additionalContext; `${CLAUDE_PROJECT_DIR}`; stdin `tool_name`/`tool_input.file_path`/`cwd`).
- Built: `src/hooks/types.ts` (HookHandler + COLDPRESS_OVERRIDE protocol G11 +
  renderDecision), `src/hooks/load-state.ts` (SessionStart summary hook),
  `src/hooks/registry.ts`, `src/commands/hook.ts` + `coldpress hook [name]
  [--explain|--list]`, `template/.claude/settings.json`, `template/scripts/hooks/load-state.mjs`.
- 18 tests + **verified end-to-end via the real CLI + stdin**: `coldpress hook
  load-state` with a SessionStart payload emits the correct additionalContext JSON.
  **782 tests pass**, plugin drift clean. Commit `447274b`.

**Established pattern for the remaining WS1 hooks (Increment D).** sacred-guard,
phase-gate, schema-validate, secret-scan, quality-gate, run-log, test-integrity all
replicate this harness (new `src/hooks/<name>.ts` + registry entry + thin
`scripts/hooks/<name>.mjs` + settings.json wiring + tests). Per §0.1.7 these
settled-spec replications suit a Sonnet session. boundary-guard/deploy-gate/next-task
+ delta records depend on WS2/WS6 machinery → deferred to those workstreams.

**WS1 so far:** state schema, coldpress.yaml schema, hook harness + load-state.

**Increment D — the hook stack (in progress: 4 of 8 hooks):**
- `sacred-guard` (PreToolUse Edit|Write) — headline enforcement: blocks `_context/sacred/*`
  writes without an approved change record (`schemas/sacred-change.schema.ts`, produced by
  WS1-G). Verified e2e (denies with `permissionDecision:"deny"`). ✅ acceptance: sacred-block.
- `secret-scan` (PostToolUse Edit|Write) — secret patterns (ported from check-secrets.sh);
  feeds finding back naming the pattern not the value. `renderDecision` now branches on
  event (PreToolUse permissionDecision vs PostToolUse/Stop decision:block). Verified e2e.
- `schema-validate` (PostToolUse Edit|Write) — schema'd `_context/` artifacts must validate;
  errors fed back in-loop. Reuses validate-schema.ts. Verified e2e. ✅ acceptance: schema-reject.
- Harness refactor: per-hook scripts → one generic `scripts/hooks/run.mjs <name>`.
- Commits `17f33d6` (sacred-guard+secret-scan), `9c066d8` (schema-validate). **807 tests**, drift clean.

**Increment D — the hook stack: COMPLETE (all 8 WS1 hooks).** Added since the 4 above:
- `quality-gate` (Stop) — blocks completion while typecheck/lint/test are red (injectable
  runner; WS4 swaps to testing.yaml). Delivers "cannot complete red". Commit `31ec9df`.
- `phase-gate` (PreToolUse Skill, full lane) — blocks phase-N skills before p(N-1) gates green;
  resolves skill→phase from lifecycle/ tree; new shared `state-io.ts`. `31ec9df`.
- `test-integrity` (PostToolUse Edit) — flags dropped assertions/cases + added skip/only. `31ec9df`.
- `run-log` (Stop/SubagentStop) — appends a `session-boundary` event; **sanctioned EventStream
  schema extension** (new kind + PHASE 9→11). Verified event lands in events.jsonl. Commit `01c6be9`.
- `renderDecision` branches per-event (PreToolUse permissionDecision vs PostToolUse/Stop
  decision:block). `boundary-guard`/`deploy-gate`/`next-task` deferred to WS2/WS6 (need their machinery).

**WS1 acceptance status:** sacred-block ✅, schema-reject ✅, quality-gate-red ✅ (logic + e2e),
override-logging ✅, per-hook test+--explain ✅ (all 8). Remaining: `check:drift` (WS1-F); a
scaffolded-project end-to-end demo (part of WS3 acceptance). **837 tests**, drift clean.

**Increment E (done):** wired 17 orphaned schemas into PATH_PATTERN_SCHEMAS by artifact
path; fixed the 4 dangling SKILL.md/gate.json paths; new test guards every routed schema
exists. Commit `76606c6`.

**Increment F (done):** `check:drift` npm script + `src/generators/check-drift.ts` (regenerate
→ diff; extensible for §8.11 doc generators); CI step replaces the two plugin-stale steps.
Verified: a seeded source edit is caught. Commit `13ea95d`.

**Increment G (done):** 5 `governance/*-change/workflow.md` → one `sacred-change` skill +
sacred-guard hook; `governance/` 48K→16K (67% smaller); sacred-docs.md doctrine rewritten;
interop generators + active refs updated (remaining PERT/§8.11/WS5 refs → D11). Commit `06c0edc`.

---

## 🟢 WS1 CLOSED (2026-07-02)

**All acceptance criteria met** (§9), verified by command:
- Sacred write without an approved change record → **blocked** with a useful message ✅ (sacred-guard, e2e).
- Schema-violating `_context/` artifact → **rejected in-loop** ✅ (schema-validate, e2e).
- Task **cannot complete red** ✅ (quality-gate logic + e2e; full scaffolded-session demo lands with WS3).
- `check:drift` **catches a seeded drift** ✅ (demonstrated + restored).
- **Every hook has a test + `--explain`** ✅ (all 8).
- **Override works and is loudly logged** ✅ (harness, tested).
- Enforcement **ships into scaffolded projects** ✅ (`coldpress init` → `.claude/settings.json` + `scripts/hooks/run.mjs`, 10 hook wirings).

Final gate: typecheck ✅, **849 tests** ✅, build ✅, 11 gate.json valid ✅, check:drift OK ✅.
**Deferred to their workstreams (recorded):** boundary-guard/deploy-gate/next-task + delta
records (WS2/WS6); pending-human-gate in load-state (WS3/§7.7); PERT-ref cleanup (WS2);
`docs/` regen-target ref cleanup (§8.11). CHANGELOG entry added.

**Branch:** `overhaul/ws1-enforcement`, off main, tree green, clean. **Merged to main
`65e6cf4` (--no-ff)** on 2026-07-02.

---

### Session 3 — 2026-07-02 · WS1 merge + WS2 kickoff

**WS1 merged to main** (`65e6cf4`, --no-ff). Not pushed to origin.

**WS2 — Trace + story graph** opened on `overhaul/ws2-trace-storygraph` off main
(P0, Opus per §0.1.7). Read: §4.2 (handoff packet), §4.3 (delta), §4.6 (trace),
§4.7 (story graph + waves), operating-model §II.2/§II.3.

**Internal WS2 build order:**
- **A. Data-contract schemas** (handoff, delta, story-graph) ← this session
- **B. `coldpress trace`** (§4.6) — load schema'd artifacts → in-memory graph; verbs
  orphans/why/impact/coverage/release. Cannibalize `src/graph/index.ts`.
- **C. `coldpress waves`** (§4.7) — validate DAG + contract-story-on-interface +
  intra-wave ownership disjointness; compute waves + critical path; emit waves.yaml/schedule.yaml/mermaid.
- **D. boundary-guard hook** (reads active packet forbidden/ownership) + delta-resolution
  phase-exit gate + git-protocol hooks (G4). Register on the WS1 harness.
- **E. Integration** — wire trace blast-radius into sacred-guard (the §4.4 deferred part);
  trace-orphan gates at P6/P7.

**Increment A — data contracts (done):**
- `schemas/handoff.schema.ts` (§4.2/§II.2) — one packet for every boundary (scoped
  inputs, forbidden globs, return contract). `.strict()`.
- `schemas/delta.schema.ts` (§4.3/§II.3) — forward-carry quartet; `resolution: null`
  = unresolved (blocks phase exit); `isUnresolved()` helper.
- `schemas/story-graph.schema.ts` (§4.7) — stories (o/m/p, risk, owns/produces/consumes,
  kind story|contract|integration) + typed edges (blocks|interface|informs).
- `test/ws2-schemas.test.ts` — 12 tests. typecheck green.

**Increment B — `coldpress trace` (done):**
- `src/trace/{types,graph,build,verbs}.ts` + `src/commands/trace.ts` + CLI. In-memory
  graph over story-graph.yaml + ADRs + deltas (extends to P4/P6 keying in WS4).
- Verbs: `orphans` (dangling consumes + **silent-divergence guard** [flag_for_architecture_ADR
  delta → real ADR] + isolated stories; exit 1 on blocking finding), `why`, `impact`
  (sacred-guard blast-radius uses this in WS2-E), `coverage`. `delta.schema` gained `adr_ref`.
- +20 tests; e2e verified (`trace orphans` catches seeded dangling consume + unresolved-ADR
  delta). Commit `934e4c0`. **869 tests**.

**Increment C — `coldpress waves` (done):**
- `src/waves/compute.ts` `analyzeWaves()` — validates (acyclic; contract story on every
  interface edge; intra-wave ownership disjointness) + computes wave layers, critical path
  `(o+4m+p)/6`, team-mode qualification, IN-<wave> integration stories.
- `src/commands/waves.ts` + `coldpress waves` — rejects (exit 1, no emit) on cycle / missing
  contract / ownership overlap; else emits `docs/generated/{waves,schedule}.yaml` + mermaid.
- +12 tests (all three §9 rejections + computation). e2e verified. Commit `c504193`. **881 tests**.

**Increment D — boundary-guard + git-guard + delta gate (done):**
- `boundary-guard` (PreToolUse Edit|Write) — blocks writes matching the active handoff
  packet's `forbidden` globs (new `src/utils/glob-match.ts`). `git-guard` (PreToolUse Bash) —
  blocks subagent commits to main. `trace orphans` now flags unresolved deltas (§4.3). Commit `a35e10e`.

**Increment E — trace integration (done):**
- `coldpress trace orphans` gate check added to P6 + P7 exit gates. `sacred-change` skill Step 6
  calls `coldpress trace impact` (blast radius → flip stories to re-verify). Commit `a35e10e`.

---

## 🟢 WS2 CLOSED (2026-07-02)

**Acceptance (§9), by command:**
- **`waves` rejects a cycle, a missing contract story, and an ownership overlap** ✅ (12 tests + e2e).
- **Packet boundary blocks an out-of-scope write** ✅ (boundary-guard e2e — deny with packet id).
- **`trace orphans` gates P6/P7** ✅ (gate.json checks added) and catches dangling deps + the
  silent-divergence guard (flag_for_architecture_ADR → ADR) + unresolved deltas, exit 1 (e2e).
- **PRD edit → impacted stories flip to re-verify** — mechanism wired (`sacred-change` Step 6 →
  `trace impact`); the full requirement→story blast radius + the "unmapped requirement" orphan
  **activate when WS4 adds requirement/component keying** to P4/P6 artifacts. Recorded, not a blocker.

Final gate: typecheck ✅, **894 tests** ✅, build ✅, gate.json valid ✅, check:drift OK ✅.
CHANGELOG entry added.

**Deferred (recorded):** requirement/component/threat/release/test trace nodes → WS4/WS6 (the
model + verbs already support them); `release`-verb + REL-* schema → WS6.

**Branch:** `overhaul/ws2-trace-storygraph`, off main, tree green, clean. **Merged to main
`16a4714` (--no-ff)** on 2026-07-02.

---

### Session 4 — 2026-07-02 · WS2 merge + WS3 kickoff

**WS2 merged to main** (`16a4714`, --no-ff). Not pushed. This completes **Phase 0 foundation
except WS3** (§10: WS0→WS1→WS2 done; WS3 remaining).

**WS3 — Two-lane lifecycle** opened on `overhaul/ws3-two-lane` off main (P0). Read §6 (lite lane),
§9 WS3. Note: the coldpress.yaml + state schemas already carry `lane`/`profile` (WS1-B/A), and
the phase-gate hook already gates full-lane-only (WS1-D) — so the field plumbing is partly done.

**Internal WS3 build order:**
- **A. Lane defaulting + state scaffolding** — `coldpress init` defaults to `lane: lite`, seeds
  `.coldpress/state.yaml`. ← this session
- **B. Lite lane skills** (Spec/Build/Verify/Ship, §6) — consolidations of the full-lane skills.
- **C. `lane-upgrade` skill** — back-fills full-lane sacred docs from lite artifacts (no data loss).
- **D. Scaffolded CLAUDE.md routing table** (effort/novelty/external-users/payment → lane) +
  statusLine script (lane/phase/gate/pending-human-gate).

**Increment A — lane defaulting + state.yaml (done):**
- `coldpress init` defaults to `lane: lite` (`--lane full` override); coldpress.yaml gains a
  `lane:` block; seeds `.coldpress/state.yaml` (lite → phase `spec`, full → phase `1`;
  enforcement on, tier T0). The load-state hook reads it (verified e2e: injects
  "lane: lite · Lite:spec (entering)").
- `test/ws3-scaffold.test.ts` (+2). **896 tests**. typecheck green. Commit `80a9c0d`.

**Increment B — lite lane skills (done):**
- `lifecycle/lite/{spec,build,verify,ship}/SKILL.md` — the four consolidated lite phases (§6).
  Non-negotiables kept (walking skeleton, acceptance stubs, clean-room verifier,
  boundary-guard/quality-gate, staging-smoke→human-prod); ceremony dropped. Under
  `lifecycle/lite/` (non-numeric → phase-gate passes them through). Emitted as plugin
  wrappers (133 total). Release record on the canonical `_context/operations/` root.
  Commit `ff1d306`. **896 tests**, check:drift clean.

**Increment C — `lane-upgrade` (done):** `coldpress lane-upgrade` flips lite→full in
coldpress.yaml + state.yaml (phase mapped) and back-fills the full-lane sacred-doc
skeletons from spec.md; spec.md + decisions.md preserved byte-for-byte. + the `lane-upgrade`
skill. +4 tests (no-data-loss + refusals + no-clobber). Commit `3daa8ed`.

**Increment D — statusline + routing table (done):** `coldpress statusline` (lane · phase ·
tier · enforcement · gates) wired in template settings.json via `scripts/statusline.mjs`;
scaffolded CLAUDE.md gains the lane routing table. +3 tests. Commit `3daa8ed`.

---

## 🟢 WS3 CLOSED (2026-07-02) — Phase 0 Foundation complete

**Acceptance (§9):**
- **`coldpress init` produces a lite project** ✅ — defaults to `lane: lite`; the lite lane's
  sacred set is `spec.md` + `decisions.md` (≤3), and the flow is Spec/Build/Verify/Ship (no
  P5/6/7 machinery). Verified e2e (statusline reads `lite · lite:spec`).
- **Lane upgrade back-fills without data loss** ✅ (tested + e2e; lite artifacts byte-for-byte preserved).
- **Demo Spec→Ship end-to-end, all gates firing** — the machinery is in place + unit-proven
  (init lite, the 4 lite skills, hooks, statusline, lane-upgrade). The full live run is the
  **§10 validation project** ("one real lite-lane client site"), which runs *after* Phase 0 —
  recorded as the next milestone, not a WS3 code gap.

Final gate: typecheck ✅, **903 tests** ✅, build ✅, check:drift OK ✅. CHANGELOG entry added.

**§10 milestone:** Phase 0 (WS0→WS1→WS2→WS3) is DONE — cuts, enforcement, trace/waves, and the
two-lane lifecycle. Next per build order: **Phase 1 — Trust (WS4 → WS5 → WS6)**, starting with
WS4 (verification & design system), which also lights up the deferred trace requirement/component
keying and the sacred-guard blast-radius.

**Branch:** `overhaul/ws3-two-lane`, off main, tree green, clean. **Merged to main
`bcbe746` (--no-ff)** on 2026-07-02 — completes Phase 0 Foundation.

---

### Session 5 — 2026-07-02 · WS3 merge + WS4 kickoff

**WS3 merged to main** (`bcbe746`, --no-ff). **Phase 0 Foundation complete** (WS0→WS3). Not pushed.

**WS4 — Verification & design system** opened on `overhaul/ws4-verification-design` off main
(P0/P1 — the differentiator; Opus per §0.1.7). This is the largest workstream after WS1.

**Internal WS4 build order:**
- **A. Design tokens + tokens-build** — the P5 enforcement contract + code binding. ← this session
- **B. Roster surgery** (§4.5) — delete scrum-master/communicator/valet; rebuild qa→verifier
  (clean-room, no Edit/Write); upgrade reviewer→opus; add `description:` frontmatter to all;
  regenerate agent-roster.csv.
- **C. testing.yaml schema** (L0–L7) + **outcomes.yaml** (outcome contract, P4 gate).
- **D. visual-verify + acceptance-stubs skills**; wrap Anthropic webapp-testing in the verifier.
- **E. P6 additions** (api-contract, data-model, analytics-plan, integration-inventory); wire ux-spec schema.

Note: `test-integrity` hook already built (WS1-D). The trace requirement/component keying that
WS2 deferred is lit up here (P4/P6 artifacts gain requirement IDs).

**Increment A — design tokens + tokens-build (done):**
- `schemas/design/tokens.schema.ts` — the load-bearing tokens contract (typography/color-roles+
  dark/spacing/radii/shadows/breakpoints/z-index/motion), `.strict()`.
- `src/design/tokens-build.ts` `buildCss()` + `coldpress tokens build` — regenerates
  `_context/design/tokens.css` (CSS custom properties + `prefers-color-scheme: dark` override)
  from tokens.json. The build consumes tokens by construction.
- +7 tests incl. **"a token edit propagates into the CSS with no manual code change"** (a §9
  acceptance). e2e verified. **910 tests**. Commit below.

**Branch:** `overhaul/ws4-verification-design`, off main, tree green, not merged.

---

**Acceptance status:** 🟢 **WS0 CLOSED (2026-07-02).** Green on every gate WS0 owns.
The one pre-existing, out-of-scope CI red (npm audit, D7) is tracked/deferred to a
dependency-hygiene pass before the §12 ship gate, per user decision — not a WS0
blocker. D8 (framework-docs sweep) and D9 (WIP-stash reconciliation + drop) both
completed at the boundary. Tree left green (typecheck + 744 tests) and clean; the
pre-WS0 WIP is fully preserved (branch `wip/pre-overhaul-shape-a-propagation` +
patch + the extracted untracked file in `legacy/`), and `stash@{0}` is dropped.

**Next:** WS1 — Enforcement layer (the largest, greenfield workstream). Runs on Opus
(§0.1.7). Open a new session/branch off `main` after this branch merges, or continue
here per your preference.
