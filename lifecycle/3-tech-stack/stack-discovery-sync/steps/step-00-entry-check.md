---
step_number: 0
step_name: "Entry Check"
step_goal: "Determine the correct entry path via 6-branch first-match-wins decision tree"
halts_for_input: false
next_step: "step-01-evidence-intake.md"
---

## Goal

Silently evaluate Phase 3 entry state and route to the correct path. First matching branch wins — evaluate in order.

## Decision Tree (first-match-wins)

### Branch 1 — Phase 2 incomplete (HaltError)

**Condition:** `.coldpress/local-config.yaml phase_2_completed != true` OR `_context/sacred/context.md` frontmatter `status != authored`

**Action:** HaltError — do not proceed.

> Phase 2 is not complete. Please finish Phase 2 Discovery before entering Phase 3. Phase 2 exit requires: `phase_2_completed: true` in `.coldpress/local-config.yaml` and `_context/sacred/context.md` with `status: authored`.
>
> Route: return to Phase 2 and run `product-brief` → `phase-transition` to close it out.

---

### Branch 2 — Partial-completion resume

**Condition:** `.coldpress/local-config.yaml partial_completion.phase == 3` AND `partial_completion.step_id` is set

**Action:** Resume at `partial_completion.step_id`. If `partial_completion.sub_state` is present, pass it to the resuming step:
- `sub_state.decision_area` → resume stack-evaluation at that decision area
- `sub_state.category_index` → resume baselines confirmation at that category index

> Resuming Phase 3 from where we left off (step: `{step_id}`). Let's continue.

---

### Branch 3 — Post-Phase-3 update hook re-entry

**Condition:** `.coldpress/local-config.yaml post_phase_3_update_ran == true` AND `phase_3_completed != true`

**Action:** Skip to Step 7 (env-provision). The user has run `coldpress update --post-phase-3`; stack is locked; provision is the remaining step.

> Detected that `coldpress update --post-phase-3` was run. Stack lock is complete — proceeding to `env-provision`.

---

### Branch 4 — Phase 3 already complete (re-entry menu)

**Condition:** `.coldpress/local-config.yaml phase_3_completed == true`

**Action:** Dispatch `re-entry` router (`lifecycle/3-tech-stack/re-entry/`). Do not re-run the full Phase 3 flow.

---

### Branch 5 — Graph staleness check

**Condition:** Graph staleness check (via `src/graph/staleness.ts`) detects new `_input/` content since Phase 2 exit (delta > 0 files unindexed)

**Action:** Prompt user:

> I see {N} new file(s) in `_input/` since Phase 2 exit ({delta files listed}). Rebuild the knowledge graph before we start? This takes ~30 seconds and ensures stack-discovery uses up-to-date vendor docs.
>
> [Y] Rebuild now → run `coldpress graph rebuild`, then proceed to Step 1
> [N] Skip → proceed to Step 1 with stale graph; log decision to `_context/tracking/phase-3-entry-{date}.md`

Halt for user input; proceed per response.

---

### Branch 6 — First entry (default)

**Condition:** None of the above matched.

**Pre-entry self-healing:** Before proceeding, check if `_context/planning/stack-shortlist-v*.md` exists. If it does, attempt to parse the YAML frontmatter. If parse fails (corrupted by an interrupted write):
1. Delete the partial file.
2. Append note to `_context/tracking/phase-3-entry-{date}.md`: "Found corrupted shortlist (parse failed) — deleted partial file and re-running discovery-sync."
3. Proceed as first-entry (no user action required).

**Edge case — missing handoff log:** If `_context/handoffs/phase-2-to-3-*.md` does not exist despite `phase_2_completed == true`, generate a synthetic handoff summary from available Phase 2 artefacts (`product-brief`, `idea-validation`, `context.md`) and log degradation: "No phase-2-to-3 handoff log found — generated synthetic summary from available Phase 2 artefacts."

**Action:** Proceed to [step-01-evidence-intake.md](step-01-evidence-intake.md).

---

## Output

Entry path determined. Proceed to the appropriate next step.

## Navigation

→ Branch 1: HaltError (no next step)
→ Branch 2: Resume at `partial_completion.step_id`
→ Branch 3: Dispatch env-provision
→ Branch 4: Dispatch re-entry router
→ Branch 5: Halt for graph-rebuild confirm, then → [step-01-evidence-intake.md](step-01-evidence-intake.md)
→ Branch 6: [step-01-evidence-intake.md](step-01-evidence-intake.md)
