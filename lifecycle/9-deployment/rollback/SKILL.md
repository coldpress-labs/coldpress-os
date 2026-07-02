---
name: "rollback"
description: "Phase 9/10 — roll production back to the previous good deployment via the deploy pack's rollback_cmd (when capabilities.rollback). Rehearsed once per project on staging so it's known-good before it's needed. Human-decided (disable-model-invocation). Triggered by a red prod smoke or an incident."
type: "simple"
category: "lifecycle"
phase: 9
agent: "devops"
disable-model-invocation: true
tools: ["Read", "Bash"]
inputs:
  - "the selected deploy pack (capabilities.rollback + rollback_cmd)"
  - "the release record pointing at the prior good deployment"
outputs:
  - artifact: "Rollback result + REL/DLT record"
    location: "_context/operations/releases/"
    format: "markdown"
---

## Purpose

Recover fast and predictably. Reverting production is consequential, so it is
**human-decided** (`disable-model-invocation`) and **rehearsed once per project on
staging** — a rollback path first exercised during an incident is a rollback path
you don't trust.

## When to Use

- A **red prod smoke** after `deploy-prod`.
- An incident (`incident-response`) where the fix is "get back to the last good state."
- Once per project on **staging**, as a rehearsal (the release record notes the rehearsal).

## Process

1. **Check capability** — the pack must declare `capabilities.rollback` + `rollback_cmd`.
2. **Resolve the target** — the prior good deployment from the latest release record's
   `rollback pointer`.
3. **Roll back** — run the pack's `rollback_cmd` (e.g. `vercel rollback <url>`, promote
   a prior Cloudflare Pages deployment).
4. **Verify** — run `smoke` against production to confirm the rollback is healthy.
5. **Record** — write a REL/DLT record (what failed, what we rolled back to, follow-up).

## Output

Production restored to the last good state + a record. The forward fix re-enters the
normal loop (a story/DLT), never a hot-patch on prod.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-B) | NEW (§5 P9). Pack `rollback_cmd`-driven recovery; human-decided (`disable-model-invocation`); rehearse-once-on-staging convention; verified by prod smoke; records to REL/DLT. |
