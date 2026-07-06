# Validation Project 2 — Log ("Ancient Games")

> The §12 ship gate requires **two** real end-to-end runs of the shipped
> framework. VP1 (`validation-project-1-log.md`, "Brew & Bloom") exercises the
> **lite** lane on a throwaway brochure brief. This is VP2: the **full 11-phase
> lane** on a **real IP product**, driven through the verifier + agent-team path
> and including a **styleguide-driven UI story** — exactly the VP2 shape the plan
> mandates (§10, "one full-lane feature on an IP product through verifier +
> agent-team path, including a styleguide-driven UI story"). Its purpose is
> **not** to ship a game — it is to exercise the full-lane seams (all phase
> gates, hooks, the 8-agent roster, sacred-doc governance, the design system,
> the verifier clean-room) against a real build and **harvest the first
> full-lane failures as eval cases**. Every ⚠/✗ below is a candidate for
> `evals/`.

- **Subject:** Ancient Games — a collection app for ancient board games, seeded
  by chaturanga (the 6th-century Indian ancestor of chess), with room for
  Ashtapada, Pachisi, Senet, Mancala, Go, and the Royal Game of Ur. A board
  game is a state machine + a renderer; v1 is local play + a minimax AI, no
  backend. Real UI, real design surface → genuinely exercises Phase 5 (design)
  and a styleguide-driven UI story in Phase 8.
- **Why this subject:** it is a real **ColdPress Labs IP product**
  (`lab-originals/originals-p004-ancient-games`), not a throwaway. The plan's
  VP2 spec calls for an IP product specifically. Contrast VP1, whose subject
  lives at `validation/brew-bloom/` (disposable). VP2's subject is the actual
  originals-p004 build — the validation run and the product build are the same
  artifact. **Protocol note:** this is a deliberate divergence from VP1's
  throwaway-subject convention, justified by the plan's explicit "IP product"
  requirement.
- **Location:** `lab-originals/lab-originals-projects/originals-p004-ancient-games/originals-ancient-games-devSandbox/`
  — the project's own devSandbox (its inner git repo), **outside** the public
  framework repo. Refresh branch: `vp2/refresh-to-0.4.0`.
- **Lane:** full (Bootstrap → Discovery → Tech-Stack → Planning → Design →
  Architecture → Breakdown → Implementation → Deployment → Operate → Evolve).
- **CLI under test:** local build `0.4.0-alpha` on PATH (`/opt/homebrew/bin/coldpress`),
  so the scaffold's hooks resolve `coldpress` exactly as a published consumer
  would.
- **Driver:** the project's **own Butler**, run as a real Claude Code consumer
  session inside the devSandbox (`Hello Butler`). This is the most faithful VP2
  possible — unlike VP1 (framework-Butler hand-executing the lite skills), the
  consumer session's Butler literally dispatches the scaffolded project's
  subagents (@analyst, @architect, @pm, @ux-designer, @developer, @verifier,
  @devops, @reviewer). Findings are harvested framework-side into this log
  between phases.

---

## Phase 0 — Refresh a pre-overhaul install to 0.4.0 (setup)

VP2's subject was **not** a fresh scaffold: originals-p004 was `coldpress init`-ed
on **2026-06-26** against a **pre-overhaul (v0.3.x)** framework and never advanced
past Phase 1. Bringing it onto the shipped 0.4.0-alpha framework was Phase 0 — and
it surfaced the run's first finding before the lane even started.

Severity: **✗ blocker** · **⚠ friction** · **○ note**.

| # | Phase | Sev | Observation | Disposition |
|---|-------|-----|-------------|-------------|
| P0-1 | Setup | ⚠ | **No supported v0.3→v0.4 upgrade path.** A pre-overhaul scaffold (old 11-agent BMAD roster, `.claude/skills/` wrappers, **no `.claude/settings.json` → zero hooks**, no lane concept, stale `_context/` 5-doc world) cannot be migrated in place. `coldpress update` only regenerates interop/managed files — it does not swap the roster, introduce the lane model, re-vendor `coldpress-os/`, or wire hooks. `coldpress init --retrofit` is **non-destructive** (`force:false`) so it will not refresh stale scaffold files either, and `assertNoCollision` refuses if `coldpress.yaml`/`.claude/`/`coldpress-os/` still exist. The only clean path was a **re-init in place**: remove the stale scaffold surface (preserving `_input/` + `secure/`), then `coldpress init --retrofit --yes --lane full`. | **Harvest → note.** Expected for a pre-1.0 alpha (no migration guarantees yet), but a real consumer who ran an older alpha will hit this exact wall. Candidate post-0.4.0: a `coldpress upgrade` command (or doctor advisory) that detects a pre-lane scaffold and walks the re-init-preserving-`_input/` steps, rather than leaving the user to discover the collision + non-destructive-retrofit interaction by hand. Not a v0.4.0 blocker. |
| P0-2 | Setup | ○ | Re-init in place worked cleanly: fresh full-lane `coldpress.yaml` (`lane: full`), `.coldpress/state.yaml` seeded at `phase: 1 / entering / enforcement: on`, the trimmed **8-agent roster** (verifier not qa; scrum-master/communicator/valet correctly absent), `.claude/settings.json` hooks wired, pre-commit secret-scan hook installed, `coldpress-os/` re-vendored to 0.4.0-alpha, and `_input/` (chaturanga brainstorm + research corpus) + `secure/manifest.yaml` preserved. Existing git repo detected and preserved (no re-init). | Works. |
| P0-3 | Setup | ○ | Post-refresh `coldpress doctor --stack --wiring --structure` → **all checks passed** (Node/pm/git/CLI on PATH, stack_pack, wiring manifest 12 artifacts, package files 16 paths, 36 data readers, 80 skills routed, no internal-state leak). The install is a valid 0.4.0-alpha full-lane project before any phase runs. | Works; doctor is the pre-drive safety net. |

*(Appended as the run proceeds.)*

---

## Observation ledger (full-lane drive)

Severity: **✗ blocker** (framework can't complete the phase) · **⚠ friction**
(completes but a seam is rough / a real consumer would stumble) · **○ note**
(works; captured for context).

| # | Phase | Sev | Observation | Disposition |
|---|-------|-----|-------------|-------------|
| O1 | 1 Intake | **✗** | **`sacred-guard` blocks the first-ever creation of `context.md` — which intake is *designed* to do.** The hook (`src/hooks/sacred-guard.ts`) denies *any* write under `_context/sacred/*` unless an APPROVED `sacred-change` record already targets that path. It has **no create-vs-modify distinction**: the file not existing yet (or carrying `status: seed`) is not exempted. But intake step-07 (`step-07-intent-seed.md`) instructs Butler to `Write` `_context/sacred/context.md` from scratch — there is no authored doc to protect and no change-record can exist yet. So **every full-lane project's first intake is blocked** and forced through `COLDPRESS_OVERRIDE="sacred-guard:…"`. The consumer-Butler hit this and used the sanctioned override. | **Confirmed bug — valet-loop candidate.** The guard should pass a sacred write when (a) the target file does not yet exist (creation), or (b) its on-disk `status` is `seed`/unset — and only require an approved change-record once the doc is `authored`/locked. Add a golden test: fails-before (seed create denied) / passes-after (seed create allowed, authored modify still denied). Turning a *designed* first-write into a mandatory override trains consumers to reflexively override the one hook that matters most. |
| O2 | 1 Intake | **✗** | **Intake seed template omits 3 of 4 schema-required frontmatter fields → `context-schema-valid` fails on a straight-from-template doc.** `schemas/sacred-docs/context.schema.json` `required: [sacred, version, governance, workflowType]`. The step-07 seed template writes `name, description, status, phase_owned, seeded_by, seeded_at, version, supersedes` — it has `version` but is **missing `sacred`, `governance`, `workflowType`**. So a `context.md` created verbatim from the intake template fails the Phase-1 exit gate's schema check. The consumer-Butler had to hand-merge the three fields to pass. | **Confirmed bug — valet-loop candidate (O8-class template/schema drift).** Fix step-07 (and re-check step-11 `synthesize`, which promotes `seed→authored` + "schema-validates") to emit the schema-required frontmatter. Add a golden test that validates the intake-seed template's frontmatter against `context.schema.json` (fails-before/passes-after). This is the second template↔schema drift VP has found (cf. VP1 O8) — a systemic gap: **no test asserts that skill-emitted sacred-doc templates satisfy their own schemas.** Candidate meta-fix: a suite that round-trips every sacred-doc seed template through its validator. |
| O3 | 1→2 Route | ⚠ | **Butler's guidance layer offered to skip Phase 3 (Tech-Stack) entirely** — "jump straight to Phase 4 PRD off the existing brief." Discovery→Planning skips **stack-locking + the ★ walking skeleton** (the single best de-risking step, marked "never cut"). The **enforcement layer holds** — `phase-gate` (PreToolUse: Skill) would `deny` the Phase-4 `create-prd` skill because `p3` isn't green (`decidePhaseGate`: `state.phase(2) >= 4` false, `gates.p3` absent) — so a consumer who accepted the offer would hit a confusing wall: *Butler said yes, the hook says no.* **Guidance and enforcement disagree.** | **Confirmed (behavior) — fix the guidance layer.** The phase-transition routing prose / Butler SYSTEM directive should never present phase-skipping (least of all Tech-Stack) as a user option — the next full-lane step after Discovery is **Phase 3**, full stop. Candidate: encode the canonical phase order + "never volunteer a skip; the phase-gate hook is authoritative" into the transition skill. Related latent hole (not this run): `phase-gate` only fires on the `Skill` tool — hand-authoring a later-phase sacred doc via `Write` is caught by `sacred-guard`, but non-sacred phase artifacts authored by hand bypass phase sequencing. |
| O4 | 1 Profile | ⚠ | **Profile roster has no fit for a content-heavy, client-side *interactive* app.** The 6 harvested profiles (`brochure-site, browser-extension, cli-tool, editorial-site, research-spike, saas-app`) don't cover Ancient Games (interactive game engines + rotatable globe, Cloudflare, no backend/auth/DB, full lane, ~10–14wk). `editorial-site` is closest but seeds `lane: lite` + `stack_pack: static-multipage-blog` (this isn't a blog); `saas-app` gets full lane but assumes auth+DB+Vercel+T1. Butler correctly skipped presets and set axes directly ("custom"). | **Harvest → note (echoes VP1 O5).** Two candidate dispositions: (a) **harvest an `interactive-app` / `static-interactive` profile** from Ancient Games at Phase-11 `pack-harvest` (client-side app, real engine code, static-host, no backend, T0) — this is exactly what pack-harvest exists for; (b) make **"custom / no-profile" a first-class, documented path** in step-06a rather than an implicit skip. Not a v0.4.0 blocker. |
| O5 | 1 Intake | ⚠ | **Review-in-chat instead of review-in-file.** Butler generated the full `context.md` body *in the conversation* and asked the user to confirm the pasted text, then wrote the file. User feedback: prefer Butler **write the file first, then ask the user to read + confirm in place.** For a long sacred doc, in-chat review is noisy and diverges from what actually lands on disk. | **Harvest → skill prompt-pattern.** Adjust step-11 `synthesize` (and step-07) prompt-pattern: author to the file, then direct the user to review the on-disk doc and confirm/redline there. Cheaper, and the reviewed artifact is the committed artifact. Low-severity but a real ergonomics win; candidate eval as a prompt-pattern lint, not a deterministic gate. |
| O6 | 1 Profile | ○ | Consumer-Butler reported **"working directory drifted — using an absolute path"** while loading the profile roster (`data/profiles/`). Recovered immediately; no data impact. | **Note.** Likely a skill/CLI resolving `data/` off a drifted `cwd`. Watch for recurrence in later phases; if it repeats, candidate: skills should resolve framework paths from a fixed root, not `process.cwd()`. Logged for pattern-watch, not actionable alone. |
| O7 | 1 Intake | ○ | **The enforcement machinery is alive and firing.** Positive signal: `sacred-guard` fired on the sacred write, `schema-validate` caught the frontmatter gap at the gate, the Phase-1 exit gate evaluated (0 block failures), state advanced 1→2 with a handoff artifact logged. The hooks the whole overhaul exists to add are demonstrably running in a real consumer session. | Works — this is the thing v0.4 was built to prove. The friction above is *within* a working enforcement layer, not its absence. |

---

## Phase progress (full lane)

- [x] **1 · Bootstrap** — `intake` complete (greenfield; profile=custom; `context.md` authored + sacred-signed-off; working-mode summary/solo/claude-code; deploy=cloudflare, content_workstream flag; `_input/INDEX.md` = 57 cards). **P1 gate passed (0 block failures)**; handoff logged; state advanced 1→2. **6 findings harvested (O1–O7)** — two ✗ (sacred-guard first-create block; intake-template schema drift), three ⚠ (offered Phase-3 skip; profile gap; review-in-chat), one ○ pattern-watch (cwd drift). `next_skill: research`.
- [ ] **2 · Discovery** — personas · product-brief · proposal · research · validate-idea. Analyst-led. P2 gate.
- [ ] **3 · Tech-Stack** — stack-discovery-sync · stack-evaluation · **stack-locking** · deploy-select · env-provision · **walking-skeleton** (the ★ de-risking step). P3 gate (the O8-fixed `config-check --file coldpress.yaml`).
- [ ] **4 · Planning** — create-prd (sacred) · outcome-contract · validate-prd. P4 gate.
- [ ] **5 · Design** — design-brief · **design-tokens** · **styleguide** · brand-guidelines · budgets · ux-design · prototype. Feeds the styleguide-driven UI story. P5 gate.
- [ ] **6 · Architecture** — architecture-design (sacred) · data-model · api-contract · integration-inventory · threat-model · security-registry · analytics-plan. P5∥P6 overlap allowed. `trace orphans` at exit.
- [ ] **7 · Breakdown** — story-slice · story-graph → `coldpress waves` · implementation-readiness. P7 gate.
- [ ] **8 · Implementation** — dev-story / integration-story / quick-dev, then **verify-story** through the **@verifier clean-room** (VP2's required verifier path). At least one **styleguide-driven UI story**. Boundary/git guards live.
- [ ] **9 · Deployment** — readiness · deploy-staging · smoke · deploy-prod (or simulated) · handover. Staging never red.
- [ ] **10 · Operate** — ops-check · operate-loop. (Light for a validation run.)
- [ ] **11 · Evolve** — retrospective · **pack-harvest** · framework-feedback. Harvest ⚠/✗ → `evals/` + this log; update the §12 gate.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-07 | Butler (VP2 launch) | Initial VP2 log. Records the subject (Ancient Games IP product, full lane), the deliberate IP-product-subject divergence from VP1's throwaway convention (justified by plan §10), the consumer-session driver (most-faithful, real subagent dispatch), and Phase 0 (pre-overhaul→0.4.0 re-init in place: findings P0-1 no upgrade path / P0-2 clean re-init / P0-3 doctor green). Drive begins at Phase 1 intake. |
| 1.1 | 2026-07-07 | Butler (VP2 Phase-1 harvest) | Phase 1 intake complete; harvested 7 observations (O1–O7) verified against framework source. Two **✗** confirmed bugs bite every full-lane intake: **O1** `sacred-guard` blocks the designed first-creation of `context.md` (no create/seed exemption); **O2** intake seed template omits 3 of 4 schema-required frontmatter fields → `context-schema-valid` fails on a straight-from-template doc (O8-class drift; exposes a systemic gap — no test asserts skill-emitted sacred templates satisfy their schemas). Three **⚠**: **O3** Butler's guidance offered a Phase-3 (Tech-Stack) skip that the `phase-gate` hook *would* deny — guidance↔enforcement disagreement; **O4** profile roster gap for content-heavy client-side interactive apps (echoes VP1 O5); **O5** review-in-chat vs review-in-file ergonomics. One **○** pattern-watch (O6 cwd drift) and one positive **○** (O7 — enforcement machinery demonstrably firing in a real consumer session). O1 + O2 recommended for valet-loop fix before the drive continues (they recur). Phase-1 progress box checked. |
