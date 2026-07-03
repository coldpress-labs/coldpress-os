---
name: pack-harvest
description: "Phase 11 — graduate what WORKED into the relevant stack/deploy/verify pack (or propose a new profile when a project shape ships for the first time): components, snippets, config, skills, golden eval tasks. Design principle 7 — solutions compound, not just failures. Packs are built by harvest from real projects, never speculatively."
license: MIT
compatibility: Invoked by @reviewer in Phase 11
allowed-tools: "Read Write Bash Grep Glob"
---

## Purpose

Make solutions **compound**. The WS7 loop already turns failures into fixes; this
is the other half — turning what *worked* into reusable pack assets, so the next
project of the same shape starts further ahead. Packs are **harvested from the
next real project of each shape** (§4.9), never speculated.

## When to Use

- Phase 11, after a project ships successfully — especially the **first** project of
  a new shape (voice-agent, content-pipeline, nextjs-saas…) → propose a new profile/pack.

## Process

1. **Identify what worked** — from the retrospective + the shipped repo: components,
   snippets, config, a skill or step that proved reusable, and the **golden eval
   tasks** the project accumulated (3–5 pack-specific).
2. **Attribute to a pack** — which stack/deploy/verify pack (or profile) each asset
   belongs to. A shape shipping for the first time → **propose a new profile/pack**
   (with the harvested defaults: skeleton, pinned versions, testing.yaml, budgets,
   token seed, deploy-compat, eval tasks — the §5 P3 stack-pack contract).
3. **Generalize** — strip the project-specific bits; keep the reusable core.
4. **Emit the harvest** — `pack-harvest-v{N}.md` + PRs against the pack (or a new
   pack skeleton), so the graduation is reviewable, not a copy-paste.

## Output

`pack-harvest-v{N}.md` + graduated assets (PRs against the relevant pack, or a new
profile proposal). The next project of that shape inherits them.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS8) | NEW (§5 P11, design principle 7). Graduates what worked (components/snippets/config/skills/golden eval tasks) into the relevant pack, or proposes a new profile/pack when a shape ships first — harvested from real projects, never speculative. The compounding-solutions counterpart to `framework-feedback` (fixes) + `product-evolution` (product). |
