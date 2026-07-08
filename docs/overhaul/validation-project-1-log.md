# Validation Project 1 — Log ("Brew & Bloom")

> The §12 ship gate requires a real end-to-end run of the shipped framework
> against a realistic build. This is that run's log. Its purpose is **not** to
> ship a website — it is to exercise the wired seams (gates, hooks, skills, the
> lite lane) against a fresh consumer scaffold and **harvest the first failures
> as eval cases**. Every ⚠/✗ observation below is a candidate for `evals/`.

- **Subject:** Brew & Bloom — specialty-coffee roaster micro-site (marketing +
  a wholesale enquiry form). Chosen as a realistic small-business brief that is
  *not* a store (no cart/payments/accounts), so the lite lane fits honestly.
- **Location:** `validation/brew-bloom/` at the hq-p001 Project root — **outside**
  the public framework repo (keeps `coldpress-os/` clean) and isolated from the
  real `lab-clients/` work.
- **Lane:** lite (Spec → Build → Verify → Ship).
- **CLI under test:** local build `0.4.0-alpha`, `npm link`ed so the scaffold's
  hooks resolve `coldpress` on PATH exactly as a published consumer would.
- **Driver:** Butler (framework session) hand-executing the consumer lite
  lifecycle — reading each `lifecycle/lite/*` skill and running the real CLI
  gates in the project dir. (Framework-Butler cannot literally dispatch a
  scaffolded project's subagents; it follows the skill workflows as the
  consumer orchestrator would.)

---

## Observation ledger

Severity: **✗ blocker** (framework can't complete the lane) · **⚠ friction**
(completes but a seam is rough / a real consumer would stumble) · **○ note**
(works; captured for context).

| # | Phase | Sev | Observation | Disposition |
|---|-------|-----|-------------|-------------|
| O1 | Setup | ○ | `coldpress init … --lane lite` scaffolds cleanly; plugin bundled, hooks wired via `scripts/hooks/run.mjs → coldpress hook`. | Works. |
| O2 | Setup | ⚠ | Lite scaffold gets the **full-lane** `_context/` subdir set (`design/ planning/ sacred/ …`). Lite uses `spec.md`, not the 5-doc sacred set, so several dirs are inert for a lite project. | Known S6b deferral (lane-aware `_context`). Confirms the deferral is real & user-visible; not a v0.4.0 blocker. Candidate structure-check refinement post-0.4.0. |
| O3 | Setup | ○ | With the CLI `npm link`ed, `coldpress doctor` in the project passes all checks incl. "coldpress CLI on PATH (enforcement hooks depend on it)". Without the link a consumer must `npm i -g @coldpress/core` first — doctor catches it. | Works; doctor is the safety net. |
| O4 | Spec | ⚠ | The **lite lane ships no `gate.json`** for any phase (`gate/run.ts`: "the lite lane drops phase sequencing, so most lite phases ship no gate.json"). `coldpress gate check lite:spec` → "no gate.json found". So the ★ non-negotiables (ingest ledger, stack lock, walking-skeleton-on-staging, tokens/styleguide) are **honor-system in lite** — enforced only by the always-on write-time hooks + Butler following the skill's Completion ★ list, with no machine phase-exit check. | **Harvest → eval.** A lite project can skip the walking skeleton (the single best de-risking step, marked ★ "never cut") with zero machine pushback. Candidate: a lightweight `coldpress gate check lite:spec` that asserts the ★ list (spec.md exists, stack+deploy locked in coldpress.yaml, staging URL recorded, tokens present if UI). Not a v0.4.0 blocker but a real enforcement hole. |
| O5 | Spec | ⚠ | The `brochure-site` **profile** defaults `stack_pack: static-single-page`, but a realistic brochure brief (Brew & Bloom: 4 pages + a markdown-editable coffee lineup + a wholesale form) actually needs `static-multipage-blog` (Astro + **MDX** content collection + multi-page). The profile's default is more minimal than its own name implies. | **Harvest → eval.** A consumer trusting the profile default would lock the wrong pack (single-page, no CMS) for a multi-page content site, then discover mid-Build that content isn't editable. Candidate: profile default → `static-multipage-blog`, or the lock step must ask "one page or several?" + "does non-technical staff edit content?". |
| O6 | Spec | ⚠ | **Seam disagreement:** `static-multipage-blog/pack.yaml` `pre_picked.hosting: Vercel`, but the `brochure-site` profile default is `deploy_pack: cloudflare`. Nothing reconciles stack-pack hosting vs profile deploy_pack — a consumer mixing profile + pack gets inconsistent hosting silently. | **Harvest → eval.** The lock step (or `config-check`) should reconcile `pre_picked.hosting` against `deploy_pack` and warn on mismatch. Locked `deploy_pack: vercel` here to match the pack's hosting. |

| **O8** | Spec | **✗** | **Full-lane Phase-3 exit gate can never pass.** `lifecycle/3-tech-stack/gate.json` check `stack-pack-written-to-yaml` (severity **block**) has `path_pattern: coldpress.yaml` and `description: "coldpress.yaml stack_pack field is set"`, but its `command` is `coldpress config-check stack_pack` — and `config-check` (`src/gate/checks/config-check.ts`) reads **`.coldpress/local-config.yaml`**, where `stack_pack` is never written (it's not in the `LocalConfig` interface; the stack-locking skill Step 4 + `coldpress-yaml-schema.md` put it in `coldpress.yaml`). So the check returns "Key not found" **even when the stack is correctly locked** (empirically: brew-bloom has `stack_pack: static-multipage-blog` in coldpress.yaml → `config-check stack_pack` → "not found in local-config.yaml"). `--allow-empty-string` does not rescue it (that branch needs `actual === ""`, but `actual` is `undefined`). | **Confirmed bug — the headline VP1 finding.** Masked by `test/gate-check-config.test.ts:41`, which writes `stack_pack` *into local-config.yaml* — a fixture that never occurs in reality — so the unit suite is green while the real seam is broken. Bites the **full lane** only (lite has no P3 gate — O4); found here by code-trace while doing the lite stack lock. **Fix (valet-loop) — ✓ FIXED in D58** (`overhaul/vp1-o8-config-check-file`): gave `config-check` an optional `--file` (default local-config.yaml, back-compat; `--file coldpress.yaml` reads the project config top-level key), threaded it through the wrapper + CLI, repointed the one gate command to `--file coldpress.yaml`, and added a fails-before/passes-after golden test on the REAL layout (+5 cases). Verified e2e against the live brew-bloom coldpress.yaml. Green bar: 940 tests. |

| O9 | Spec | ○ | **Write-time schema enforcement works live against real artifacts.** `coldpress hook schema-validate` on the real `_context/design/tokens.json` → passes clean; on a malformed tokens.json → `{"decision":"block", reason: "…typography.sizes…color…spacing…"}` with field-level errors. The WS10-A2 design registry + DV1 write-time coverage fire correctly on a genuine consumer project (not just unit fixtures). | **Positive — seam confirmed.** This is the enforcement the overhaul built, working end-to-end on VP1. |
| O10 | Spec | ⚠ | The lite lane's single sacred doc **`spec.md` has no registered schema** — `schema-validate` returns "no opinion" for it (only full-lane `context/tech-stack/prd/architecture` are schema'd). So the one document the entire lite lane hangs on is not machine-validated at write time. With O4 (no lite phase gate), lite's `spec.md` is **fully honor-system** — no structural check that requirements have acceptance criteria + priority, that the stack is recorded, etc. | **Harvest → eval.** Consistent with O4: the lite lane trades away most machine enforcement. Candidate: a minimal `spec.md` frontmatter/section schema (requirements have acceptance + priority; stack block present) so the lite lane keeps *some* structural floor. |

| O11 | Spec | ⚠ | The **walking-skeleton skill** (`lifecycle/3-tech-stack/walking-skeleton`, described as "NEVER cut — both lanes") lists its input as `_context/sacred/tech-stack.md (the locked stack + BUILD_CMD/BUILD_DIR)` and sets `gates.p3.*` state keys — both **full-lane-only surfaces**. In the lite lane there is no `tech-stack.md` (the stack lives in `coldpress.yaml` + `spec.md`) and no `p3` gate (O4). The ★ step works, but its skill contract isn't lite-aware — a consumer following it literally in lite looks for a doc that doesn't exist. | **Harvest → eval.** Same lite/full seam family as O2/O10. Candidate: lite-aware input note ("lite: read the stack from `coldpress.yaml`/`spec.md`") + record skeleton status under a lite-appropriate state key. |
| O12 | Spec | ○+ | **The ★ license scan earned its keep.** Scanning the locked dep set surfaced `@img/sharp-libvips-darwin-arm64` = **LGPL-3.0-or-later** (Astro's image pipeline bundles libvips) — a real copyleft dep flagged **at lock time**, exactly as the skill promises ("a GPL/AGPL surprise surfaces at lock time, not ship time"). Dispositioned **acceptable** for a T0 website (build-time, dynamically-used native lib; not redistributed; optimized-image output isn't a derivative work) and recorded in `decisions.md` D-5 + `state.yaml license_scan_clean: lgpl-noted`. | **Positive — the de-risking step actually caught something.** Note: this is distinct from the framework's own MIT-vendoring blocklist (that governs what coldpress-os bundles); here it's a consumer's build dependency, correctly surfaced for a conscious call rather than a silent one. |

*(Appended as the run proceeds.)*

---

## Phase progress

- [x] **Spec** — COMPLETE. Ingest ledger ✓; stack+deploy locked (`coldpress.yaml`) ✓; **walking skeleton returns 200 on staging** (real Astro build → `dist/` → local server) ✓; license scan run (LGPL noted, O12) ✓; `tokens.json` + `styleguide.md` ✓ (schema-validated live, O9); `spec.md` (8 numbered requirements, each with acceptance + priority) + `decisions.md` ✓. Human gate: **proceed**. All ★ non-negotiables met. Findings O2/O4/O5/O6/O7/O10/O11 logged; O8 fixed (D58); O9/O12 positive.
- [ ] **Build** — red stubs → green, story by story; boundary/git guards live.
- [ ] **Verify** — independent verifier vs spec + tokens → verdict record.
- [ ] **Ship** — staging smoke → (simulated) prod → release record.
- [ ] **Harvest** — ⚠/✗ observations → `evals/` cases + walkthrough; ledger + §12 gate updated.
