---
name: "framework-feedback"
description: "Phase 11 — route framework (not product) learnings back to coldpress-os: a failure-taxonomy summary from the run's tagged failures + overrides, and proposed skill/hook/schema patches, emitted as issues against the coldpress-os repo. This is the intake for the WS7 valet-loop — the estate's projects teach the framework."
type: "workflow"
category: "lifecycle"
phase: 11
agent: "reviewer"
tools: ["Read", "Write", "Bash"]
inputs:
  - "the retrospective (failure-lineage + taxonomy tags) + the run's EventStream"
  - "override records (COLDPRESS_OVERRIDE usage) from the run-log"
outputs:
  - artifact: "Framework-feedback issues"
    location: "_context/audit/framework-feedback-v{N}.md (→ issues on github.com/coldpress-labs/coldpress-os)"
    format: "markdown"
---

## Purpose

Separate **product** feedback from **framework** feedback, and send the latter home.
When a project hits a framework failure — a skill that mis-targets, a gate that's
too loose or too noisy (frequent overrides), a schema that lets a bad artifact
through — that's a signal the *framework* should improve, not just this project.
This skill packages those signals as actionable issues against coldpress-os, where
the **valet-loop** (WS7) turns them into a golden eval + a fix.

## When to Use

- Phase 11, after `retrospective` — for the framework-attributable findings (the
  product-attributable ones go to `product-evolution`).

## Process

1. **Taxonomy summary** — from the run's failure-taxonomy tags (retrospective +
   EventStream): which classes recurred, with the event-ID evidence.
2. **Override review** — every `COLDPRESS_OVERRIDE` used this run: a gate overridden
   often is a **mis-designed gate** (too strict, wrong signal) → propose a redesign,
   not just more overrides.
3. **Propose patches** — per finding, the concrete framework change: which
   skill/hook/schema, what change, and the **golden eval** that should pin it
   (so the valet-loop can act directly).
4. **Emit issues** — write `framework-feedback-v{N}.md` and open the corresponding
   issues against `github.com/coldpress-labs/coldpress-os` (title = the taxonomy
   class + area; body = evidence + proposed patch + eval).

## Output

`framework-feedback-v{N}.md` + issues on the coldpress-os repo — the WS7 loop's
intake. A recurring class should show up in `coldpress evolve`'s top-3 and get
closed by the valet-loop.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS8) | NEW (§5 P11). Routes framework-attributable learnings to coldpress-os: taxonomy summary + override review + proposed skill/hook/schema patches (each with a pinning golden eval), emitted as issues — the intake for the WS7 valet-loop. Complements `product-evolution` (product backlog) + `pack-harvest` (reusable wins). |
