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
| — | — | — | *(none yet — drive begins at Phase 1 intake via the consumer session)* | — |

---

## Phase progress (full lane)

- [ ] **1 · Bootstrap** — `intake` (13 steps): sanity check → material solicitation from `_input/` → shape (greenfield) → profile → context.md authored (sacred) → working mode → P1 gate. `next_skill: research`.
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
