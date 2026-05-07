---
step_number: 1
step_name: "Mode detect"
step_goal: "Classify this session as first-session / re-entry / resume; handle graph-rebuild retry prompt"
halts_for_input: true
next_step: "step-02-greeting.md"
---

## Goal

Decide *which shape* this orient run takes so Butler doesn't greet a returning user as if they've never been here, or restart an in-progress intake from scratch.

## Instructions

### 1. Read `.coldpress/local-config.yaml`

Use the helper `src/utils/local-config.ts readLocalConfig(projectRoot)`. Treat a missing file as an empty config `{}` — that's the first-session signal.

### 2. Classify the mode

Apply these rules in order — first match wins:

| Condition | Mode |
|-----------|------|
| `partial_completion` is set (non-null, has `step_id`) | **resume** — jump directly to `intake` Step N matching `step_id`, skipping greeting + intro |
| `phase_1_completed: true` | **re-entry** — Butler is being invoked mid-project; skip greeting but offer a quick "is everything still OK?" sanity check |
| empty config OR `phase_1_completed: false` (and no partial marker) | **first-session** — full orient flow: greeting → sanity → lifecycle intro → intake |

### 3. Handle `needs_graph_rebuild` if set

If the config has `needs_graph_rebuild: true`, prompt the user:

> Last time I couldn't build the project index (reason: `{graph_rebuild_error}`). Want me to retry now? (y/N)

**On "yes":** invoke `coldpress graph rebuild`.
- On success: clear `needs_graph_rebuild` and `graph_rebuild_error` from the config. Continue.
- On failure: keep both fields, update `graph_rebuild_error` with the new reason, continue (don't block).

**On "no":** leave both fields set. Mention that intake's graph-prime step will retry later if the user wants.

### 4. Record the decision

Append to the orient report frontmatter:

```yaml
mode: first-session | re-entry | resume
mode_detected_at: "<ISO-8601>"
graph_rebuild_retried: true | false
graph_rebuild_cleared: true | false
```

## Halts for Input

Only when `needs_graph_rebuild: true`. Otherwise the step runs straight through.

## Navigation

- **First-session** → `step-02-greeting.md`
- **Re-entry** → `step-03-sanity-check.md` (skip greeting)
- **Resume** → jump to `intake` at `partial_completion.step_id` (skip the rest of orient entirely)
