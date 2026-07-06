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

*(Appended as the run proceeds.)*

---

## Phase progress

- [ ] **Spec** — ingest brief → stack + deploy lock → walking skeleton → `spec.md`; P-gate green.
- [ ] **Build** — red stubs → green, story by story; boundary/git guards live.
- [ ] **Verify** — independent verifier vs spec + tokens → verdict record.
- [ ] **Ship** — staging smoke → (simulated) prod → release record.
- [ ] **Harvest** — ⚠/✗ observations → `evals/` cases + walkthrough; ledger + §12 gate updated.
