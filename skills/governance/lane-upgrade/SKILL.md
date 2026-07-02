---
name: "lane-upgrade"
description: "Promote a lite-lane project to the full 11-phase lane without data loss. Runs `coldpress lane-upgrade` (flips the lane + back-fills the full-lane sacred-doc skeletons), then guides splitting spec.md's content into them."
type: "simple"
category: "governance"
agent: "butler"
tools: ["Read", "Write", "Bash"]
inputs:
  - "_context/sacred/spec.md + decisions.md (the lite artifacts)"
outputs:
  - artifact: "full-lane sacred docs"
    location: "_context/sacred/{context,tech-stack,prd,architecture}.md"
    format: "markdown (sacred)"
version: "1.0"
---

## Purpose

When a project outgrows the lite lane (external users, payments, novel architecture,
a multi-week build), promote it to the full lane **without losing anything**. Lite
kept everything in `spec.md` (+ `decisions.md`); the full lane wants the separate
sacred docs. This skill performs that split.

## When to upgrade

Use the routing table in `CLAUDE.md`: any **two** of {external users · payment · novel
architecture · estimate > 2 weeks} → recommend full. Upgrading is cheap and reversible
in spirit — the lite artifacts are preserved.

## Process

1. **Run the mechanical step:**

   ```bash
   coldpress lane-upgrade
   ```

   It flips `lane: lite → full` in `coldpress.yaml` + `.coldpress/state.yaml`
   (mapping the lite phase to its full-lane equivalent), and creates back-filled
   skeletons for `context.md`, `tech-stack.md`, `prd.md`, `architecture.md`.
   **`spec.md` and `decisions.md` are preserved** — nothing is deleted.

2. **Split the content (no data loss):** move each part of `spec.md` into its home:
   - context / problem / audience → `context.md`
   - locked stack + deploy → `tech-stack.md`
   - numbered requirements + acceptance criteria → `prd.md`
   - system design (was light in lite) → `architecture.md` (expand as needed)
   - open questions in `decisions.md` → formal delta records where they belong

3. **Lock each new sacred doc** through the normal `sacred-change` workflow (each is
   now protected by the `sacred-guard` hook).

4. **Resume on the full lane** from the mapped phase (spec→P4, build→P7, verify→P8,
   ship→P9). The full-lane phase gates now apply.

## Guarantee

`spec.md` remains the source of record until every section has been migrated —
verify no requirement, decision, or stack fact was dropped before archiving it.
