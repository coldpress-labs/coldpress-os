---
name: prompt-governance
description: Portfolio-level review of prompts across coldpress-os skills + agents + snippets. Surfaces inconsistencies (same role-priming written differently in 5 places), reuse opportunities (5 step files repeating a pattern that should become a snippet), anti-patterns (vague phrasing / missing output contracts), and licensing concerns for prompts derived from external sources.
license: MIT
compatibility: Invoked by @butler in Phase meta
version: "1.0"
---

## Purpose

Portfolio-scale view of prompts. While `prompt-engineering` (sibling skill) is per-prompt authoring, this skill is the **review side**: scans every prompt in the framework, identifies cross-skill inconsistencies, anti-patterns, reuse opportunities, and licensing-concerns.

Three categories of finding: (1) **inconsistency** — the same concept phrased 5 different ways across skills (e.g., "halt for input" vs "wait for user" vs "pause for confirmation"); (2) **reuse-opportunity** — repeated patterns that should become forcing-function snippets; (3) **anti-pattern** — vague phrasing, missing output contracts, role-priming absent, refusal handling missing.

## When to Use (Proactive Triggers)

1. Quarterly housekeeping cron (prompt drift accumulates over time)
2. After a wave of new skills (e.g., post-Tier-0+1 additions in Unit #28) — verify consistency before tagging
3. User reports "Claude behaviour is unpredictable across skills" — diagnose with this audit
4. Pre-major-release (e.g., v0.3.0 → v0.4.0) — clean baseline
5. After importing prompts from external repos — license + compliance check

## Output Artifacts

1. **Audit report** at `_context/audit/prompt-governance-v{N}.md` — categorised findings (inconsistency / reuse / anti-pattern / licensing) with file refs
2. **Reuse-opportunity proposals** at `_context/audit/prompt-snippet-proposals-v{N}.md` — each proposal: pattern detected, count of occurrences, proposed snippet name, draft content
3. **Anti-pattern remediation list** — ranked by impact (which prompts are likely to misbehave first)
4. **Licensing report** — any prompt-content derived from external repos missing source attribution; CC-BY-4.0 / CC-BY-SA / etc. obligations vs MIT compatibility

## Prerequisites

- `templates/prompt-snippets/` exists with current snippet library
- For inconsistency detection: at least 3 skills exist in the same category (otherwise nothing to compare)
- For licensing scan: skills with `Source Attribution` sections (per SKILL-AUTHORING-STANDARD v0.3.0-alpha)

## Process

→ See [workflow.md](workflow.md) for full process.

1. **Step 1 — Inventory all prompts** in the framework:
   - Scan `skills/**/SKILL.md` body sections
   - Scan `lifecycle/*/*/steps/*.md` instruction blocks
   - Scan `template/.claude/agents/*.md` system prompts
   - Scan `templates/prompt-snippets/*.md` (the canonical library)
2. **Step 2 — Inconsistency detection**:
   - Cluster phrases by intent (n-gram similarity over 3-7 token sliding windows)
   - Surface clusters with ≥3 distinct phrasings
   - Recommend canonical phrasing per cluster
3. **Step 3 — Reuse-opportunity detection**:
   - Find patterns repeated in ≥3 skills
   - Propose new `templates/prompt-snippets/<name>.md` for each
   - Include before/after diff (what each skill would import)
4. **Step 4 — Anti-pattern scan**:
   - Vague phrasing: "do appropriate", "where applicable", "as needed"
   - Missing output contracts: prompt asks for output but doesn't specify structure
   - Missing role-priming: prompt jumps to instructions without identity statement
   - Missing refusal handling: prompt has no halt-for-input or what-not-to-do
5. **Step 5 — License audit**:
   - Each `Source Attribution` section: license noted? compatible with MIT?
   - GPL/AGPL-derived content: BLOCK (already enforced by `skill-builder`)
   - CC-BY-SA: warn (share-alike obligation may conflict with MIT downstream)
6. **Step 6 — Emit reports**; route reuse-opportunity proposals to `prompt-engineering` for snippet authoring; route anti-pattern remediation to `propose-change`

## Activation-Gate Checklist

- [ ] All prompts inventoried (count surfaces in report)
- [ ] At least 3 inconsistency clusters surfaced (or "none — portfolio consistent" stated)
- [ ] At least 1 reuse-opportunity proposal (or "none" stated; prompts authored fresh each time is acceptable but flag-worthy)
- [ ] Anti-pattern scan complete; remediation list ranked
- [ ] License audit: zero GPL/AGPL-derived; CC-BY-SA flagged with rationale
- [ ] Reports cross-link findings to specific file refs

## Output

Two audit reports + reuse proposals + remediation list. `prompt-engineering` consumes proposals to author new snippets. `propose-change` (governance) consumes remediation to drive skill-by-skill fixes.

## Distinction from `prompt-engineering`

| Aspect | prompt-engineering | prompt-governance (this) |
|---|---|---|
| Scope | Single prompt | Portfolio (all prompts) |
| Cadence | On-demand (when authoring) | Quarterly + pre-release |
| Output | Revised prompt | Audit report + proposals |
| Owner | @valet (authoring) | @valet (review) |

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `prompt-governance` skill. Implementation original to coldpress-os; integrates with existing `templates/prompt-snippets/` library + governance skills (`propose-change`).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U11b) | Initial prompt-governance skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). Portfolio-scale review side; pairs with prompt-engineering authoring side. |
