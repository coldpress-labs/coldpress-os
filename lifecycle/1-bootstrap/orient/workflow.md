---
workflow_version: "1.0"
output_file: "_context/tracking/orient-{date}.md"
total_steps: 4
resume_from: "frontmatter"
---

## Overview

Butler's first-session check-in: detect mode (fresh / re-entry / resume), greet the user, validate the scaffold is healthy, introduce the 9-phase lifecycle, and hand off to `intake`. Cheap — no long-running tasks here.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-mode-detect.md](steps/step-01-mode-detect.md) | Read `.coldpress/local-config.yaml`; branch on fresh / re-entry / resume; handle `needs_graph_rebuild` retry prompt. |
| 2 | [step-02-greeting.md](steps/step-02-greeting.md) | First-session greeting using `{butler.display_name}`. Skipped on re-entry and resume. |
| 3 | [step-03-sanity-check.md](steps/step-03-sanity-check.md) | Scaffold health report — `coldpress doctor` (silent), yaml validator, template probes. |
| 4 | [step-04-lifecycle-intro.md](steps/step-04-lifecycle-intro.md) | 9-phase preview; skippable via `orient_skipped: true` if the user already knows the flow. |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Respect the mode.** `re-entry` skips greeting + intro. `resume` skips everything and hands off to `intake` at the recorded `step_id`.
3. **Halt at menus.** When a step offers choices (retry graph rebuild, skip lifecycle intro), wait for user input.
4. **No scaffold mutations.** Orient only *reads* files and prints. Writes happen in `intake`.
5. **Output is additive.** The scaffold health report is a single file at `_context/tracking/orient-{date}.md` — one per session, overwritten if re-run on the same day.
6. **Hand off cleanly.** On success, log `next_skill: intake` in the report frontmatter and return control to Butler.

## Completion Criteria

- Mode detected and recorded in the orient report.
- Scaffold sanity results logged (pass / warn / fail per check).
- `needs_graph_rebuild` retry either succeeded (flag cleared) or was deferred (flag preserved).
- User has acknowledged the lifecycle intro (first session) or skipped it explicitly (`orient_skipped: true`).
- Butler is positioned to invoke `intake` as the next skill.
