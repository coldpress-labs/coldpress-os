---
step_number: "5a"
step_name: "Baselines Confirmation"
step_goal: "Present each baseline category to the user for confirmation or opt-out; log decisions; prepare baselines block for yaml write-back"
halts_for_input: true
next_step: "step-04-lock.md"
---

## Goal

Before the sacred lock, get explicit per-category baseline confirmation. This is mandatory — every Phase 3 run produces a baselines-confirmations audit row for every category. Confirmed baselines will be activated by env-provision Step 3.

## Instructions

### 1. Read baselines catalog

Open `data/standards/baselines.yaml`. Load all 4 v0.3 categories: `seo_aeo_llm`, `accessibility`, `security`, `future_proof`.

### 2. Check pack coverage

If a pack was confirmed in stack-discovery-sync Step 2b, read `pack.baselines_out_of_box` for this pack. Map to categories: `covered_by_pack: true`. Partial coverage (pack provides foundation but not all actions) = `covered_by_pack: partial`.

### 3. For each category, surface and confirm

Present each category in sequence. Sub-state tracking: write `sub_state.category_index: N` to `.coldpress/local-config.yaml partial_completion` on entry to each category; clear on completion. This allows resume mid-loop if interrupted.

For each category, present:

> **Baseline: {label}**
> {description (first 2 sentences)}
>
> ✓ Pack covers: {list of covered checks OR "none"}
> 🔧 env-provision will activate: {list env_provision_actions OR "already covered by pack"}
> 📋 Phase 7 gate: {phase_9_deploy_gate rule}
>
> Options:
> 1. **Confirm** — activate this baseline (env-provision will apply the actions above)
> 2. **Opt-out** — skip this baseline (requires rationale; Phase 7 gate will not fire for this category)
> 3. **Confirm with override** — activate but override specific values (I'll ask for overrides)

Wait for user input per category.

**On Confirm:** Record `status: confirmed`.

**On Opt-out:** Prompt: "Please provide a brief rationale for opting out of {category}:" — wait for input. Record `status: opted-out`, `opted_out_at: {timestamp}`, `rationale: {user input}`.

**On Confirm with override:** Ask for override values (e.g., custom LCP threshold, custom ES target). Record `status: confirmed-with-override`, `overrides: {key: value}`.

### 4. Build baselines block

After all 4 categories confirmed:

```yaml
baselines:
  seo_aeo_llm:
    status: "{confirmed|opted-out|confirmed-with-override}"
    covered_by_pack: {true|false|partial}
    opted_out_at: {timestamp or null}
    rationale: {string or null}
    overrides: {}
  accessibility: ...
  security: ...
  future_proof: ...
```

### 5. Log to audit file

Append one row per category to `_context/audit/baselines-confirmations-{date}.md` (format per `docs/baselines-confirmations-log-spec.md`):

```markdown
| Date | Approver | Baseline category | Status | Covered by pack | Overrides | Rationale |
| {date} | user | seo_aeo_llm | confirmed | true | — | — |
```

### 6. Update tech-stack.md Baselines section

Populate the Baselines placeholder section in `_context/sacred/tech-stack.md` with the confirmed/opted-out summary. (Document remains draft — sacred lock happens in Step 4.)

## Output

All 4 categories confirmed/opted-out; baselines block prepared; audit log written. `step_5a_complete: true`

## Navigation

→ Proceed to [step-04-lock.md](step-04-lock.md)
