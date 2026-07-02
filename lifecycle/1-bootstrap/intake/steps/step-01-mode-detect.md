---
step_number: 1
step_name: "Mode detect"
step_goal: "Classify this session as first-session / re-entry / resume"
halts_for_input: false
next_step: "step-02-greeting.md"
---

## Goal

Decide *which shape* this session takes so Butler doesn't greet a returning user as if they've never been here, or restart an in-progress intake from scratch.

## Instructions

### 1. Read `.coldpress/local-config.yaml`

Use the helper `src/utils/local-config.ts readLocalConfig(projectRoot)`. Treat a missing file as an empty config `{}` — that's the first-session signal.

### 2. Classify the mode

Apply these rules in order — first match wins:

| Condition | Mode |
|-----------|------|
| `partial_completion` is set (non-null, has `step_id`) | **resume** — jump directly to the recorded `step_id`, skipping greeting + intro |
| `phase_1_completed: true` | **re-entry** — Butler is being invoked mid-project; skip greeting but offer a quick "is everything still OK?" sanity check |
| empty config OR `phase_1_completed: false` (and no partial marker) | **first-session** — full flow: greeting → sanity → lifecycle intro → material solicitation onward |

### 3. Record the decision

Append to the intake report frontmatter:

```yaml
mode: first-session | re-entry | resume
mode_detected_at: "<ISO-8601>"
```

## Halts for Input

No. This step reads and classifies, then moves straight on.

## Navigation

- **First-session** → `step-02-greeting.md`
- **Re-entry** → `step-03-sanity-check.md` (skip greeting)
- **Resume** → jump directly to the step named in `partial_completion.step_id`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `orient` Step 1. |
| 2.0 | 2026-07-02 | Butler | Folded into `intake` as its new Step 1 (WS5-B, §8 item 6 — `orient` absorbed). Dropped the `needs_graph_rebuild` retry prompt: `coldpress graph rebuild` was removed in WS0 (§8 item 1); no replacement priming step exists at intake time. |
