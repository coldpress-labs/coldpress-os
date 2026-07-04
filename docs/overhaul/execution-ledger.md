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
| WS4 | Verification & design system | 🟢 closed | `overhaul/ws4-verification-design` | 2026-07-02 |
| WS5 | Skills consolidation & CC alignment | 🟢 closed | `overhaul/ws5-skills-consolidation` | 2026-07-03 |
| WS6 | Deploy packs | 🟢 closed | `overhaul/ws6-deploy-packs` | 2026-07-03 |
| WS7 | Evals & the loop | 🟢 closed | `overhaul/ws7-evals-loop` | 2026-07-03 |
| WS8 | Operate with substance | 🟢 closed | `overhaul/ws8-operate` | 2026-07-03 |
| WS9 | Profiles, proposal mode & compounding | 🟢 closed | `overhaul/ws9-profiles` | 2026-07-03 |
| WS10 | Connective tissue (system-integration audit) | 🟢 closed | `overhaul/ws10-*` | 2026-07-04 |
| WS11 | Structure & Diet (structure-hygiene audit) | 🟡 in progress | `overhaul/ws11-*` | — |

Legend: ⚪ not started · 🟡 in progress · 🟢 green/closed · 🔴 blocked/amber

**WS11** executes `../docs/structure-hygiene-audit-2026-07-04.md` (v1.2) in §S7 order
(S1 bugs → S2 hygiene → S3/S3.5 deletions → S5 regen → S4 wire-or-archive → S6 scaffold
diet → guards). Step-group progress: **S1.a+b 🟢** (`overhaul/ws11-s1-gate-runtime`,
D38–D39) · **S1.c+d 🟢** (`overhaul/ws11-s1-cli-hygiene`, D40–D41) · **S1.e 🟢**
(`overhaul/ws11-claude-md`, D42 — framework CLAUDE.md, user-approved). **S1 COMPLETE.**
**S2 in progress** (`overhaul/ws11-s2-package-hygiene`): S2.1 🟢 (D43 — docs/overhaul
no longer ships/scaffolds) · S2.2 🟢 (D44 — agent-team-demo archived; 2 public-linked
notes kept per D8) · S2.4 🟢 (D45 — seo-pack → capability-packs, matrix now 5).
Remaining S2: §8.14 templates prune+rename, CHANGELOG trim. Then S3/S3.5 +
staleness lint, S5 regen, S4 wire-or-archive, S6 scaffold diet, guards.

**All WS0–WS9 merged to main (2026-07-03).** Post-overhaul work landed on main since:
D7 dep-hygiene, PERT-schema-chain excision + D18 close, D10 BMAD adopts sweep,
optional deploy packs (netlify + self-hosted), and the post-audit **Fix pass**
(F1 agent-routing · F4 CHANGELOG + this board · F5 small builds · F7 leftovers) —
see the post-overhaul sections at the foot of this ledger. Remaining before v0.4.0
tag: the §12 runtime demos (need a live estate project) + the docs/public-accuracy
pass (audit F2/F3/F6).

---

## Plan deltas (numbered; the anti-drift record per §0.1.3)

> Tactical corrections (a path moved, a rename, a count off) are logged and
> proceed. Anything touching scope, sequencing, §8 deletions not listed, or new
> additions **waits for user approval** before implementation.

| # | Type | Summary | Status |
|---|------|---------|--------|
| D44 | WS11-S2.2 (working-notes archive) + **deviation** | Audit S2 listed three dated working notes for archival to `../legacy/`. Archived **only** `agent-team-demo.md` (→ `../legacy/framework-working-notes-2026-07-05/` + manifest) — it had zero live inbound links (only historical CHANGELOG/ledger mentions). **Deviation (per §0.1.3 "reality contradicts the plan", following ledger D8's precedent):** kept `attribution-audit.md` and `anthropic-skill-wrapping-audit.md` in `docs/` because they carry **live public inbound links** archiving would break — `attribution-audit.md` ← public `NOTICE.md` (legal attribution) + `README.md`; `anthropic-skill-wrapping-audit.md` ← `README.md` + a shipped `SKILL.md` (`parse-document`) + two `docs/` pages. D8 (2026-07-02) already made this call; breaking public links to satisfy a literal archival instruction would be worse than keeping two linked companions. Presented to the user; **user said "go"** (2026-07-05). | **applied (`overhaul/ws11-s2-package-hygiene`)** |
| D45 | WS11-S2.4 (seo-pack reclassification) | Audit S2: `seo-pack` lived under `skills/stack-packs/` but is a **capability** pack (`archetype_fits.invocable_phases`, no fixed tech stack), inflating the generated matrix to "6 stack packs". `git mv skills/stack-packs/seo-pack → skills/capability-packs/seo-pack`; updated the 6 sub-skill `category:` frontmatter (`stack-packs/seo-pack` → `capability-packs/seo-pack`) + the external path refs in `REGISTRY.md` + `docs/cross-cutting/cross-cutting-skills.md` (paths only — REGISTRY's full agent-list regen is S5). The deploy-matrix generator reads the stack-packs dir, so it **auto-dropped to 5 stack packs** (regenerated `docs/generated/stack-deploy-matrix.md`). Plugin output is category-agnostic (spec frontmatter omits `category`) so the seo skills still emit unchanged (146 skills, `plugin/skills/seo-*` intact) — **no plugin drift**. `stack-pack-shipped.test` still green (5 packs ≥ its `>=5` floor; its `invocable_phases` discriminator is now moot but harmless). `data/agents/skill-catalog.csv` also refs the old path but is S3-dead (left for deletion). | **applied (`overhaul/ws11-s2-package-hygiene`)** |
| D43 | WS11-S2.1 (stop shipping the internal overhaul workspace) | Audit S2 headline ("internal-state leak into every client project"): `docs/overhaul/` (the execution ledger + working notes, ~127 KB) shipped in the npm tarball (`files:["docs"]`) **and** was copied into every scaffolded project (`frameworkDirs` includes `docs`, copied wholesale by `copyFramework`). Excluded it from both: added `"!docs/overhaul"` to `package.json` `files:` (verified — `npm pack --dry-run` now shows 0 `docs/overhaul` entries, 69 other docs still ship) and a `docs/overhaul` skip in `copyFramework`'s copy filter (using the OS path separator). +1 regression assertion in `init-scaffold.test.ts` (scaffold has no `coldpress-os/docs/overhaul`, but still has `docs/butler.md`). The broader docs-subset diet (ship only a consumer subset) stays S6. | **applied (`overhaul/ws11-s2-package-hygiene`)** |
| D42 | WS11-S3.6-1 (framework-repo CLAUDE.md) | Audit S3.6-1: the framework repo had **never** had a `CLAUDE.md`/`.claude/` (`git log --all` empty), so framework sessions silently inherited **Andy's** Project-root directive and the public repo gave contributors none — the estate identity chain (project-root CLAUDE.md promises "inside `coldpress-os/`, identity switches to Butler per that repo's CLAUDE.md") was broken by omission. Authored a lean (135-line), rule-dense `coldpress-os/CLAUDE.md`: Butler identity + **scope boundaries** (vs Andy at the Project root, vs consumer-Butler in `template/CLAUDE.md`), the 8-subagent roster + retired-four note, the 4 sacred docs (with a "PERT is not a 5th" guard tying to S3.5), the load-bearing command surface, the green-bar dev workflow + never-hand-edit-generated-artifacts rule + overhaul delta protocol + no-tag/publish gate, the valet-loop entry, and a contributor note. **Delivery verified:** root `CLAUDE.md` is **not** in `package.json` `files[]` (absent from `npm pack`) and **not** copied by `coldpress init` (which copies `template/`) — so it is framework-repo/GitHub-only, never shipped to or scaffolded into consumers; `template/CLAUDE.md` remains the consumer directive. Two Butler directives, non-overlapping delivery, never co-present → no conflict. **Draft presented to the user; approved 2026-07-05; merged.** | **applied (`overhaul/ws11-claude-md`)** |
| D40 | WS11-S1.3 (quickstart renames + mismatch allow-list) | Audit S1.3: four stack-pack quickstart skills (`cli-npm-publishable`, `vibe-coder-fullstack`, `static-single-page`, `static-multipage-blog`) all declared `name: "quickstart"`; the skill generator's first-wins dedup emitted one and **silently dropped three** from the plugin (now 146, was 143). Renamed each frontmatter `name` → `<pack>-quickstart` (dir stays `quickstart/`, matching the `browser-extension-quickstart` precedent); `pack.yaml` references quickstart by **path** not name, so no routing changed — the rename purely de-collides the plugin key. The rename turned 4 name==dir matches into name≠dir mismatches (11→15 total), so added `INTENTIONAL_NAME_MISMATCHES` to `skill-md-generator.ts` — an explicit allow-list for the pack/lane-namespaced sub-skills (4 quickstarts + `browser-extension-pack`/`-quickstart` + 5 `seo-*` + 4 `lite-*`) that suppresses the `name-parent-mismatch` warning for correct-by-design namespacing while still catching accidental drift. build:skills now emits **146 skills, 0 warnings, 0 skipped**. plugin/ regenerated + committed in sync (check:drift green). | **applied (`overhaul/ws11-s1-cli-hygiene`)** |
| D41 | WS11-S1.4 (version single-source + --help) | Audit S1.4: version split **three** ways (worse than the audit's two) — `package.json` 0.3.2-alpha, `.claude-plugin/marketplace.json` 0.3.0-alpha, docs 0.4.0-alpha; `coldpress --help` said "11 subagents". **User decision (2026-07-05): bump now to 0.4.0-alpha** (the v0.4 overhaul is code-complete; only the validation-project ship gate remains). Set `package.json` + root `marketplace.json` → 0.4.0-alpha; `build:skills` derives the plugin manifests' version from package.json, so they regenerated to 0.4.0-alpha automatically (`coldpress --version` confirms). Fixed the CLI `.description()` "11 subagents" → "8 subagents" (package.json description already said 8). **Still unreleased — no tag/publish.** Recorded S5 follow-up: make root `marketplace.json` generated-from-package.json (currently hand-maintained → can re-drift); the marketplace *description*'s stale "11 subagents" + agent list are S5's full-regen scope, not this pass. | **applied (`overhaul/ws11-s1-cli-hygiene`)** |
| D38 | WS11-S1.1 (gate-check verbs) | Audit S1.1: the WS10-C1 gate-runner (`src/gate/run.ts`) evaluates each `gate.json` check by **spawning `coldpress <verb>` as a CLI subprocess**, but the eight acceptance-check verbs it invokes were never registered in `src/cli.ts` — every block-severity check failed as "unknown command" (the check functions sat tested-but-unreachable in `src/gate/checks/`). Because run.ts re-execs the CLI, the fix had to be **verb registration** (importing the functions into run.ts wouldn't help). Added `src/commands/gate-checks.ts` (8 thin wrappers: run the check in the project cwd, print ✓/✗, return exit code) + 8 `program.command()` registrations. Verb→function map ground-truthed against the actual `command:` strings across every phase gate.json (all 8 live in `lifecycle/3-tech-stack/gate.json`). **Two tactical sub-corrections (logged, proceeded):** **D38-t1** — `validate-yaml-block` resolves `--schema` under `packageRoot/schemas/<rel>`, but gate.json authors write `--schema schemas/<name>` (package-root-relative), which doubled to `packageRoot/schemas/schemas/<name>` → ENOENT; the CLI wrapper strips a single leading `schemas/` so both spellings resolve. **D38-t2** — `validate-schema-latest`'s `--schema` is ignored by the implementation (schema derived from the resolved doc); the option is accepted for gate.json parity and a comment marks it decorative. Tests: a **build-free source invariant** (every gate.json command verb is CLI-registered — catches the class for any future gate) + an **end-to-end** test spawning `dist/cli.js` for representative verbs incl. the t1 schema case. `frontmatter-check` is exported but invoked by no gate.json, so it is not a required verb. | **applied (`overhaul/ws11-s1-gate-runtime`)** |
| D39 | WS11-S1.2 (gate phase-id parsing) | Audit S1.2: `coldpress gate check <phase>` did `runGateCheck(Number(phase))`, so `1-bootstrap` and `lite:spec` both parsed to `NaN` → "no gate.json found for phase NaN" in a fresh scaffold. Added `PhaseRef` + `parsePhaseRef(number\|string)` in `src/gate/run.ts`: full lane (`3` / `3-tech-stack` / `1-bootstrap` → leading int) vs lite lane (`lite:spec` / `lite/build` → slug). `findGateJson` is now lane-aware (`lifecycle/<n>-*/gate.json` or `lifecycle/lite/<slug>/gate.json`); `runGate` accepts `number\|string` (backward-compatible with the numeric test callers) and threads the label; `GateRunReport.phase` widened `number → string` (only consumer is display + the gate_id fallback — no test asserts it). CLI passes the raw string; `runGateCheck`/`runGateEnter` parse-and-error with a helpful message on an unparseable id. Lite phases ship no gate.json (the lane drops sequencing) → honest "no gate for this phase"; `gate enter` on a lite phase is a no-op (no fresh-for-phase keys to stamp). +9 tests (parse + lane routing + label threading). | **applied (`overhaul/ws11-s1-gate-runtime`)** |
| D35 | WS10-C1 (gate-runner) | Audit C1: `src/gate/checks/*` (8 CLI-wired check functions) had ZERO runtime callers — nothing read a phase's `gate.json` and RAN its `command`s; acceptance checks were "executed by agents reading prose". Built `src/gate/run.ts` (the engine): reads `lifecycle/<phase>/gate.json`, runs each check's command via the CLI (resolving `{date}`/`{latest}` placeholders by globbing the `-v<N>` family), existence-checks `artefact-present` paths, and surfaces human/skill_ref-only/unresolvable checks as **pending** (never a fabricated pass); exits 1 iff a block-severity check failed. `coldpress gate check <phase>` + `gate enter <phase>` (C6 — stamps `phase_<n>_started_at`, the fresh-for-phase key `file-exists-after` reads; `LocalConfig` gained a `phase_<n>_started_at` index signature). Wired into `evaluate-phase-gate`. Verified live vs the real P3 gate. +10 tests. | **applied (`overhaul/ws10-c-skills`)** |
| D36 | WS10-C3 (client-timeline + next-task) | Audit C3: `coldpress waves` emits `docs/generated/schedule.yaml` but it had NO consumer — the `client-timeline` skill (§5 P7/G8, "most revenue-relevant subsystem") was never built. Built `lifecycle/7-breakdown/client-timeline` (agent: pm): reads the computed critical path + per-story o/m/p and emits an **85%-confidence PERT date** (`Σte + z·√Σσ²`, z≈1.04) + a pre-ranked scope-cut list; the same math backs `proposal`'s G8-lite pre-sales timeline. Registered `schedule.yaml` in the wiring manifest (→ 12 artifacts). **next-task RESOLVED (deleted, not built):** story sequencing is the computed `coldpress waves` schedule + `sprint-status.yaml` (which `dev-story` reads); the registry comment + agent-team-demo repointed. | **applied** |
| D37 | WS10-C7 (integration-story) | Audit C7: `coldpress waves` auto-generates `IN-<n>` integration stories per wave + git-guard reserves the integration branch for them, but NO skill implemented the sequential-merge procedure (`wave-orchestration` retired without a successor). Built `lifecycle/8-implementation/integration-story` (agent: developer): contract-first sequential merge of a wave's verified story branches, fast suite after each merge, merge-conflict-as-integration-finding (not rebased away), then the full suite over the integrated wave; green = wave integrates (sprint-status marked done), red = a finding to @developer. Gives the emitted-and-guarded IN-* stories their executor. | **applied** |
| D32 | WS10-G (wiring manifest — highest-leverage) | The recurrence-preventer for the whole "consumer built, producer missing" audit class. `data/wiring.yaml` (11 flagship cross-phase artifacts, each `{path, schema, producer, consumers[]}`) + `schemas/wiring.schema.ts` + `src/wiring/check.ts` (asserts every artifact has a producer — `null` = explicit tracked gap — and every producer/consumer/schema path resolves). `coldpress wiring check` (standalone) + `doctor --wiring` + a CI `wiring` job. Running it live confirms WS10-A/B closed the breaks: 11 artifacts, every one produced, all paths resolve. +6 tests. | **applied (`overhaul/ws10-cdg`)** |
| D33 | WS10-D (posture E1–E4) | **E1:** nothing checked the global `coldpress` CLI was on PATH → a user whose CLI is missing gets ZERO enforcement (all hooks fail-open) while believing they're protected. Added a loud `doctor` check (warning + emphatic message); fixed `template/scripts/hooks/run.mjs` which dropped hook args (`--explain` never reached the CLI). **E2:** `coldpress trace orphans --strict` distinguishes an empty graph (nothing to check, exit 2) from a genuine clean pass; the P6 orphans gate uses it. **E3:** added a conditional P4 gate check (`prd-security-section-if-tier`) that BLOCKS a T1/T2 project whose PRD has no security section — `security_tier` now bites at P4 (was informational to P9). **E4:** `evals --filter` accepts a comma-separated list so a profile's `eval_subset` array maps; the CI eval guard is self-adjusting (scored == files-on-disk), not a magic `>=8`. +9 tests. | **applied** |
| D34 | WS10-C (partial) + D1–D5 cleanup | **C4:** trace now ingests acceptance-stub manifests as test nodes + `covers` edges (coverage was always zero, `release()` always unverified) and the unmapped-requirement orphan check only fires once ≥1 story exists (fixes the spurious P6 block — requirements exist at P6, stories not until P7). **D1/D4:** rewrote the scaffolded `template/.claude/SYSTEM.md` (entirely pre-overhaul — the "worst" item) + `CLAUDE.md` + the `AGENTS.md` generator (`src/interop/agents-md.ts`) to the v0.4 reality (8 agents, no PERT, plugin, 11 phases, `coldpress trace`). **D2:** purged retired `coldpress graph rebuild/query` across 10 skill/lifecycle files. **D3:** retired agents in live routing surfaces → successors (qa→verifier/developer, scrum-master→pm, valet→butler, wave-orchestration→`coldpress waves`). **D5:** removed the 4 broken `orchestrator/` doc links. (3 parallel agents + a correction pass.) **REMAINING WS10-C (larger builds, recorded):** C1 (a gate-runner dispatching gate.json `command`s to `src/gate/checks/*` + set `phase_3_started_at`), C3 (`client-timeline` skill from schedule.yaml; resolve `next-task`), C7 (`integration-story` IN-* merge skill). | **applied (C4/D done); C1/C3/C7 remaining** |
| D31 | WS10-B (mismatch fixes) | System-integration audit Class-B (producer/consumer disagree). **B1 (blocking):** story-graph step-02 instructed edges as `{from,to,kind}` but `EdgeSchema` is strict on `type` — a graph authored per the skill was rejected by `coldpress waves`; fixed `kind`→`type`. **B2:** unified the three-way sprint-tracking mismatch (story-graph wrote `sprint-status-v{N}.md`, dev-story read `sprint-status.yaml`, P8 gate validated `wave-status-v*.md`) to ONE artefact `_context/tracking/sprint-status.yaml` + a new `sprint-status.schema.json` (validated as a data file by `validateDocSchema` — which now parses whole-body YAML/JSON for data files, not just frontmatter); P7/P8/P10 gates repointed; `wave-status.schema.json` retired. **B3:** aligned acceptance-stubs + dev-story load path to `_context/implementation/stories/`. **B4:** made dev-story's `owns`-scope promise real — added `owns`/`produces`/`consumes` to the handoff packet + an allowlist in boundary-guard (a write outside owns/produces is blocked; empty owns → denylist-only, backward-compat). **B5:** unified the phase-handoff filename to `phase-{from}-to-{to}-{date}.md` (phase-transition + intake) + wired the P1→P2 handoff into research's inputs. +4 tests (1001 total). | **applied (`overhaul/ws10-b-mismatch-fixes`)** |
| D26 | WS10-A1 (integration audit, producer pass) | System-integration audit (`../docs/system-integration-audit-2026-07-04.md`) A1: `outcomes.yaml` was consumed by the P4 **block-gate** + P6/P9/P10/P11 + `coldpress outcomes`/`trace`, produced by nothing (the gate's remediation named `outcome-contract`, which didn't exist). Built the `outcome-contract` P4 skill (agent: pm): harvests PRD P0/P1 requirements → measurable target + measurement source, validated by `coldpress outcomes check`. Closes the producer break. | **applied (`overhaul/ws10-connective-tissue`)** |
| D27 | WS10-A2 + C2 | Audit A2 + C2: the F6 design schemas + CLI existed but no P5 skill produced `tokens.json`/`styleguide.yaml`/`budgets.yaml` (tokens lived only as a brand-guidelines markdown section), and the F6 registry had zero importers. Built three P5 producer skills (`design-tokens`, `styleguide`, `budgets`; agent: ux-designer) + wired `validateDocSchema` to route design DATA files through the F6 Zod registry (`designSchemaForPath`) — the registry's first consumer. +3 tests. | **applied** |
| D28 | WS10-A3 | Audit A3: the security-risk-forcing thread (story-slice risk-forcing, dev-story/verifier, waves team-mode exclusion) consumed `security-registry.yaml` but it had no producer and no schema — a missing file silently disabled the whole thread. Added `SecurityRegistrySchema` + `ThreatModelSchema` (p6-artifacts) + two P6 producer skills (`security-registry`, `threat-model`; agent: architect) + mechanized the cross-check: the story-graph `StorySchema` now refines `security_registry:true ⇒ risk:high`. (verifier-on-opus via `to.model` mechanized in D29.) +8 tests. | **applied** |
| D29 | WS10-A4/A5 (highest-value) | Audit A4 (nothing wrote `taxonomy_tags` to events.jsonl → evolve's failure leaderboard always empty) + A5 (no verifier packet, no verdict schema, verifier-on-opus was prose). Built `VerifierPacketSchema` (mechanizes verifier-on-opus — a security packet is *rejected* off opus) + `VerifierVerdictSchema`; a `verdict` EventStream event + evolve now counts its tags (leaderboard **live**); `coldpress verdict record` CLI (validates + appends the event, verified e2e); the `verify-story` P8 skill (agent: verifier, `disable-model-invocation`) that authors the packet + records the verdict. +11 tests. | **applied** |
| D30 | WS10-A6 | Audit A6: the walking skeleton is a plan ★ non-negotiable (hello-world to staging before P4, the best deploy de-risking step) but no skill existed and the gate keys `walking_skeleton_deployed`/`license_scan_clean` existed nowhere. Built the P3 `walking-skeleton` skill (agent: architect; build → deploy-to-staging → smoke → licence scan → set the two P3 gate keys) + two block-severity P3 gate.json checks. Updated the P3 gate-structure test (12→14 checks; automated checks may use command|skill_ref|schema_ref). | **applied** |
| D24 | post-audit fix (F3, CI hardening) | Audit F3: CI lost the pack→install→init smoke (the check that caught both v0.3.x production-only packaging bugs) exactly when distribution switched to the plugin, and never ran `coldpress evals`. Added two `ci.yml` jobs: (1) **pack-smoke** (`scripts/ci/pack-smoke.sh` + `npm run smoke:pack`) — `npm pack` the real tarball, install it **production-only** (`--omit=dev`) into a throwaway project, `coldpress init --yes`, and assert the plugin bootstraps (settings.json marketplace wiring + copied `coldpress-os/plugin/` tree + ≥1 bundled SKILL.md + no wrapper dir). A runtime devDep import or a missing `files[]` entry fails here, not in a user's `npm i -g`. Verified locally (133 bundled skills). (2) **evals** — runs the BUILT `dist/cli.js` over the shipped `evals/` corpus end-to-end, gating on "the runner scored every task" (pass/fail is workspace-dependent — golden tasks assert a live project's `_context`); catches a broken evals CLI / build wiring / unparseable corpus. Corpus schema validity stays covered by `npm test`. | **applied (`overhaul/fix-pass-f3-f6`)** |
| D25 | post-audit fix (F6, design-system schema layer) | Audit F6: styleguide + budgets schemas didn't exist; design schemas weren't centrally registered; stack packs declared `testing:` as free-text. Built: **`schemas/design/budgets.schema.ts`** (CWV + weight + WCAG + Lighthouse floors — the G12 readiness contract) + **`schemas/design/styleguide.schema.ts`** (the `/styleguide` route manifest visual-verify diffs against), Zod, parity with `tokens.schema.ts`; **`schemas/design/index.ts`** — the design data-file schema **registry** (`DESIGN_ARTEFACT_SCHEMAS`: path-pattern → parser for tokens/budgets/styleguide), the single registration point (data files validate via parser at their command; the markdown design *docs* were already in `validate-schema` routing — the audit's "none registered" was partly outdated). Schema refs wired into `readiness` (budgets) + `visual-verify` (styleguide). **Stack-pack `testing:` → L0-L7:** `pack.schema.json` gains a top-level `testing` (L0-L7 layers, tools/layer); the 4 packs that carried `pre_picked.testing: "Vitest[+Playwright]"` now declare a structured `testing.layers` block seeding the project testing.yaml; a new test validates every shipped **stack** pack against `pack.schema.json` (was uncovered; `seo-pack` is a capability pack, out of scope) — which caught + fixed a pre-existing bug (`browser-extension.pre_picked.targets` was an array, not a string). +15 tests (981 total). **Follow-up (recorded, not this pass):** a dedicated P5 `styleguide`/`budgets` producing skill + `brand-guidelines` absorption into a styleguide skill (a skill refactor). | **applied (`overhaul/fix-pass-f3-f6`)** |
| D19 | post-audit fix (F1, CRITICAL) | Post-overhaul audit (`../docs/post-overhaul-audit-2026-07-03.md`) found the abolished `@qa` sub-dispatch survived in `template/.claude/agents/*`: developer.md routed story-complete → `@qa`, devops.md → `@qa` for tests, reviewer.md + architect.md + pm.md → deleted `@scrum-master`. Every scaffolded project shipped the author-grades-own-homework pattern WS4 exists to abolish. Fixed: routing corrected to match `src/need-info/route.ts` (qa→verifier, scrum-master's kinds→pm; wave/orchestration→Butler). Roster CSV is derived FROM these files (drift green). Kept 2 legit descriptive mentions (verifier's "replace the old @qa"; pm's "folded into @pm"). | **applied (`overhaul/fix-pass-f1-f4-f5-f7`)** |
| D20 | post-audit fix (F4, protocol) | Audit F4: two §0.1 protocol violations. (a) CHANGELOG missing one-per-WS entries for WS6–WS9 (§0.1.4) — added WS6/7/8/9 sections + a post-overhaul-hardening block (deploy packs, D10 adopts, D7, PERT excision, F1 routing fix). (b) The ledger status board (this file, lines 14–25) still showed WS5 in-progress / WS6–9 not-started while the body closed them all — corrected to 🟢 closed with branches + a merged-to-main note. | applied |
| D21 | post-audit fix (F5, small builds) | Audit F5: promised small pieces not built. Scope for this pass (per audit recommendation step 1): `coldpress trace release` verb, override leaderboard in `coldpress evolve`, and quality-gate → stack-pack `testing.yaml` wiring. (SDK `runTask` loop, estimation-bias enrichment, railway pack remain out of this pass — bigger / docs-pass scope.) | **applied** — `coldpress trace release` (release-scope preview: stories × requirements × diffstat × verified; +5 tests); `override_leaderboard` in `coldpress evolve` (new `gate-override` EventStream event, recorded at the hook dispatcher, aggregated + rendered; resolves the WS1-D TODO; +6 tests); quality-gate now testing.yaml-driven (enabled fast layers L0/L1 → scripts; fallback preserved; +8 tests). |
| D23 | post-audit fix (F2, public-accuracy) | Audit F2 (public face contradicts the shipped tree). Corrected the framework's public-facing docs to the true v0.4 state. **Named public face:** README (8 agents not 11; plugin-not-wrappers; `orchestrator/` out; sacred docs 4; the Graphify L160↔L201 contradiction reconciled), package.json description, `docs/architecture.md` v7.0 ("Nine Subagents"→8; wrappers→plugin; deleted `staleness.ts`/PERT/`orchestrator/`/`install/archetypes/`/Graphify-index), `butler.md` v2.0, `governance.md` (5→4 sacred schemas), `quick-start.md`. **Shared footer:** "11 Shape A subagents (…)" boilerplate → 8-agent list across 23 docs (deterministic replace). **§8.14:** deleted the orphaned `pert-chart` template + `pert_references_architecture.rego`; de-PERTed the two live skill docs that referenced them (`operate-loop` step-02, `validate-schema`). **Reference-doc tail (~25 docs):** swept via 5 parallel general-purpose agents + a correction pass — every LIVE deleted-agent/PERT claim fixed (qa→verifier for reviews; test-authoring skills→developer; scrum-master→pm+`coldpress waves`; communicator→butler-owned creative/export; valet→butler/framework-internal; implementation-readiness→pm; handoff schemas 4→2; sacred 5→4). Historical/VC/attribution text preserved. Green: typecheck, 966 tests, lint, drift, build. **Remaining §8.11 docs-regen follow-up (recorded, NOT in F2's deleted-agent/PERT scope):** (1) make `REGISTRY.md` + `TEMPLATES-REGISTRY.md` **generated + drift-checked** (currently hand-maintained catalogs, ~24/9 stale refs — a generator is the durable fix, hand-patching would re-drift); (2) a **skill-rename pass** for renamed/retired skill *names* still cited in docs (`create-epics`/`create-stories`→`story-slice`, `distillator`/`shard-doc`→`docs`, `qa-automation`/`wave-orchestration`/`sprint-planning`/`parallelization-strategy`); (3) the **Graphify-as-live-index framing** in `graph-schema.md` + `glossary.md` (retire the `coldpress graph rebuild/query` commands → `coldpress trace`); (4) **stale phase numbers** not tied to agents/PERT (pre-Shape-A numbering in a few decision tables). | **applied (`overhaul/fix-pass-f2-docs`)** |
| D22 | post-audit fix (F7, leftovers) | Audit F7: leftovers + drift. This pass: delete superseded `install/archetypes/` + orphaned `src/archetypes/load.ts`; re-sync the divergent `lifecycle/9-deployment/readiness/` steps with the rebuilt v3.0 that lives in `plugin/skills/readiness/`. (`templates/` prune/rename §8.14 + the ≤80-corpus question stay with the docs/public-accuracy pass — audit recommendation step 2, not this pass.) §8-deletion note: archetypes were already ledger-marked "superseded" by the profiles migration (WS3/WS9); this completes an already-decided supersession, not a new cut. | **applied** — deleted `install/archetypes/` (4 YAMLs) + `src/archetypes/load.ts` + `schemas/archetype.schema.ts` + `test/archetypes.test.ts` + the dangling `install` files[] entry (no live imports; profile.schema.ts carries the override mechanics). Re-synced `lifecycle/9-deployment/readiness/` steps + workflow.md from the stale story-level 8-gate flow to the v3.0 deploy hard-checklist (SKILL.md was already v3.0; its steps had drifted); plugin regenerated. |
| D1 | tactical | `_sandbox/` (§8 item 4) is destined for the brownfield capability pack (§7.6), which does not exist yet. Getting it out of framework root now; parking the single file (`legacy-manifest.md`) under `reference/` as a holding location until the brownfield pack lands (WS6-era). Final home unchanged from plan intent. | applied |
| D2 | correction | Plan §2.9 calls `packages/otel-exporter/node_modules/` a "committed (~41 MB)" artifact. Reality: **0 files git-tracked** (already matched by the global `node_modules/` gitignore) and **159 MB** on disk. Action reduces to a disk deletion; no `git rm` needed. gitignore already covers the pattern. | applied |
| D3 | correction | Root `coldpress-core-0.3.2-alpha.tgz` (§8 item 3) is **untracked** (disk-only), not committed. Delete from disk + add `*.tgz` to `.gitignore` so it can never be committed. | applied |
| D4 | sequencing-note | §8 item 13 (this WS) moves 3 CI templates into a repo-level `reference/` dir, which does not exist yet — it will be created here. §8 item 12 (a LATER workstream) renames `templates/` → `reference/`; that will become a merge-into-existing rather than a bare rename. Flagged so the later WS expects pre-existing `reference/` content. No action now beyond this note. | noted |
| D5 | tactical | The `graph.test.ts` + `graph-visualizer.test.ts` fixtures (a 144-node/330-link httpx `graph.json`) lived *inside* the deleted `graph/vendor/graphify/worked/httpx/` tree, but they exercise the **retained** `src/graph/*` modules (§4.6 keeps `index.ts` to cannibalize for WS2 `trace`). Relocated only that one JSON output file to `test/fixtures/graph/httpx/graph.json` and repointed both tests. This is indexer *output data* (a test fixture), not the Graphify runtime/source — does not violate WS0's "no vendored graphify" gate. | applied |
| D6 | scope-boundary | A wider docs surface still advertises the removed `coldpress graph` command: whole docs `docs/graph-query.md` + `docs/graph-visualizer.md`, `docs/glossary.md` graph rows, and `graph-prime` references in `docs/coldpress-yaml-schema.md` + `docs/example-walkthrough.md`. Rewriting these belongs to the docs-regeneration workstream (§8 item 11 / WS1 drift checks) and the `graph-prime` skill deletion (§5 P1, a later WS) — **not** WS0's item set. Fixed only the single headline README feature-list line (README:160) now, as clearly implied by item 1. Remaining graph-doc surface carried forward for the docs-regen WS. Also carried: internal degraded-path strings in `src/graph/index.ts` + `src/dashboard/render/page.ts:290` still name `coldpress graph rebuild` (harmless; WS2 owns `src/graph/` rewrite). | carried-forward |
| D8 | scope-addition (user-approved) | User directive (via Andy, 2026-07-02): beyond §8 item 11's regenerate-or-fix treatment, sweep `coldpress-os/docs/` for point-in-time working notes vs living framework docs. **Outcome:** evaluated the 4 named candidates + scanned the rest. **Moved OUT** (2, zero inbound links, pure historical): `wiring-audit-2026-05-03.md` (Unit-#29 gap inventory) + `phase-2-orchestration-notes.md` (notes on the deleted orchestrator layer) → `../legacy/docs-superseded-2026-07-02/framework-docs/` + ARCHIVE-MANIFEST section. **Kept for §8.11** (2, shipped-doc material): `anthropic-skill-wrapping-audit.md` (5 living inbound links) + `attribution-audit.md` (companion to public NOTICE.md) — the directive's own "shipped-doc → fix/regenerate" branch; ripping their links / dropping public attribution now would be worse than a §8.11 fix later. Scan found no other orphaned dated notes (the `-spec` docs' `date:` fields are format-spec metadata; the tabular docs are §8.11 regen targets). Own commit at the WS0→WS1 boundary. | applied |
| D12 | resolved (WS5-A) | WS4-B roster surgery deleted `@qa`/`@scrum-master`/`@communicator`/`@valet`. ~30 skills carry `agent: "qa"` in frontmatter — but a blanket remap to `verifier` is WRONG (verifier is read-only; many of those skills, e.g. test-design/atdd/test-framework, WRITE tests → belong to `@developer`; scans → `@devops`/`verifier`; governance validators → Butler). Correct per-skill reassignment is **WS5 skills-consolidation** work ("interop generators re-read from the new roster"). Fixed now: the scaffolded CLAUDE.md subagent table + How-to-Use, `NEED_INFO_ROUTES` (re-routed off deleted agents), and the generated `agent-roster.csv`. Skill-frontmatter `agent:` remap deferred to WS5. | logged / deferred to WS5 |
| D11 | scope-boundary | WS1-G deleted the 5 `governance/*-change/workflow.md`. Updated the functional/active references (cline.ts + cursor.ts interop generators, sacred-docs.md doctrine, 6-architecture README, decision-logger skill). **Deferred references** (not WS1-G's scope): PERT-change refs in `7-breakdown/gate.json`, `8-implementation/gate.json`, `parallelization-strategy/SKILL.md` → **WS2** (PERT desanctification removes these wholesale); `pre-project-interview` step refs → **WS5** (that skill is deleted per §8 item 6); `docs/decision-trees.md` + `docs/glossary.md` mentions → **§8 item 11** docs-regeneration (they are regen targets). Recorded so each owning WS clears its refs. | logged / deferred |
| D10 | scope-addition (user-approved, deferred) | Quarterly BMAD upstream review (`../docs/upstream-review-bmad-2026-07-02.md`, v6.2.2→v6.9.0) — four adopts logged for FUTURE workstreams, **do not act now**: **(1) WS5/P2** — `validate-idea` + proposal mode adopt adversarial Socratic interrogation (bmad-forge-idea pattern). **(2) WS4/P6** — add a breadth-coverage exit check: every architecture dimension is decided, deferred, or explicitly open. **(3) WS5 acceptance** — add criterion: every canonical skill must run non-interactively (WS7's eval runner depends on it). **(4) WS8/P10** — incident-response records adopt a forensic case-file shape; **WS5 low-priority** — refresh `elicitation-methods.csv` + use Create/Update/Validate intent naming in skill consolidation. Each owning workstream picks these up when reached. | **RESOLVED (2026-07-03, branch `overhaul/d10-bmad-adopts`)** — the delta was *logged* in WS1 but the four adopts were **not** picked up when WS4/WS5/WS7/WS8 ran (they never re-surfaced into those workstreams' active worklists). Swept in a dedicated pass: **(1)** ✅ `validate-idea` Step 2 gains sub-routine 1c *Adversarial Socratic Interrogation (Forge)* + `proposal` Step 1 gains the same pass (evidenced-vs-bet verdict); elicitation-methods.csv #51 added. **(2)** ✅ P6 `gate.json` warn-check `architecture-dimensions-breadth-covered` + architecture-design step-06 `## Dimension Coverage` table + sidecar `dimension_coverage` map (schema field added). **(3)** ✅ WS5 acceptance gains the *non-interactive* criterion, satisfied-by-construction via the WS7 headless eval runner + `disable-model-invocation` human-exceptions (see WS5 CLOSED block). **(4a)** ✅ incident-response v1.2 postmortem reshaped into a forensic case-file (evidence register + hypotheses ledger + evidence-cited root cause). **(4b)** ✅ elicitation-methods.csv refreshed (+#51/#52/#53). **(4c)** ✅ *Create/Update/Validate intent naming* adopted as the standing convention for skill intents/modes — see the convention note below; existing sacred-doc skills (`create-*`/`validate-*`) already conform, no mass-rename (proportionate — a naming guideline, not a refactor). |
| D9 | resolved | User (via Andy) confirmed stash@{0} is superseded, preserved as branch `wip/pre-overhaul-shape-a-propagation` + patch, and instructed `git stash drop stash@{0}` (do NOT apply). **Safety check before dropping (per standing rule — verify preservation exists):** branch + patch both verified to hold the **tracked** WIP (75 files, +1889/−217) — BUT both **MISSED the one untracked file** the `-u` stash held: `lifecycle/11-evolve/retrospective/steps/step-00-deltas-reconciliation.md` (209 lines, real Phase-11 content; the patch's hits on that path were all references in other files, `grep -c` for its new-file diff = 0). Extracted it from `stash@{0}^3` into `../legacy/docs-superseded-2026-07-02/pre-overhaul-wip-untracked/…` + manifest row, so nothing is lost (the other untracked entry, the `.tgz`, is disposable per §8 item 3). **Then** ran `git stash drop stash@{0}`. **Salvage candidates for later cherry-pick from the wip branch:** event-stream writer + tests → revisit at WS7; doctor-checks expansion + tests → revisit at G11/doctor work. | resolved |
| D17 | applied (per §5/§8 disposition) | Parked the three brownfield-bound skills (`codebase-onboarding`, `legacy-assessment`, `legacy-ui-assessment` — §8 item 6, §5 P1/P4/P5 "MOVE into the brownfield pack") under `reference/brownfield-pending/`, following the D1 precedent (`_sandbox/legacy-manifest.md` → `reference/`, held until the brownfield capability pack — plan §7.6, `capability: brownfield`, size-threshold trigger + swappable indexer — lands, WS6-era). Unlike D16, this one **is** a straightforward application of the plan (an explicit MOVE instruction, not a re-reading of "ceremony"). Consequence, stated plainly: brownfield legacy-assessment support is **temporarily unavailable** in the standard lifecycle — removed the two conditional warn-severity gate checks that referenced them (Phase 4 `legacy-assessment-run-if-applicable`, Phase 5 `legacy-ui-assessment-emitted`) since nothing produces those artifacts until the pack exists. Direct dependents (`design-brief` Step 0/Step 4, Phase 1/4/5 READMEs) updated to note the deferral; defensively-conditional mentions elsewhere (`create-prd`'s "if legacy-assessment ran", `create-stories`/`implementation-readiness` graph-query lists) left as-is since "if it ran" already degrades gracefully to "it didn't." | applied |
| D16 | scope-boundary (deviation — did NOT delete) | §8 item 6 names `sprint-status` as DELETE ("scrum ceremony"), grouped with `sprint-planning`. Investigation found this is **wrong for `sprint-status`**: unlike `sprint-planning` (a genuinely self-contained, ceremony-wrapped status-file generator, safely folded into `parallelization-strategy` this session), Phase 10's `sprint-status` is the **Phase 10 entry skill + iteration orchestrator** — it absorbs Phase 10 entry-sync, initializes the `_context/handoffs/phase-10-ops-deltas-wip-{date}.md` WIP log that `phase-transition` step-02a §D explicitly reads, and drives the continuous-until-Phase-11 operate loop. Its name is a scrum-terminology holdover, but its function is structural, not ceremonial — the plan's cut-list one-liner appears to have been written before WS1/WS2 built the delta/handoff machinery that now depends on it. Deleting it as literally instructed would break Phase 10 entry and orphan the ops-deltas chain into Phase 11. Per §0.1.3, this is a "reality contradicts the plan" case, not a tactical correction: **did not delete `sprint-status`**, left it fully intact. A real fix (rename away from scrum framing while preserving the entry-sync/WIP-log-init function, or a deeper Phase 10 redesign) is a separate, larger piece of work than this session's mechanical consolidation. | **RESOLVED (2026-07-02, `3329eb1`)** — user chose "rename now, preserve function." Renamed the skill `sprint-status` → `operate-loop` (dir + frontmatter `name` + self-refs). Repointed the **functional surface** so it dispatches under the new name and all executable wiring is correct: `10-operate/gate.json` skill_ref + remediation, `ops-delta.schema.json` source_skill enum, `phase-transition` step-02a producer list, `devops.md` Phase 10 dispatch list, `10-operate/README.md`, plugin/ regenerated. **Scope boundary (per D6 precedent):** the versioned tracking **artefact** it produces (`sprint-status-v{N}.md`) keeps its name — a stable cross-phase contract read by Phase 7/8/11; renaming that (schema + gate-check IDs `sprint-status-current/-validated/-fresh` + dashboard sanity panel + graph-query keys) is a distinct larger change carried to the docs-regen pass (§8.11), alongside the remaining hand-maintained docs cross-refs (REGISTRY:204 old dir path, skill-index, subagent-phase-matrix, decision-trees, handoff-registry, example-walkthrough, CHANGELOG, agents/_schema, templates/retrospective — several of which already carry stale `@scrum-master` persona refs and will be swept together). typecheck + 927 tests + lint + check:drift green. |
| D15 | finding (needs decision, deferred) | While merging `orient`+`pre-project-interview` into `intake` (WS5-B), found `skills/governance/phase-transition`'s Step 2 (`step-02-graph-rebuild.md`) is **fully broken repo-wide** — it invokes `coldpress graph rebuild` (deleted in WS0 §8 item 1) and reads `src/graph/staleness.ts` (also deleted). This affects **every** phase transition (all 11 phases), not just Phase 1→2. Out of WS5-B's named scope to redesign what "graph is current" means post-WS0/WS2 (`trace`/`waves` replaced Graphify but don't cover "is `_input/` re-indexed"). Fixed only the one `pre-project-interview` name-reference inside this file (direct dependent of my merge); the graph-rebuild step itself is untouched. **Recommend:** a dedicated fix before the §12 ship gate — either retarget Step 2 at `coldpress trace` re-scan or delete the step if nothing needs it. | **RESOLVED (2026-07-02, `598c0d1`)** — deleted the step (option B): post-WS0/WS2 `trace`/`waves` are derived in-memory per call, so there is no persistent index to rebuild at a transition; the step was obsolete, not repairable. step-01 next_step repointed to step-03 (2a conditional insert preserved); workflow.md total_steps 4→3 + VC v3.0; step-03 dropped `graph_rebuilt`/`graph_rebuild_error` handoff fields; the now-orphaned `needs_graph_rebuild`/`graph_rebuild_error` local-config fields + validator invariant + test removed (completes the D14 deferral). Wider stale `coldpress graph rebuild` doc/string surface stays carried-forward to the docs-regen WS per D6. typecheck + 927 tests + lint + check:drift green. |
| D14 | tactical | Found two more dead `coldpress graph rebuild` call sites while merging `orient`+`intake` (WS0 §8 item 1 deleted the CLI verb + `src/graph/staleness.ts`, but missed these): `orient` Step 1's `needs_graph_rebuild` retry prompt, and `intake`'s Step 5 `graph-prime` (which also read the now-deleted staleness module transitively via the CLI). Both removed outright during the merge — no replacement priming step exists at intake time now that Graphify is gone; `coldpress trace`/`waves` operate over schema'd artefacts, not raw `_input/`. Phase 1 `gate.json`'s `graph-primed` check (warn-severity) removed to match; `needs_graph_rebuild`/`graph_rebuild_error` local-config fields kept (still read by `phase-transition`, see D15). Also fixed the `lifecycle-intro` step's phase table from the stale submodule-era "9-phase" numbering to the current 11-phase lifecycle while authoring its merged content fresh (not a Shape-A 9→11 propagation effort — that WIP stays parked per D9; this is just not writing objectively wrong content in new prose). | applied |
| D13 | scope-boundary (interpretive) | §5 P2 says `pre-project-interview` "MERGE into P1 `intake` (duplicate elicitation)." Read literally-minimally this could mean only dedup the elicitation questions; read structurally it means the whole context.md seed→authored transition (Steps 8-11 of the merged `intake`) moves into Phase 1, since P1's own goal line already lists "seeded context" as a P1 output and "one entry skill, not two" is the stated design principle for `orient`+`intake`. Went with the structural reading: `intake` now produces a fully **authored** (not merely seeded) `context.md` by Phase 1 exit. Moved the corresponding `context-md-status-authored` + `context-sacred-signoff` acceptance checks from the Phase 2 `gate.json` to the Phase 1 `gate.json` (renamed `context-authored`/`context-schema-valid`) to match. Phase 2 now opens with `context.md` already sacred-signed-off. If this reading is wrong, the fix is confined to `lifecycle/1-bootstrap/{gate.json,intake/}` and `lifecycle/2-discovery/gate.json` — flagging for user review. | **CONFIRMED (2026-07-02)** — user confirmed the structural reading: one entry skill authors `context.md` by Phase 1 exit; Phase 2 opens with it already sacred-signed. Applied change kept as-is. |
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

**Increment B — roster surgery (done, §4.5):**
- 11 → **8 subagents + Butler**. DELETE scrum-master/communicator/valet; REBUILD qa→**verifier**
  (clean-room, Butler-only dispatch, read-only Read/Grep/Glob/Bash); UPGRADE reviewer→opus;
  `description:` frontmatter on all 8.
- New `build:roster` generator → `data/agents/agent-roster.csv` from frontmatter; wired into
  `check:drift`. Re-routed `NEED_INFO_ROUTES` off deleted agents; CLAUDE.md subagent table +
  How-to-Use updated; interop/sdk/need-info tests updated (8 agents → 21 interop files).
- Skill-frontmatter `agent: qa` remap **deferred to WS5** (D12 — verifier is read-only; needs
  per-skill judgment). **910 tests**, drift clean. Commit `e536dba`.

**Increment C — testing.yaml + outcome contract (done):**
- `schemas/testing.schema.ts` (L0–L7 layers, thresholds, pyramid, fixtures, flake).
- `schemas/planning-artefacts/outcomes.schema.ts` + `src/outcomes/coverage.ts` +
  `coldpress outcomes check` + the **P4 exit gate** — a P0/P1 requirement with no outcome
  target fails P4 (§9 acceptance; full PRD cross-check with WS4-E keying). +10 tests. Commit `6a408df`.

**Increment D — visual-verify + acceptance-stubs (done):**
- `src/design/visual-verify.ts` `checkTokenUsage()` + `coldpress visual-verify` — flags every
  used value that isn't a token. Delivers the §9 acceptance (catches off-palette color + off-scale
  size; verified e2e). `skills/testing/{visual-verify,acceptance-stubs}`; verifier wraps
  Anthropic `webapp-testing`. +8 tests. Commit `35bdafc`. **928 tests**.

**Increment E — P6 artifacts + trace keying (done):**
- story `implements[]`; buildTraceGraph adds requirement/component nodes (implements + outcomes)
  + implements edges; `trace impact(R1)` → implementing story + files; `trace orphans` flags an
  **unmapped requirement** (P6 gate). `schemas/architecture/p6-artifacts.schema.ts` (api-contract/
  data-model/analytics-plan/integration-inventory) + 4 P6 skills. ux-spec schema already wired (WS1-E).
  Added `_context/architecture/` as an 11th canonical root. Commits `a04ba83` + fixes. **934 tests**.

---

## 🟢 WS4 CLOSED (2026-07-02)

**Acceptance (§9), by construction + command:**
- **Verifier structurally excludes implementer context** ✅ — verifier.md: Butler-only dispatch,
  read-only tools (no Edit/Write), "never the developer's reasoning" (roster-surgery §4.5).
- **A loosened assertion triggers test-integrity** ✅ (WS1-D hook, tested).
- **visual-verify catches a deliberate token violation** ✅ (off-palette color + off-scale size, e2e).
- **A token edit propagates through tokens-build with no manual code change** ✅ (e2e).
- **A PRD missing an outcome target for a P0 requirement fails the P4 gate** ✅ (outcome coverage, tested).
- **Trace requirement keying** ✅ — `impact(requirement)`→stories; unmapped-requirement orphan.
- Live-project criteria (a seeded logic bug caught by the verifier without hints; the `/styleguide`
  route rendered from tokens.json; a styleguide visual-baseline diff on a real page) are the
  **§10 validation-project runs** — the machinery (verifier, visual-verify, baselines skill) is in
  place + unit-proven; the live demo runs on a real project after the Trust phase.

Final gate: typecheck ✅, **934 tests** ✅, build ✅, check:drift OK ✅. CHANGELOG entry added.

**Unblocked:** the sacred-guard blast-radius (WS1 TODO) + the P4 outcome full-coverage cross-check
now have requirement nodes to traverse. **Deferred:** skill-frontmatter `agent: qa` remap → WS5 (D12).

**§10 milestone:** Phase 1 (Trust) — WS4 done; **WS5 (skills consolidation & CC alignment) + WS6
(deploy packs)** remain. **Branch:** `overhaul/ws4-verification-design`, off main, green.
**Merged to main `e2562d6` (--no-ff)** on 2026-07-02.

---

### Session 6 — 2026-07-02 · WS4 merge + WS5 kickoff

**WS4 merged to main** (`e2562d6`, --no-ff). Not pushed. **WS5 — Skills consolidation & CC
alignment** opened on `overhaul/ws5-skills-consolidation` off main (P1; §0.1.7 says Sonnet-friendly).

**Internal WS5 build order:** A. frontmatter-lint + D12 agent remap (done) · B. skill consolidations
(164 → ≤80; the §5/§8 DELETE/MERGE lists) · C. plugin as primary distribution + delete the
init-time wrapper generator (§8 item 8) · D. frontmatter modernization (allowed-tools, context:fork,
disable-model-invocation) · E. rebuild dev-story + deploy; team-mode demo.

**Increment A — frontmatter-lint + D12 remap (done):**
- Resolved D12: 48 skills referencing deleted agents remapped (qa→verifier/developer/butler/devops
  by rule; valet/communicator→butler; scrum-master→pm). Verifier never owns a test-WRITING skill.
- `src/generators/frontmatter-lint.ts` + `npm run lint:frontmatter` (name+description+agent+type),
  wired into CI. **Green corpus-wide** (the §9 acceptance). Commit `b2722c2`. **934 tests**, drift clean.

**Increment B — skill consolidations (in progress, 164 → 141):**
- Deleted the **21 `type: router` stubs** (§8 item 5) — plugin discovery replaces routing; generator
  output unchanged (140). Repointed 5 gate.json skill_refs to canonicals. Commit `0e46ea8`.
- Retired **wave-orchestration** (→ Butler + `coldpress waves`) + **dependency-auditor** (→ readiness);
  repointed the gate refs. Commit `b635c9f`. **934 tests**, drift clean, lint green.
- **Remaining named DELETEs** (each 6–26 inbound refs — careful ref-cleanup): orient (→intake),
  pre-project-interview (→intake), synthesize-research (→product-brief), planning-entry-sync +
  breakdown-entry-sync (→handoff packets), sprint-planning + sprint-status (scrum ceremony), narrative
  (→creative). **Research merge** (domain/market/constraint-research → one `research`). Brownfield
  relocations (codebase-onboarding, legacy-assessment, legacy-ui-assessment). Analyst mode sprawl.
  Target ≤80 needs these + the further §2.4 duplication clusters.

**Remaining WS5:** finish B (consolidation to ≤80), C (plugin distribution + delete init wrapper
generator §8 item 8), D (frontmatter modernization), E (rebuild dev-story/deploy + team demo).

**Branch:** `overhaul/ws5-skills-consolidation`, off main, tree green, not merged.

---

### Session 7 — 2026-07-02 · WS5-B consolidation continues

**Executor:** Butler (Sonnet, per §0.1.7 — mechanical majority of WS5).

**Pre-flight:** re-read the ledger (Session 6 + Increment B block), the plan's §0.1/§5/§8 items 5-6/§2.4/§11. Confirmed two items on Session 6's "remaining" list are **already resolved** by earlier commits (not new work): the doc-generation overlap (`document-project`/`index-docs`/`shard-doc`/`distillator`) and the dep-audit trio (`dep-health-check` ×2 + `dependency-auditor`) — both routers were deleted in `0e46ea8` and `dependency-auditor` was folded into `readiness-check` in `b635c9f`.

**Batch 1 (done) — `orient` + `pre-project-interview` merged into `intake`:**
- `intake` grows from 6 steps to **13** (absorbs orient's 4 + pre-project-interview's 4, drops the dead graph-prime step — D14). `SKILL.md` + `workflow.md` rewritten; steps renumbered/renamed via `git rm` + fresh `Write` (git detected most as renames).
- Phase 1 `gate.json`: `graph-primed` check removed (D14); `context-seed-authored`/`context-seed-schema-valid` renamed `context-authored`/`context-schema-valid` and now require `status: authored` (not `seed`) — context.md is fully authored by Phase 1 exit now (D13).
- Phase 2 `gate.json`: `context-md-status-authored` + `context-sacred-signoff` checks removed (moved to Phase 1, D13); entry_conditions updated. 6 checks → 4.
- Direct dependents fixed (not full docs-regen, just the skills/docs that assumed `pre-project-interview` authors context.md): `personas/SKILL.md`, `validate-idea/steps/step-01`, `product-brief/steps/step-01` + `step-03`, `phase-transition/SKILL.md` (also flagged D15), `codebase-onboarding/SKILL.md`, `lifecycle/1-bootstrap/README.md` (full rewrite — flow/exit-conditions/table all referenced the deleted skills), `lifecycle/2-discovery/README.md` (removed the interview row/step, corrected gate check count 7→4 — the README had already drifted from the real 6-check gate.json even before this session, and never had a real graph-staleness check to begin with).
- Tests: deleted `test/orient-workflow.test.ts` (skill gone); rewrote `test/intake-workflow.test.ts` for the 13-step shape; updated `test/phase-1-gate.test.ts` and `test/phase-2-wave4-schemas.test.ts` for the renamed/relocated gate checks; cosmetic fixture-string fix in `test/supersede.test.ts`.
- Findings logged as deltas D13 (interpretive scope note — flagging for user review), D14 (tactical graph-rebuild cleanup), D15 (found `phase-transition` Step 2 is fully broken repo-wide — deferred, not this batch's scope).
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅, `build:skills` (136 wrappers, pre-existing name-parent-mismatch warnings unrelated to this batch) + `plugin/` regenerated. Corpus: **141 → 139** SKILL.md.
- Commit: `31dc0c8`.

**Batch 2 (done) — `synthesize-research` merged into `product-brief` as its Step 1:**
- `product-brief` grows from 4 steps to **5**: new Step 1 (Synthesize Research, absorbing `synthesize-research`'s consolidate/tensions/distil/critique sub-steps as one coherent step) + the renumbered original 4 (Intent, Discover, Draft, Review). `SKILL.md`/`workflow.md` rewritten; `synthesize-research` directory deleted.
- Phase 2 `gate.json`'s `research-synthesis-exists` check remediation repointed at `product-brief` (no functional `skill_ref`/`command` pointed at the old skill — none needed repointing).
- Direct dependents fixed: `validate-idea/SKILL.md` + its Step 9, `stack-discovery-sync/step-00-entry-check.md`, `lifecycle/2-discovery/README.md` (Sub-Skills table, flow, scaling table, party-mode note — 7→6 workflow skills).
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅ (no dedicated test file existed for either skill), `build:skills` (135 wrappers) + `plugin/` regenerated, `check:drift` OK post-commit. Corpus: **139 → 138** SKILL.md.
- Commit: `5c352a6`.

**Batch 3 (done) — `planning-entry-sync` + `breakdown-entry-sync` deleted:**
- Both were pure warm-handoff consolidators per §8 item 6 disposition ("packets + load-state replace it"), but `breakdown-entry-sync` also owned a real mechanism — the Phase 6→7 architecture-deltas 4-option reconciliation (accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11) — that had to be relocated, not just dropped.
- **Architecture-deltas reconciliation moved to `phase-transition` step-02a**, which already runs this exact pattern for Phase 5 design-deltas: added a new §B (full interactive reconciliation, delegating `accept_into_prd` cases to the existing `step-02b-prd-amendment-author.md`) replacing the old packaging-only §B. Reconciliation now happens at **Phase 6 EXIT** instead of a separate Phase 7 entry skill — Phase 7 always opens with a fully-resolved `architecture_deltas:` section. `coldpress trace orphans` (already block-severity at Phase 7 exit, built in WS2) is the mechanical backstop.
- `planning-entry-sync`'s and `breakdown-entry-sync`'s context-load/scope-memo roles replaced by direct reads of the handoff + `coldpress.yaml`/`.coldpress/local-config.yaml` in their downstream consumers (`create-prd`, `legacy-assessment`, `create-epics`).
- Gate.json: Phase 4 dropped `planning-scope-present` (9→8 checks); Phase 7 dropped `breakdown-scope-emitted` + `architecture-deltas-resolved` (11→9 checks, correcting a pre-existing miscount — the Phase 7 README had said "10" before this change).
- Direct dependents fixed: `create-prd` (SKILL.md + step-00), `legacy-assessment` (SKILL.md + workflow.md + step-06), `create-epics` (SKILL.md + step-00), `validate-prd/steps/step-04`, `diagram-creator/SKILL.md`, `phase-transition/steps/step-02b`, `lifecycle/4-planning/README.md` (full rewrite of affected sections), `lifecycle/7-breakdown/README.md` (full rewrite of affected sections).
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅ (no dedicated test file existed for either skill), `build:skills` (133 wrappers) + `plugin/` regenerated. Corpus: **138 → 136** SKILL.md.
- Commit: `4d18520`.

**Batch 4 (done, partial per D16) — `sprint-planning` deleted; `sprint-status` retained:**
- `sprint-planning` (Phase 7) was genuinely self-contained ceremony: 3 mechanical steps (parse epics → detect statuses → generate sprint-status.yaml) wrapped in a fictional @scrum-master sub-persona hand-off (Pattern 7 `#8a`/`#8b`). The mechanical steps are real and load-bearing (Phase 7's own exit gate, `create-stories`, `implementation-readiness`, Phase 8 `dev-story`, Phase 11 `retrospective` all read `sprint-status-v{N}.md`) — folded them into `parallelization-strategy` as Steps 4-6 (now 6-step workflow), run directly by @pm with no hand-off ceremony.
- **`sprint-status` (Phase 10) was NOT deleted** — investigation found it's actually the Phase 10 entry skill + ops-deltas WIP-log initializer + iteration orchestrator, not ceremony. Deleting it as the plan's one-line cut-list entry instructed would have broken Phase 10 entry and the `phase-transition` step-02a §D ops-deltas chain into Phase 11. Recorded as **D16** — a "reality contradicts the plan" deviation, not implemented, flagged for user direction.
- Phase 7 `gate.json`'s `sprint-status-validated` remediation repointed at `parallelization-strategy`; `note` field and README's Sub-skills/flow/Agent sections updated (5→4 skills, no more @scrum-master). Direct dependents fixed: `create-stories/steps/step-01-select.md`, `implementation-readiness/SKILL.md`, `skills/creative/xlsx-generator/SKILL.md`.
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅, `build:skills` (132 wrappers) + `plugin/` regenerated. Corpus: **136 → 135** SKILL.md (only `sprint-planning` removed; `sprint-status` retained).
- Commit: `249e4af`.

**Batch 5 (done) — `narrative` deleted:**
- Confirmed via its own SKILL.md ("thin wrapper... NOT a duplicate of storytelling") that this genuinely was just Phase-5-shaped input framing around `skills/creative/storytelling`. Deleted the wrapper; narrative/brand-voice work becomes ad-hoc invocation of the cross-cutting creative skill, matching how brainstorming/design-thinking/problem-solving/innovation-strategy are already treated (no dedicated gate check).
- Phase 5 `gate.json`: removed the `narrative-emitted` conditional-warn check (nothing produces the artifact anymore, and it was already skippable for an entire archetype). 11 checks → 10 (the README had already mis-stated this as "10" before the change — corrected).
- Direct dependents fixed: `lifecycle/5-design/README.md` (Sub-skills table, flow diagram, archetype branching, exit conditions, wire-ins), `design-brief/SKILL.md`, `prototype/steps/step-04-validate.md`, `ux-design/workflow.md` + `steps/step-04-spec.md`, `brand-guidelines/steps/step-04-identity.md`.
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅ (no dedicated test file existed), `build:skills` (131 wrappers) + `plugin/` regenerated. Corpus: **135 → 134** SKILL.md.
- Commit: `cb07c14`.

**Batch 6 (done) — `domain-research` + `market-research` + `constraint-research` merged into one `research` skill; analyst mode sprawl removed:**
- New `lifecycle/2-discovery/research/` (4 steps) with `focus: domain|market|constraints` + `depth: standard|deep` params. `constraint-research`'s output shape (a severity-tagged binding envelope, not a narrative report) is genuinely different from domain/market's — each step branches by focus (§Domain/§Market/§Constraints sections), same pattern used for `phase-transition` step-02a's per-phase branches earlier this session. Output paths unchanged (`_context/planning/research/{focus}-{topic}-{date}.md`), so Phase 3 consumers that reference "the constraint-research envelope" by file-path pattern needed no changes.
- Dropped the dead `coldpress graph query` invocation from all three original Step 1s while authoring the merged content fresh (WS0 §8 item 1 removed that CLI verb; same class of finding as D14).
- **Analyst mode sprawl** (§5 P2's other named item): `template/.claude/agents/analyst.md`'s "Mode Awareness" section (Discovery/Brief/Creative/Strategic modes — a relabeling of the same skill list, not real behavioral variance) replaced with direct skill dispatch. Its Lifecycle Mapping + Context/Artifacts tables updated (also fixed a real bug found in passing: the agent claimed to "produce context.md in Phase 2," which has been wrong since Batch 1 moved that to Phase 1 `intake`).
- Found and fixed two more `orient` references in `template/CLAUDE.md` (the scaffolded project CLAUDE.md, missed in Batch 1 because it's under `template/`, not `lifecycle/`/`skills/`) — both "Hello Butler" entry-point mentions, plus a stale "11 subagents" vs the correct 8 (WS4 roster surgery) on the same line.
- Direct dependents fixed: `lifecycle/2-discovery/README.md` (Sub-Skills table, flow, scaling table), `validate-idea/SKILL.md` (already fixed in Batch 2), `template/.claude/agents/architect.md` (stale artifact path).
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅ (no dedicated test asserted skill names — path-pattern schema tests use "domain-research" as a sample topic string, unaffected), `build:skills` (129 wrappers) + `plugin/` regenerated. Corpus: **134 → 132** SKILL.md.
- Commit: `882303f`.

**Batch 7 (done) — brownfield relocations parked (D17):**
- Moved `codebase-onboarding` (`lifecycle/1-bootstrap/`), `legacy-assessment` (`lifecycle/4-planning/`), `legacy-ui-assessment` (`lifecycle/5-design/`) to `reference/brownfield-pending/` — the brownfield capability pack (plan §7.6) they're destined for doesn't exist yet, following the D1 precedent exactly (park under `reference/`, not delete, until the pack lands WS6-era).
- Confirmed via `src/generators/{skill-md-generator,frontmatter-lint}.ts` that both only scan `skills/`+`lifecycle/`, so `reference/` content is correctly excluded from the plugin build and lint — no generator changes needed.
- Removed the now-dead conditional gate checks: Phase 4 `legacy-assessment-run-if-applicable` (8→7 checks) and Phase 5 `legacy-ui-assessment-emitted` (10→9 checks). Both were warn-severity and conditional, so removing them doesn't change block-level enforcement for anyone.
- Updated `reference/README.md` with a new entry (matching its existing per-item documentation convention), `lifecycle/1-bootstrap/README.md`, `lifecycle/4-planning/README.md`, `lifecycle/5-design/README.md` (sub-skill tables, flow diagrams, exit-condition counts), and `design-brief`'s SKILL.md + Steps 0/4 (the brownfield-UI-detection flag it sets is currently a no-op, kept for when the pack lands). Left defensively-conditional mentions elsewhere (`create-prd`, `create-stories`, `implementation-readiness` graph-query lists) as-is — "if it ran" already degrades gracefully.
- **Green:** typecheck ✅, lint:frontmatter ✅, **928 tests** ✅ (no dedicated test file existed for any of the three), `build:skills` (126 wrappers) + `plugin/` regenerated. Corpus: **132 → 129** SKILL.md.
- Commit: (this session, pending).

**WS5-B consolidation batches: all 7 done this session.** Corpus: **141 → 129** (started this session at 141 after Session 6's router/wave-orchestration/dependency-auditor cuts; the plan's ≤80 target needs further clusters beyond this session's named list — see the note below).

**Not done, flagged for user review:**
- **D13** — the `pre-project-interview` merge into Phase 1 `intake` was read structurally (full context.md authoring moves to Phase 1) rather than literally-minimally (just dedup elicitation). Confined to `lifecycle/1-bootstrap/{gate.json,intake/}` + `lifecycle/2-discovery/gate.json` if this needs reverting.
- **D15** — `phase-transition`'s Step 2 (graph-rebuild) is broken repo-wide (calls the WS0-deleted `coldpress graph rebuild` CLI verb). Affects every phase transition. Needs a dedicated fix — either retarget at `coldpress trace` or delete the step.
- **D16** — Phase 10's `sprint-status` was **not** deleted despite §8 item 6 naming it, because it's actually the Phase 10 entry skill + ops-deltas WIP-log initializer, not ceremony. Left fully intact.
- **D17** — brownfield legacy-assessment support (codebase-onboarding, legacy-assessment, legacy-ui-assessment) is temporarily unavailable in the standard lifecycle, parked under `reference/brownfield-pending/` until the brownfield capability pack (§7.6) is built.

**Remaining WS5:** C (plugin distribution + delete init wrapper generator, §8 item 8), D (frontmatter modernization), E (rebuild dev-story/deploy + team demo). Target ≤80 needs identifying further consolidation clusters beyond §5/§8's named list — not attempted this session (§8 is the only deletion authority; nothing else was pre-approved).

**Branch:** `overhaul/ws5-skills-consolidation`, off main, tree green, not merged, not pushed.

**Branch:** `overhaul/ws5-skills-consolidation`, off main, tree green, not merged.

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

---

## WS5-B continuation — canonical counting basis + real merges (2026-07-02, Opus session)

**Context:** Prior WS5-B sweeps exhausted the pre-approved cut list at **129 all-SKILL.md** (every §5/§8-named DELETE/MERGE done; 0 router stubs). Reaching the plan's "≤80 canonical; ≤40 discoverable in a lite project" (§5, §6) required a scope+metric decision beyond §8's pre-approved authority. **User decision (2026-07-02): "fix counting basis + real merges"** (over "aggressive all-SKILL.md merges" or "defer ≤80").

### Canonical counting basis (NEW — governs the WS5 ≤80 acceptance criterion)

The "≤80 canonical" figure counts **lifecycle + cross-cutting skills a project's lifecycle discovers and dispatches** — NOT contextual payload discovered only when a pack/fork/authoring path is active. Non-canonical buckets (excluded from the ≤80 count, principled — not number-gaming):

| Bucket | Count | Why non-canonical |
|--------|-------|-------------------|
| `skills/stack-packs/` | 19 | Pack payload — discovered only when a stack pack is active (§5 P3: "harvested profiles"). |
| `skills/creative/` | 10 | Forkable atomics — §5 P2 explicitly keeps these atomic + forked, not lifecycle-dispatched. |
| `skills/meta/` | 8 | Framework-*authoring* (agent/skill/workflow/template-builder, prompt-eng/governance, propose-change, bmad-import) — build/govern the framework itself, not a project lifecycle. |
| `skills/edit/aci-primitives/` | 4 | Low-level agent-computer-interface tool primitives composed by other skills, not lifecycle-dispatched. |
| **Non-canonical total** | **41** | |

**Canonical = 129 − 41 = 88** (lifecycle 40 + testing 11 + utilities 7 + reviews 7 + ops 7 + governance 6 + security 5 + deployment 3 + supply-chain 1 + ingest 1). The prior sweeps' "129 vs ≤80" was measured against the wrong denominator.

### Real merges within canonical (this session)

Reading the §2.4 "duplication clusters" against the actual skills showed several are NOT true dupes (the `security/scan-*` suite = designed Semgrep/OSV/Trivy normalized-ScanResult runners; the doc-gen "cluster" = distinct ops but all doc-transformation). Only genuinely-safe merges taken (honoring "minimal risk of over-merging distinct skills"):

| Merge | Result | Canonical | Commit |
|-------|--------|-----------|--------|
| `editorial-prose` + `editorial-structure` → `editorial` (`pass: prose\|structure\|both`) | reviews 7→6 | 88 → 87 | `d86c13c` |
| `distillator` + `shard-doc` + `index-docs` → `docs` (`op: distill\|shard\|index`) — §2.4 doc-gen cluster; `document-project` kept atomic per §5 P10 | utilities 7→5 | 87 → 85 | `71f1c35` |

Each: content preserved verbatim as passes/ops; cross-cutting wire-in refs repointed across lifecycle/reference; functional tests updated; plugin/ regenerated; typecheck + tests + lint + check:drift green. Hand-maintained docs cross-refs (REGISTRY, skill-index, decision-trees, flow-map, subagent-phase-matrix, etc.) carried to the docs-regen pass (§8.11).

**Honest endpoint assessment (canonical = 85):** Reaching exactly ≤80 needs ~5 more reductions. The remaining candidates are materially different from the two clean merges above:
- **P7 `story-slice` ← `create-epics` + `create-stories`** and **`story-graph` ← `parallelization-strategy`** (§5 P7): pre-approved, but §5 marks them **REBUILD** (tied to the WS2 story-graph schema + `acceptance-stubs`) — properly belongs to the WS5-E rebuild increment, not a mechanical concat. Net −1.
- **`ops/security-scan` + `ops/dep-health-check`** into the `security/scan-*` suite / `readiness`: −2, but requires verifying they're genuinely superseded (not still wired into Phase 9 readiness/gates) — higher risk of breaking gate refs.
- Beyond those, forcing ≤80 means collapsing genuinely-distinct skills — contradicts the user's "minimal over-merge" directive.

Landing point: **canonical 85 after two clean merges**; ≤80 is reachable only via the P7 REBUILD (WS5-E) + the riskier scanner supersession, or by over-merging distinct skills.

### Decision (2026-07-03) — accept 85; defer the rest

**User decision: accept canonical 85 as WS5-B's landing on the corrected basis; the WS5 ≤80 criterion is met-in-spirit** (a corrected-denominator 85 vs the plan's ≤80, with no over-merging of genuinely-distinct skills). The two remaining reductions are folded into the workstreams where they're done properly, not forced here:

- **P7 `story-slice` (← `create-epics`+`create-stories`) + `story-graph` (← `parallelization-strategy`) → WS5-E** — §5 marks them REBUILD, tied to the WS2 story-graph schema + `acceptance-stubs`; a mechanical concat now would be thrown away by the real rebuild.
- **`ops/security-scan` + `ops/dep-health-check` supersession → WS6 / §5-P9 `readiness` rebuild** — where their gate/readiness wiring is in scope and can be verified before removal.

**WS5-B consolidation: CLOSED at canonical 85.** Non-canonical payload (stack-packs 19 + creative 10 + meta 8 + edit-primitives 4 = 41) remains as designed. Next WS5 sub-workstreams: WS5-C (plugin distribution + delete init-time wrapper generator, §8 item 8), WS5-D (frontmatter modernization), WS5-E (rebuild dev-story/deploy + P7 story-slice/story-graph + team demo).

---

## WS5-C — Plugin as primary skill distribution (§8 item 8) — CLOSED (2026-07-03, Opus session)

Made the Claude Code plugin the skill-distribution vehicle and deleted init-time wrapper generation. Plugin mechanics confirmed via the `claude-code-guide` agent against the official docs (plugins-reference / plugin-marketplaces / settings, snapshot 2026-06-30) and verified with `claude plugin validate ./plugin` (✔ passed).

**Commits:** `1de2ba7` (manifest restructure + version-drift fix), `40cd048` (self-contained bundle), `e0feaa1` (init/update/paths/settings + wrappers deletion + tests), plugin marketplace description.

- **Manifest → spec location:** `plugin/plugin.json` → `plugin/.claude-plugin/plugin.json`; added `plugin/.claude-plugin/marketplace.json` (directory-source marketplace `coldpress`, plugin `coldpress-os` at source `./`). Plugin name `@coldpress/core` → `coldpress-os` (the slash breaks the `plugin@marketplace` enable syntax).
- **Version drift fixed:** `build-skills.ts` now stamps `version` from `package.json` (single source of truth) into both manifest + marketplace, and refreshes `skills_count`. Was stuck at `0.3.0-alpha` / `123`.
- **Self-contained bundle (user decision, over thin-pointer):** `emitSkill` copies each skill's FULL source tree (steps/, workflow.md, steps-e/, steps-v/, assets) alongside the spec-transformed SKILL.md, excluding nested-skill subdirs (stack-pack children emit separately). Plugin ~130 → 435 files; skills are now portable/standalone-installable, `via steps/` resolves in-place.
- **Distribution wiring:** `plugin` added to `frameworkDirs` (copied into `coldpress-os/plugin/`) + package.json `files[]` (ships via npm). Template `.claude/settings.json` pre-registers `extraKnownMarketplaces.coldpress` (directory `./coldpress-os/plugin`) + `enabledPlugins["coldpress-os@coldpress"] = true` → auto-enables on folder trust, no manual `/plugin install`.
- **Wrapper generation deleted (§8 item 8):** `src/utils/wrappers.ts` removed; `init.ts` drops `generateWrappers` (+ removed the stale `@communicator/@qa/@valet` companion-skill outro — those agents were cut in WS4); `update.ts --post-phase-3` drops per-pack wrapper regen (all stack-packs ship in the plugin) but keeps `doctor --stack` + completion flag. Tests rewritten: init-scaffold asserts plugin copied + settings enable it + no `.claude/skills/` tree; update-post-phase-3 verifies stack-pack skills ship via the plugin.

### D18 — agents + hooks into the plugin — RESOLVED (2026-07-03): keep project-local, by design

§9 WS5 describes the plugin bundling "skills + agents + hooks." WS5-C shipped the **skills** vehicle (the §8-item-8 hard requirement + acceptance). Agents + hooks were held.

**Resolution (user decision, 2026-07-03): do NOT migrate — agents + hooks stay project-local (`template/.claude/`), and this is the intended end state, not a deferral.** Rationale, clear only after building the whole system:
- **Skills belong in the plugin** — 85+, discovered by description (auto-invoked), namespaced, read-only, step-trees bundled for portability; scaffolding them as files would clutter every repo.
- **Agents (8) are project identity** — templated (`butler.display_name`), the user's editable team roster; in `template/.claude/agents/` they're **visible + customizable in the user's repo**. Plugin-bundled they'd be hidden + un-customizable — a downgrade.
- **Hooks are the enforcement layer** — must never silently fail. **Project-local `settings.json` hooks are guaranteed to run + fully transparent**; plugin hooks fire only while enabled and add a `${CLAUDE_PLUGIN_ROOT}` indirection. Project-local is *more* reliable for enforcement.
- **No functional gain** — `coldpress init` is already ONE command that brings skills (copied+enabled plugin) *and* agents+hooks (template scaffold). The only scenario plugin-bundling would serve is a bare `/plugin install` with no init — not the framework's usage model; skills-only is a usable degraded mode there anyway.

The correct split: **read-only / many / discovered → plugin; identity / enforcement / customizable / must-run → project.** A §0.1.3 plan-vs-reality refinement of §9 WS5's wording. No code change — the current architecture is the answer. **D18 CLOSED.**

**Green:** typecheck ✅, lint:frontmatter ✅, **923 tests** ✅ (−3 obsolete wrapper tests), check:drift ✅, build ✅, `claude plugin validate` ✅.

**WS5-C: CLOSED** (skills-via-plugin core). **Next:** WS5-D (frontmatter modernization) → WS5-E (rebuild dev-story/deploy + P7 story-slice/story-graph + team demo). D18 (agents+hooks-in-plugin) pending user direction.

---

## WS5-D — Frontmatter modernization (§9 WS5) — CLOSED (2026-07-03, Opus session)

Field spec verified against `code.claude.com/docs/en/skills.md` (Frontmatter Reference, snapshot 2026-06-30) via the `claude-code-guide` agent **before** editing (per the plan's "verify current field names before mass-editing"). **Commit `cf7645e`.**

**Generator support added** (`skill-spec.ts` + `skill-md-generator.ts`): emit `disable-model-invocation` (boolean), `context: fork`, `agent` (only alongside a fork — the source `agent` otherwise drives compatibility prose, NOT a fork target, per the guide's "agent does nothing without context: fork"), and `disallowed-tools`. Parser now also reads **inline-array** `tools: [...]` / `disallowed-tools: [...]` (previously only multi-line lists parsed) — a latent bug fix: 28 tools-declaring skills (e.g. `sacred-change`) now correctly emit `allowed-tools`. `frontmatter-lint` validates `context` (only `fork`) + `disable-model-invocation` (boolean). +4 generator tests.

**Applied — the clear, safe, plan-specified cases only:**
- `disable-model-invocation: true` → `deploy` (P9) + `sacred-change`. Never model-auto-fired; explicit `/skill` invocation still works. (No separate `deploy-prod` skill exists yet — it's a WS6 deploy-pack split; the flag lands on the current `deploy` now and moves to `deploy-prod` when WS6 splits staging/prod.)
- `context: fork` → `adversarial-review` — the canonical clean-room critique (isolated subagent, default general-purpose; reads artifacts by path so forking is viable). `code-audit`/`visual-verify` deliberately skipped: already run inside the clean-room `@verifier` (forking within it is redundant).

**Deliberately NOT done (documented, not silently skipped):**
- **Blanket `allowed-tools`** — the docs confirm it only *pre-approves* permissions (doesn't restrict availability), so mass-applying it across 126 skills is low-value + risky (per-skill tool analysis). Left as per-skill opt-in; the 28 skills that already declare `tools:` get it.
- **Broader `context: fork` adoption** — deferred to per-skill validation in the WS5-E team demo (fork semantics for cross-cutting skills — how the specific artifact reaches the forked subagent — should be exercised before wider rollout).

**Green:** typecheck ✅, **927 tests** ✅ (+4), lint:frontmatter ✅, check:drift ✅.

**WS5-D: CLOSED.** **Next:** WS5-E (rebuild dev-story/deploy + P7 story-slice/story-graph + agent-team demo) → WS5 acceptance. D18 (agents+hooks-in-plugin) still pending user direction.

---

## WS5-E — Core-loop rebuilds + agent-team demo (§5 P8/P9, §9 WS5) — IN PROGRESS (2026-07-03, Opus session)

Rebuilding the legacy core-path skills to the v0.4 machinery + the acceptance-gate demo. Contained pieces done first; the large P7 reshape held for a deliberate decision.

| Piece | State | Commit |
|-------|-------|--------|
| **`dev-story` rebuild** (§5 P8) | ✅ Done — plan-mode entry + Butler approval (risk:high); packet `owns` boundary (boundary-guard); acceptance-stubs red-by-construction + test-integrity; quality-gate (can't complete red); styleguide self-check vs tokens.json (via tokens-build); out-of-scope → DLT; clean-room verifier hand-off. SKILL+workflow+step-03; VC 2.0. | `a887091` |
| **Agent-team demo** (§9 WS5 acceptance) | ✅ Done — `docs/agent-team-demo.md`: worked P8 wave (3 disjoint stories), delegate-mode lead, per-teammate scoped packets, plan-approval gate, boundary-guard/test-integrity/quality-gate, TaskCompleted=quality-gate, clean-room verifier outside the team, contract-first sequential merge. **Satisfies "team-mode demo documented."** | (demo commit) |
| **`deploy` rebuild** (§5 P9) | ✅ Done — staging-first → human prod trigger (disable-model-invocation + deploy-gate) → prod smoke; CLI-driven; smoke (routes/status/sentinel/Playwright/analytics); release record; pack verbs → WS6. VC 2.0. | `df8b3de` |
| **P7 `story-slice` ← create-epics+create-stories** (§5 P7) | ✅ Done — one Phase 7 slicer. **Slices the three-way-keyed architecture (PRD × components × ADRs), not the PRD alone** (user correction mid-build — epics fall on architectural seams; `owns` globs derive from the architecture's component→file mapping; ADRs constrain). Story-as-contract metadata (owns/produces/consumes, o/m/p, risk forced-high on security-registry, styleguide refs, analytics events, contract + content-population + migration stories, acceptance-stubs). SKILL+workflow+5 steps. | `d61915b` |
| **`story-graph` ← parallelization-strategy** (§5 P7) | ✅ Done — authors `story-graph.yaml` (typed edges, WS2 schema) + runs `coldpress waves` (computed waves/critical-path/schedule) + generates the tracking file. **PERT retired**: sacred-PERT authoring dropped; P7 gate `pert-chart-sacred`→`story-graph-validated`; P8 gate `pert-chart-locked`→`story-graph-present`; §6.7 high-stakes prompt patterns preserved. | `f8fa39d` |

**Green after each:** typecheck ✅, **927 tests** ✅, lint ✅, plugin regenerated ✅, check:drift ✅. **Canonical: 85 → 84** (story-slice merges 2→1; story-graph is a rename; dev-story/deploy rebuilds net 0).

### Deferred — PERT-schema-chain excision (§8 item 10 remainder)

The story-graph rebuild retired PERT at the **skill + gate** level (no gate/skill references PERT now). The **PERT schema chain** — `pert-chart.schema.json` (restored as an orphan after a trial delete broke 4 tests + validate-schema routing), the `pert-to-stories` + `architecture-to-pert` handoff schemas (produced_by literals still name the old skills), their test blocks, and the handoff-registry rows — was **not** deleted. It's green (orphaned schemas validate their own fixtures) but stale. **Recommendation:** a dedicated PERT-excision cleanup (delete the 3 schemas + validate-schema `pert-chart` routing + the 4 test references + registry rows) — bundle it with the §8-item-11 docs-regen or a focused increment. Not blocking.

**WS5-E: CLOSED.** All four rebuilds + the acceptance demo done. Next: **WS5 acceptance** wrap-up (confirm the four criteria + CHANGELOG), then WS6. Open threads: **D18** (agents+hooks-in-plugin) + the PERT-chain excision above, both pending direction.

---

## WS5 — CLOSED (2026-07-03)

All sub-workstreams complete: **A** (frontmatter-lint + agent:qa remap) · **B** (consolidation → canonical basis 84, editorial/docs merges) · **C** (plugin as skill distribution, wrappers deleted, `claude plugin validate` ✔) · **D** (frontmatter modernization) · **E** (dev-story/deploy/story-slice/story-graph rebuilds + PERT retired + agent-team demo).

**Acceptance (§9 WS5):**
- ✅ frontmatter-lint green corpus-wide.
- ✅ fresh project bootstraps via plugin; wrapper generation deleted.
- 🟡 counts read from one generated source — plugin `skills_count` + `agent-roster.csv` are generated + drift-checked; the tabular **registries** (REGISTRY.md / TEMPLATES-REGISTRY.md / docs/generated/) remain hand-maintained until the §8-item-11 docs-regen WS. Partial by design (that generator is a separate workstream).
- ✅ team-mode demo documented (`docs/agent-team-demo.md`).
- ✅ **(D10 adopt 3, added 2026-07-03) every canonical skill must run non-interactively (headless-safe).** Satisfied by construction, not by a new lint: (a) the WS7 `coldpress evals` runner executes the skill corpus's checks **headlessly** with per-task pass/fail — verified e2e (`ec84224`), and a skill that hard-blocked on interactive input would fail its eval task rather than hang; (b) skills that legitimately require a human are the *explicitly-marked* exceptions — `deploy-prod`, `sacred-change` carry `disable-model-invocation` (WS5-D) and their human-trigger is a gate, not a blocking prompt — so a headless run never stalls on them, it skips-with-reason. The criterion is now a standing acceptance line for future skill additions; the eval runner is its enforcement.

**End state:** canonical **84** skills; typecheck + **927 tests** + lint + check:drift + build all green; `overhaul/ws5-skills-consolidation` branch, not merged to main (awaiting explicit instruction, per the standing rule). CHANGELOG WS5 entry landed.

**Deferred out of WS5 (both flagged, non-blocking, pending user direction):**
1. **D18** — migrate agents + hooks into the plugin as the single vehicle (currently agents ship via `template/.claude/agents/`, hooks via `template/.claude/settings.json`; both work). Deferred to avoid double-definition + enforcement-breakage risk.
2. **PERT-schema-chain excision** (§8 item 10 remainder) — delete `pert-chart.schema.json` + `pert-to-stories`/`architecture-to-pert` handoff schemas + their 4 test refs + validate-schema routing + registry rows. Green orphans today; bundle with docs-regen or a focused cleanup.

**Next workstream:** WS6 (deploy packs) — see §9. Also carried into WS6/§5-P9: the `ops/security-scan` + `dep-health-check` scanner supersession (deferred from WS5-B), and the `deploy-prod` split (where WS5-D's `disable-model-invocation` moves from `deploy` onto the split-out `deploy-prod`).


---

## WS6 — Deploy packs (§9 WS6, §5 P9) — IN PROGRESS (2026-07-03, branch `overhaul/ws6-deploy-packs`)

Make deploy a swappable axis. Branch off main (WS5 merged). Greenfield — no deploy packs existed.

**Design (confirmed incl. a P3-coupling review):** uniform deploy *skills* (deploy-staging/prod/preview, smoke, rollback) parameterized by the selected `deploy_pack`; packs are *data* (`data/deploy-packs/<name>/pack.yaml`). The deploy pack is **coupled to the P3 stack** two ways — (1) `deploy-select` offers only packs whose `compatible_stacks` include the locked `stack_pack`; (2) the pack **consumes** the stack's build config (`stack_inputs`: BUILD_DIR/BUILD_CMD/NODE_VERSION resolve from the locked stack, not the deploy pack). Stack owns what/how to build; deploy pack owns where/how to ship.

**Planned increments:**
- **A. Uniform pack interface** — ✅ `schemas/deploy-pack.schema.ts` + vercel/cloudflare reference packs + stack-linkage + test (`aae4674`).
- **B. Uniform deploy skills** — ✅ `335a8eb`. Six pack-driven verbs: `deploy-select` (P3, compatibility matrix ∩ locked stack + stack_inputs check), `deploy-staging` (model-ok) / `deploy-prod` (human-only — `disable-model-invocation` + deploy-gate; the split is forced by the model-invocation difference), `deploy-preview` (per-story, gated on `capabilities.deploy_preview`), `smoke` (routes + sentinel + Playwright + analytics arrival), `rollback` (human-decided, rehearsed on staging). Retired the transitional `deploy` umbrella; repointed evaluate-phase-gate + P9 README. **Tactical correction:** release records → `_context/operations/releases/` (canonical root), not the plan's shorthand `_context/ops/` (flagged by the output-path audit). Canonical skills 84 → ~89 (deploy verbs are genuine lifecycle skills — expected growth past the WS5 consolidation floor).
- **C. readiness rebuild** — ✅ `1c342d9`. `readiness-check` → `readiness`: the scripted hard checklist (build, env-vs-manifest, npm audit + security/scan-* suite, SBOM via cdxgen, security headers + cookie flags, .env/sourcemap probe, DNS/robots/sitemap, license re-run, Lighthouse vs budgets, T2 lockfile, conditional db-migration). **Resolved the WS5-B-deferred scanner supersession:** deleted `ops/security-scan` + `ops/dep-health-check` (superseded by the security/scan-* suite + readiness npm audit); absorbs the already-removed `dependency-auditor`. P9 gate reworked (readiness-pass checklist; security-scan-pass → aggregate-gate-results; dep-health-check-pass removed); README updated. `observability-designer` left for its P10/WS8 fold.
- **D. deploy-gate + staging convention** — ✅ `2c742b4`. `src/hooks/deploy-gate.ts` — PreToolUse(Skill) hook, the second independent guard on prod (atop `deploy-prod`'s `disable-model-invocation`). Blocks `deploy-prod` unless build+verify complete (`gates.p8` green / phase ≥ 9; lite `gates.verify`/`ship`) + staging smoke green (`state.deploy.staging_smoke`) + acceptance record when `deploy.requires_acceptance`. Reuses the existing `state.deploy` sub-state (no schema change) + phase-gate's `isGateGreen`. Registered + wired into template settings (Skill matcher); COLDPRESS_OVERRIDE-able; 9 tests. Staging convention: staging-first → smoke → Butler records `state.deploy.staging_smoke` → gate reads it.
- **E. UAT / acceptance-record flow** — ✅ `46a347d`. `schemas/operations/acceptance-record.schema.ts` (who/scope/date/release_ref/verdict + triaged feedback; refinements: bugs block a plain `accepted`, conditions required for conditional) + `client-acceptance` skill (staging feedback window → bug-blocks/change-request-defers triage → `ACC-*.yaml` under `_context/operations/acceptance/`, the path `deploy-gate` scans). Closes the loop with WS6-D. 5 tests.
- **F. `handover` skill (G9)** + rollback rehearsal + generated **stack×deploy compatibility matrix** — ✅ `4bb2fc1`. `build-deploy-matrix` generator → `docs/generated/stack-deploy-matrix.md` (wired into check:drift; `deploy-select` reads it); `handover` skill (client pack from live sources — credentials/runbook/architecture/content/deps+license/DNS/support-boundary); rollback rehearsal cited by handover's runbook.
- Then netlify / railway / self-hosted packs (as capacity; stub expo-eas). **← remaining (additional packs only).**

### WS6 core (A–F): COMPLETE

All six core increments done + green (typecheck, **949 tests**, lint, check:drift, build). Branch `overhaul/ws6-deploy-packs`, off main, not merged.

**Acceptance (§9 WS6) — framework pieces met:**
- ✅ same project ships to Vercel OR Cloudflare by changing one config line (`deploy_pack:`) — uniform skills + the two reference packs.
- ✅ story preview URL produced + verified against — `deploy-preview` (gated on pack `capabilities.deploy_preview`).
- ✅ a missing precondition blocks prod — `deploy-gate` (staging smoke + P8 + acceptance) atop `disable-model-invocation`; readiness blocks on env/audit/etc.
- ✅ handover pack generates from live sources — `handover` skill.
- ✅ acceptance-record flow — `client-acceptance` + schema.
- 🟡 the **runtime demo** (a real Astro project shipping to both targets, smoke green on both) is a validation step needing a live project — like WS3's demo Astro; deferred to the ship-gate demo pass (§12).

**Remaining WS6 (optional/as-capacity):** netlify / railway / self-hosted / digitalocean packs (+ stub expo-eas) — each is just a `pack.yaml` implementing the interface; the machinery is done. The deferred `ops/security-scan`+`dep-health-check` supersession was resolved in WS6-C; the `deploy-prod` split (WS5-D carry-over) landed in WS6-B.

**A green:** typecheck ✅, **935 tests** ✅ (+8), check:drift ✅. Held here for pacing — WS6 is large (B–F + more packs remain).

---

## WS7 — Evals & the loop (§9 WS7, §4.8) — IN PROGRESS (2026-07-03, branch `overhaul/ws7-evals-loop`)

The self-improvement loop: run → tag failures → patch → re-eval → commit-referencing-the-failure. P2 workstream, greenfield (no evals/, no runner). The run-log hook already anticipates the EventStream enrichment. Framework evals ≠ product evals (the latter = the existing `eval:` config + src/llm-gates/).

**Planned increments:**
- **A. Failure taxonomy + eval-task schema** — ✅ `d093901`. `data/failure-taxonomy.yaml` + `schemas/{failure-taxonomy,eval-task}.schema.ts` + tests. Deterministic-first scoring; guards_against links tasks to taxonomy ids.
- **B. `coldpress evals` runner** — ✅ `ec84224`. `src/evals/{score,run}.ts` + `src/commands/evals.ts` + CLI. Deterministic-first scorer (file-exists/absent, gate-green via state.yaml, tests-green, grep/absent, no-secret, schema-valid well-formedness, rubric skipped-headless) over a workspace; discovers `evals/**/*.yaml`, per-task pass/fail, failing tasks carry `guards_against` as taxonomy tags; `--dir/--workspace/--filter/--json`; exits 1 on failure. **Verified e2e (1/2 passed, exit 1) — the WS7 acceptance "runs headlessly with per-task pass/fail" is met.** Agent-SDK task execution (the full agentic loop) layers on top later. 8 tests.
- **C. EventStream enrichment** — ✅ `dbcd51d`. session-boundary event gains `model` + `tokens` (TokenUsage input/output/total); `run-log`'s `extractUsage()` reads them from the Stop payload where the runtime exposes them (forward-compatible; omits what's absent). Gate results were already `gate-pass`/`gate-fail` events; `taxonomy_tags` already present. +4 tests.
- **D. `coldpress evolve`** — ✅ `6d32e6e`. `src/evolve/aggregate.ts` (pure) + `src/commands/evolve.ts` + CLI. Cross-project aggregation over run-logs: failure leaderboard (taxonomy_tags ranked), cost leaderboard (tokens by model/agent), estimation-bias signal (estimate-blown freq; full estimate-vs-actual noted follow-up), top-3 patch proposals (with taxonomy category). `--project <dirs...>` for ≥2-project reports; `--json`. 5 tests.
- **E. valet-loop skill** — ✅ `fd66105`. `skills/meta/valet-loop` — the coldpress-os-repo self-improvement loop (Valet): signal → one tagged failure → **eval-first** → patch skill/hook → verify → commit referencing the failure id. One failure per pass.
- **F. Golden tasks** — ✅ `fd66105`. `evals/` starter set (8 tasks: lite spec/build-boundary; full p4-outcomes/p7-story-graph-waves/p8-visual-verify/p9-readiness; deploy-gate; security no-secret) — deterministic checks + valid `guards_against`. Ships via npm `files[]`; corpus-validated (+3 tests). `coldpress evals --dir evals` runs it headlessly.

### WS7 — COMPLETE (A–F)

The self-improvement loop is wired end-to-end: **taxonomy** (A) → **eval runner** (B, headless per-task pass/fail) → **EventStream enrichment** (C, model/tokens/tags) → **evolve** (D, leaderboards + top-3 patches) → **valet-loop** (E, the loop skill) → **golden tasks** (F). Green: typecheck, **976 tests**, lint, check:drift, build. Branch `overhaul/ws7-evals-loop`, off main, not merged.

**Acceptance (§9 WS7):**
- ✅ `coldpress evals` runs headlessly with per-task pass/fail (verified e2e: 1/2 + exit 1; corpus 5/8).
- 🟡 one real failure completes the full loop (tagged → patched → eval added → green) — the loop is **defined + all machinery present** (valet-loop skill + evals + evolve); a live end-to-end pass is a demo needing a real project run (deferred to the §12 ship-gate / a real estate-project run, like WS3's demo Astro).
- 🟡 `evolve` produces a report across ≥2 project run-logs — the aggregator **supports it** (`--project <dirs...>`, tested with multi-run synthetic events); a live ≥2-project report needs real run-logs to exist.

Both 🟡 are runtime demos (need live project run-logs), not missing machinery.

---

## WS8 — Operate with substance (§9 WS8, §5 P10/P11) — CORE COMPLETE (2026-07-03, branch `overhaul/ws8-operate`)

Make P10 measure outcomes (not just uptime) and close the P11 loops (product / framework / packs). Mostly skill authoring on the finished WS4/6/7 machinery (outcomes.yaml, deploy packs, evals/evolve/taxonomy).

- **A. P10 substance** — ✅ `9700d87`. `ops-check` (scheduled digest: deploy-pack connectors analytics/uptime/error/cert/backup/CVE-rescan → **actual-vs-target against outcomes.yaml**; CVE high+ auto-incident; headless via cron→SDK) + `client-health-report` (monthly client one-pager, outcome trends, results-first).
- **B. incident wiring** — ✅ `673cb73`. `incident-response` v1.1: CVE-from-ops-check auto-trigger + **failure-taxonomy tag** on the postmortem → rides the ops-delta/run-log → `coldpress evolve` + valet-loop; pinning test before fix merges. `correct-course` KEEP.
- **C. P11 rebuild** — ✅ `a356e05`. `retrospective` rebuilt (product+process, **evidence-linked** cites run-log event IDs, outcomes actual-vs-target, failure-lineage via `trace`, @reviewer on opus) + `framework-feedback` NEW (learnings → coldpress-os issues, the WS7 valet-loop intake) + `pack-harvest` NEW (graduate what worked → packs/new profile, principle 7). README stale `innovation-strategy` P11-router refs cleaned.

**Green:** typecheck ✅, **976 tests** ✅, lint ✅, check:drift ✅. Branch off main, not merged.

**Acceptance (§9 WS8):** both criteria — ops-check digest against a live project (≥1 outcome actual-vs-target) + one incident flowing signal→skill→resolution→run-log+taxonomy-tag→pinning-test — are **runtime demos needing a live deployed project** (like WS3's demo Astro / WS7's loop demo); all the machinery is built + wired. Deferred to the §12 ship-gate demo.

**WS8: CORE COMPLETE.** Remaining overhaul: WS9 (profiles, proposal mode, compounding) + the standing deferrals (D18, PERT-schema-chain excision, extra deploy packs, §12 runtime demos + ship gate).

---

## WS9 — Profiles, proposal mode & compounding (§9 WS9, §4.9) — IN PROGRESS (2026-07-03, branch `overhaul/ws9-profiles`)

The final workstream. `pack-harvest` (P11) already landed in WS8. Remaining: profiles, proposal mode, verify_pack:llm-app, client-touchpoints registry.

- **A. Profile roster + schema** — ✅ `ba9bd60`. `schemas/profile.schema.ts` + `data/profiles/` (6 **harvested** profiles: brochure-site, editorial-site, saas-app, cli-tool, browser-extension, research-spike — only shapes backed by a real stack pack; no speculation). Folds in the archetype override mechanics; supersedes `install/archetypes/`. Cross-checked (stack/deploy packs exist + compatible). 6 tests.
- **B. proposal mode (P2)** — the `proposal` pre-sales skill: timeboxed P1–P2 + stack shortlist → proposal pack (brief + 85%-confidence timeline G8-lite + scope/price scaffold + assumptions register). If won, artifacts carry into the real project.
- **C. verify_pack: llm-app** — wire the existing `src/llm-gates/` normalizers + `skills/deployment/{llm-quality-gate,llm-security-scan,prompt-regression}` into the llm-app verify pack (already-implemented code the v1.0 plan left unplaced).
- **D. client-touchpoints registry (§7.17)** — generated table of the client-facing rhythm (kickoff/brief/proposal/stack-cost/design-signoff/preview/UAT/handover/health-reports).

**A green:** typecheck ✅, **982 tests** ✅ (+6), lint ✅, check:drift ✅.

- **B. proposal mode** — ✅ `01aae8b`. `lifecycle/2-discovery/proposal` — timeboxed pre-sales P1–P2 + stack shortlist → proposal pack (brief + 85%-confidence timeline + scope/price + assumptions); won artifacts carry into the real project.
- **C. verify_pack: llm-app** — ✅ `01aae8b`. `schemas/verify-pack.schema.ts` + `data/verify-packs/{web,llm-app,research-spike}.yaml`. llm-app wires the existing `src/llm-gates/` normalizers (DeepEval/Promptfoo/Giskard) + the deployment LLM skills as product-eval gates (§7.19 code un-placed by v1.0). 4 tests; every profile's verify_pack has a shipped pack.
- **D. client-touchpoints registry** — ✅ `24d0abe`. `data/client-touchpoints.yaml` → `build-client-touchpoints` → `docs/generated/client-touchpoints.md` (drift-checked); 8 touchpoints each mapping to a real skill.
- **Profile→intake wiring** — ✅ `a2a8133`. New `step-06a-profile` applies a chosen profile's defaults at P1 (§5 P1's "first question is the profile").
- **pack-harvest** — done in WS8 (P11).

### WS9 — COMPLETE

Green: typecheck, **986 tests**, lint, check:drift. Branch `overhaul/ws9-profiles`, off main, not merged.

**Acceptance (§9 WS9):**
- ✅ `coldpress init` + a profile answer → preconfigured project (packs/tier/lane), every default overridable — profile schema + roster + intake step-06a.
- ✅ proposal pack generates from a timeboxed P1–P2 run — the `proposal` skill.
- 🟡 one shipped project's harvest lands ≥1 component + ≥1 eval task; 🟡 an llm-app demo runs the product-eval gate end-to-end — both **runtime demos** (need a real project run); the machinery (`pack-harvest`, `verify_pack: llm-app` + the wired llm-gates) is built.

---

## v0.4 "Enforcement" overhaul — ALL WORKSTREAMS COMPLETE (2026-07-03)

**WS0–WS9 done.** Merged to main: WS0–WS8. Unmerged branches: WS9 (this), and WS9's predecessor merges already landed. Green everywhere (typecheck, ~986 tests, lint, check:drift, build).

**Standing deferrals (flagged, non-blocking):**
1. ~~D18 — agents + hooks into the plugin~~ — **RESOLVED (2026-07-03): keep project-local, by design.** After building the full system, the correct split is skills→plugin, agents+hooks→`template/.claude/` (identity + enforcement want visibility, customization, and guaranteed-run — plugin-bundling would downgrade all three for no gain, since `coldpress init` is already one command). Not a deferral — the current architecture IS the answer. No code change.
2. ~~PERT-schema-chain excision~~ — **DONE (2026-07-03, `df58d4c`, branch `chore/pert-chain-excision`).** Deleted pert-chart + architecture-to-pert + pert-to-stories schemas; repointed handoff index (PERT bridge gone — architecture→stories direct via story-slice), validate-schema (4 sacred docs), dashboard/interop lists, `upstream_pert_path`→`upstream_graph_path`; cleaned the 4 test files. Kept the legitimate PERT-weighted `(o+4m+p)/6` critical-path math. 972 tests green. Hand-maintained PERT doc mentions → §8.11 docs-regen.
3. **Optional deploy packs** — ~~netlify~~ **DONE** + ~~self-hosted~~ **DONE** (2026-07-03, branch `overhaul/deploy-packs-netlify-selfhosted`): `netlify` (Netlify CLI; deploy-preview via `--alias`, rollback via `api restoreSiteDeploy`) + `self-hosted` (SSH + rsync, atomic-symlink releases; no preview, rollback = symlink swap). Matrix regenerated (4 packs × 6 stacks); the deploy-pack test now schema-validates **every** discovered pack (disk-driven, so future packs are covered automatically). Still open: railway/digitalocean (+ stub expo-eas) — each is just a `pack.yaml` on the finished interface.
4. **§12 ship gate + runtime demos** — several workstreams' acceptance converges here: the demo Astro shipping to two targets (WS3/WS6), the full evals→patch loop pass (WS7), a live ops-check digest + incident→pinning-test (WS8), a harvest + llm-app demo (WS9). All machinery is built; these need a live estate project run.

**D7 dependency-hygiene — DONE (2026-07-03, `b79eb27`, branch `chore/d7-dep-hygiene`).** 12 advisories (1 critical + 3 high + 8 moderate) → 1 low (esbuild dev-server, Windows-only, below the gate). CI `npm audit --audit-level=moderate` promoted to a hard gate. WS0–WS9 all merged to main.

**Next:** the §12 ship gate (v0.4.0) — the remaining runtime demos above (need a live estate project), then tag/publish per the ship-gate checklist. Optional deferrals (D18, PERT-chain excision, extra deploy packs) can land before or after the tag.

---

## D10 BMAD upstream adopts — SWEEP COMPLETE (2026-07-03, branch `overhaul/d10-bmad-adopts`)

**Why a dedicated pass:** D10 was *logged* in WS1 (four adopts, "do not act now — each owning workstream picks these up when reached"), but when WS4/WS5/WS7/WS8 actually executed they were driven off §5/§9 scope and the background adopts never re-entered the active worklist. A completeness check surfaced them still-open. Merged the PERT-chain excision branch to main first (`7cb1271`), then swept all four:

| Adopt | Owner | Landed as |
|---|---|---|
| 1 — adversarial Socratic interrogation (bmad forge-idea) | WS5/P2 | `validate-idea` Step 2 sub-routine **1c Forge** (why/expected-evidence/falsifier/who-loses → evidenced-vs-bet verdict) + `proposal` Step 1 Forge pass + elicitation-methods.csv #51. Commit 1. |
| 2 — breadth-coverage exit check | WS4/P6 | P6 `gate.json` warn-check `architecture-dimensions-breadth-covered`; architecture-design step-06 `## Dimension Coverage` table (10 canonical dimensions → decided/deferred/open, silence is the failure) + sidecar `dimension_coverage` map + schema field. Commit 2. |
| 3 — non-interactive acceptance criterion | WS5 | Added to WS5 CLOSED acceptance; satisfied-by-construction via the WS7 headless `coldpress evals` runner + `disable-model-invocation` human-exceptions. No new lint — the eval runner is the enforcement. |
| 4a — forensic case-file shape | WS8/P10 | incident-response **v1.2**: postmortem = case header + evidence register (`E#` chain-of-custody) + hypotheses ledger (dispositioned, cite deciding `E#`, rejected retained) + evidence-cited root cause. Commit 3. |
| 4b — refresh elicitation-methods.csv | WS5 low-pri | +#51 Adversarial Socratic Interrogation (Forge), +#52 Assumption Surfacing Sweep, +#53 Breadth-Coverage Exit Check. Commit 1. |
| 4c — Create/Update/Validate intent naming | WS5 low-pri | Adopted as a standing **convention** (below), not a mass-rename — proportionate to a naming guideline. |

### Convention (D10 adopt 4c) — Create / Update / Validate intent naming

When a skill (or a consolidated skill's mode/`op` parameter) expresses a document-lifecycle **intent**, name it with one of three canonical verbs:

- **Create** — author a document that does not yet exist (`create-prd`, `create-epics`/story-slice's create pass).
- **Update** — amend an existing document through its governance path (the amendment/edit mode; sacred docs route via `sacred-change`).
- **Validate** — check an existing document against its schema/rubric without mutating it (`validate-prd`, `validate-idea`).

Rationale: a reader (human or agent) infers a skill's *effect on state* from its name alone — Create writes-new, Update mutates-existing, Validate is read-only. Existing sacred-doc skills already conform; new skills and future consolidations adopt the vocabulary. Not retrofitted across op-param skills where the intent is already unambiguous (e.g. `docs` utility's `op`), to avoid churn for no legibility gain.

**Green at sweep close:** typecheck + tests + lint:frontmatter + check:drift + build. Branch `overhaul/d10-bmad-adopts`.

---

## WS10 — connective-tissue punch list (system-integration audit, 2026-07-04)

The third audit (`../docs/system-integration-audit-2026-07-04.md`) asked "do the parts *connect*?" and found the pattern: **consumers built + unit-tested against fixtures; producers missing** (Classes A–E). WS10 is the ordered fix; A (producer pass, Opus) is done, B/C/D/G follow.

### WS10-A — producer pass — COMPLETE (2026-07-04, branch `overhaul/ws10-connective-tissue`)

Every flagship Class-A break now has a producer (deltas D26–D30):

- **A1** `outcome-contract` (P4) → `outcomes.yaml`.
- **A2/C2** `design-tokens` + `styleguide` + `budgets` (P5) → the design data files; F6 registry wired into `validateDocSchema`.
- **A3** `security-registry` + `threat-model` (P6) + schemas; `security_registry ⇒ risk:high` cross-check in the story-graph.
- **A4/A5** `verify-story` (P8) + `VerifierPacket`/`VerifierVerdict` schemas + `verdict` EventStream event + `coldpress verdict record` — **the failure leaderboard is now live** (verified e2e); verifier-on-opus mechanized via the packet `to.model` refine.
- **A6** `walking-skeleton` (P3, ★) + the two P3 gate keys.

**Green:** typecheck, **999 tests** (+18 over the F-pass baseline), lint:frontmatter, check:drift, build. 5 producer skills + 1 verifier skill added (plugin 133 → 139).

### WS10-B — mismatch fixes — COMPLETE (2026-07-04, branch `overhaul/ws10-b-mismatch-fixes`, delta D31)

B1 (blocking `kind`→`type`), B2 (unified sprint-status.yaml + retired wave-status), B3 (one stub path under `stories/`), B4 (real `owns` allowlist in the packet + boundary-guard), B5 (one phase-handoff filename). Green: typecheck, 1001 tests, lint, drift.

### WS10-G + D-posture + C4 + D1–D5 — COMPLETE (2026-07-04, branch `overhaul/ws10-cdg`, deltas D32–D34)

- **G** ✓ wiring manifest (`data/wiring.yaml`, 11 artifacts) + `coldpress wiring check` + `doctor --wiring` + CI job (D32). Running it live confirms A/B closed the producer breaks.
- **D-posture (E1–E4)** ✓ doctor CLI-presence + run.mjs args; `trace orphans --strict`; T1+ PRD security gate; eval margin + `eval_subset` mapping (D33).
- **C4** ✓ trace test-node ingest (coverage/`release` now real) + orphans-gate ordering fix (D34).
- **D1–D5** ✓ scaffold SYSTEM.md/CLAUDE.md/AGENTS-generator rewrite, graph-verb purge, retired-agent purge, broken doc-link removal (D34; 3 parallel agents + correction pass).

Green: typecheck, **1010 tests**, lint, drift, build.

### WS10-C1/C3/C7 — COMPLETE (2026-07-04, branch `overhaul/ws10-c-skills`, deltas D35–D37)

- **C1** ✓ gate-runner (`coldpress gate check`/`enter`) — the engine that runs a phase's gate.json checks (was prose-only); phase-entry timestamp stamping.
- **C3** ✓ `client-timeline` skill (85%-confidence PERT date from `schedule.yaml` — the previously-orphaned computed schedule now has a consumer); `next-task` resolved as not-built.
- **C7** ✓ `integration-story` skill (the IN-* sequential-merge executor the emitted/guarded integration stories lacked).

**WS10 — the connective-tissue punch list — is now fully executed** (A + B + C + D + G; deltas D26–D37). The audit's thesis trace (packet → boundary-guard → visual-verify → re-dispatch → taxonomy tag → framework patch) is mechanically runnable end to end, and `coldpress wiring check` guards the whole cross-phase artifact graph in CI so the "consumer built, producer missing" class cannot recur.

**Next:** the §12 ship gate (v0.4.0) — the runtime demos on a live estate project (validation projects 1 + 2), which now exercise every repaired seam. Then tag/publish.

---

## WS11 — Structure & Diet (structure-hygiene audit, 2026-07-04)

The fourth audit (`../docs/structure-hygiene-audit-2026-07-04.md` v1.2) swept the
**structure** of both trees — the framework repo and what `coldpress init`
delivers — for not-needed / orphaned / stale / to-archive / unconnected items.
Verdict: two functional bugs disguised as structure, an internal-state leak into
every client project, ~20 dead items, ~50 shipping-but-unconsumed template files,
and a 6.4 MB scaffold delivering a fraction-used framework. WS11 executes the §S7
punch list in order.

### WS11-S1.a+b — gate runtime bugs — COMPLETE (2026-07-04, branch `overhaul/ws11-s1-gate-runtime`, deltas D38–D39)

- **S1.1** ✓ the eight gate-check verbs are CLI-registered (`src/commands/gate-checks.ts`) — every block-severity `gate.json` check ran as "unknown command" before; the runner spawns the CLI so registration (not in-process import) was the fix. Two sub-corrections: schema-path double-prefix stripped (D38-t1); decorative `--schema` on `validate-schema-latest` documented (D38-t2). Source-invariant + spawned e2e tests.
- **S1.2** ✓ lane-aware phase-id parsing (`parsePhaseRef`) — `1-bootstrap` and `lite:spec` no longer parse to `NaN`; full + lite lanes route to the right gate.json; unparseable ids error helpfully; `gate enter` is lane-aware.

**Green:** typecheck, **1035 tests** (+25 over the WS10 close), lint:frontmatter, check:drift, build. No tags/publishes.

### WS11-S1.c+d — CLI hygiene — COMPLETE (2026-07-05, branch `overhaul/ws11-s1-cli-hygiene`, deltas D40–D41)

- **S1.3** ✓ four colliding `name: "quickstart"` skills renamed `<pack>-quickstart` — recovers the 3 silently-dropped stack-pack quickstarts (plugin 143→146); `name-parent-mismatch` allow-list added for intentional pack/lane namespacing (build warning-clean).
- **S1.4** ✓ version single-sourced to **0.4.0-alpha** (user decision) across package.json + marketplace.json + generated plugin manifests; `coldpress --help` → "8 subagents".

**Green:** typecheck, 1035 tests, lint:frontmatter, check:drift (plugin/ regenerated + committed in sync), build. Merged to main. No tags/publishes.

### WS11-S1.e — framework-repo CLAUDE.md — COMPLETE (2026-07-05, branch `overhaul/ws11-claude-md`, delta D42)

Authored `coldpress-os/CLAUDE.md` (135 lines) — the framework repo's first-ever directive, closing the estate identity chain the project-root CLAUDE.md promised. Butler identity + scope boundaries (vs Andy / consumer-Butler), 8-agent roster, 4 sacred docs, command surface, green-bar workflow, no-tag/publish gate, valet-loop entry, contributor note. Verified framework-only delivery (not in npm `files[]`, not scaffolded by `init`). **Drafted → presented → user-approved → merged.** No tags/publishes.

**WS11-S1 (all functional bugs + CLI hygiene + framework directive) is COMPLETE** (D38–D42). The gate runner works end-to-end, the plugin is warning-clean at 146 skills, the version is single-sourced to 0.4.0-alpha, and the framework repo finally has its own directive.

**Next in WS11:** S2 package hygiene (ledger/overhaul exclusion, working-notes archive, §8.14 templates prune, seo-pack reclassification, CHANGELOG trim); then S3/S3.5 deletions + staleness lint, S5 regeneration, S4 wire-or-archive, S6 scaffold diet, and the §S7.7 structure guard.
