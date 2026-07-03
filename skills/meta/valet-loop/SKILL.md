---
name: "valet-loop"
description: "The coldpress-os self-improvement loop (framework-repo only, run by Valet): read the EventStream run-log + eval failures + overrides → pick ONE tagged failure → patch the skill/hook that caused it → run the affected golden evals → commit referencing the failure id. Turns a failure into a permanent fix + a regression test."
type: "workflow"
category: "meta"
agent: "butler"
tools: ["Read", "Edit", "Write", "Bash", "Grep", "Glob"]
inputs:
  - "`.coldpress/runs/*/events.jsonl` (EventStream) + `coldpress evolve` report"
  - "a failing `coldpress evals` run (per-task tags) and/or override records"
outputs:
  - artifact: "A commit: skill/hook patch + a golden eval, referencing the failure id"
    location: "the coldpress-os repo"
    format: "git-commit"
---

## Purpose

Make the framework learn from its own runs. Every failure the estate's projects
hit is a signal; this loop converts one such signal into a **permanent** fix — a
patched skill or hook **plus** a golden eval that fails before the fix and passes
after. Failures compound into robustness instead of recurring. Run in the
**coldpress-os framework repo** (this is Valet's loop — framework-internal, not a
consumer-project skill).

## When to Use

- After `coldpress evolve` surfaces a recurring failure class (its top-3 patches).
- After a `coldpress evals` run goes red.
- When an override leaderboard shows a gate being bypassed often (a mis-designed gate).

## The loop (one failure per pass)

1. **Pick one failure** — from `coldpress evolve`'s failure leaderboard / top-3, or a
   red `coldpress evals` task. Take its **taxonomy tag** (the failure id) — one per
   pass, highest-signal first. Don't batch.
2. **Locate the cause** — trace the tag to the skill or hook responsible (e.g.
   `over-scoped-diff` → boundary-guard / the packet globs; `design-token-violation`
   → visual-verify / the styleguide check; `skipped-gate` → the phase/deploy gate;
   `schema-violation` → the emitting skill + its schema).
3. **Write the failing eval FIRST** — add/adjust a golden task under `evals/` whose
   `guards_against` includes this tag, and confirm it is **red** (`coldpress evals
   --filter <task>`). A fix without a regression test doesn't count.
4. **Patch** the skill/hook so the eval goes green — the minimal change that closes
   the failure mode (not a rewrite).
5. **Verify** — `coldpress evals --filter <task>` green; `npm test` + `check:drift`
   green; the fix didn't regress a sibling eval.
6. **Commit referencing the failure id** — the commit message names the taxonomy
   tag (and the `evolve`/eval evidence), so the fix is traceable back to the signal:
   `fix(<area>): close <tag> — <what> (+ golden eval)`.

## Guardrails

- **One failure per pass** — small, verifiable, traceable.
- **Eval before fix** — the regression test is the deliverable as much as the patch.
- **Sacred docs + the roster are Butler/Valet scope** — patch skills/hooks/schemas, not
  the estate agent hierarchy.

## Output

A single commit in the coldpress-os repo: a skill/hook patch + a golden eval that
pins the fix, referencing the failure id. Feeds the next `coldpress evolve` (the
class's count should drop).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS7-E) | NEW (§4.8). The framework-repo self-improvement loop: EventStream/evals/override signal → one tagged failure → eval-first → patch skill/hook → verify → commit referencing the failure id. Consumes WS7-A–D (taxonomy, evals runner, EventStream enrichment, evolve). |
