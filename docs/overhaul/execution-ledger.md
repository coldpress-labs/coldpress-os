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
| WS0 | Hygiene & cuts (items 1–4, 13, 14) | 🟡 in progress | `overhaul/ws0-hygiene-cuts` | — |
| WS1 | Enforcement layer | ⚪ not started | — | — |
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
| D7 | finding (needs decision) | The CI "Vulnerability scan" step (`npm audit --audit-level=moderate`) exits 1 — **12 advisories (8 moderate, 3 high, 1 critical)** in transitive deps (esbuild via tsup; hono; etc.). **Pre-existing**: WS0's only `package.json` change was removing `orchestrator`/`graph` from `files[]`; zero dependency changes, `package-lock.json` untouched — so this red is identical on baseline `main` and is NOT a WS0 regression. Fixing it means bumping dependency versions, which is outside WS0's §8 hygiene-and-cuts scope (deviation rule → user approval before touching deps). Every other CI-relevant gate WS0 controls is green (typecheck, build, test, gate.json validation, build:skills, plugin drift). **Escalated to user**: how to treat the audit red against the WS0 "CI green" acceptance clause. | awaiting-user |

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

**Acceptance status:** 🟢 green on every gate WS0 owns. One pre-existing, out-of-scope
CI red (npm audit, D7) escalated to the user before formally closing WS0 → WS1.
Tree left green (typecheck + test) and clean; WIP still parked at `stash@{0}`.
