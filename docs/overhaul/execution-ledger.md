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
| WS1 | Enforcement layer | 🟡 in progress | `overhaul/ws1-enforcement` | — |
| WS2 | Trace + story graph | ⚪ not started | — | — |
| WS3 | Two-lane lifecycle | ⚪ not started | — | — |
| WS4 | Verification & design system | ⚪ not started | — | — |
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
