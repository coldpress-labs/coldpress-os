---
name: prompt-engineering
description: "Author + iterate prompts for skills (system prompts, step instructions, advanced-elicitation triggers). Applies prompt-engineering best practices: concrete examples, output-format contracts, role-priming, refusal handling, chain-of-thought scaffolds. Pairs with prompt-governance for review + tracking."
license: MIT
compatibility: Invoked by @butler in Phase meta
version: "1.0"
---

## Purpose

Meta skill for authoring + iterating prompts inside skills. Coldpress-os skills contain prompts at three levels: **system prompts** (subagent definitions in `template/.claude/agents/*.md`), **step instructions** (per-step `.md` files), **forcing functions** (`templates/prompt-snippets/*.md` reusable blocks). All three need craft applied — this skill is the canonical workflow for that craft.

Applies six best practices: (1) concrete examples preferred over abstract instructions; (2) output-format contracts (specify exact structure expected); (3) role-priming (clear identity statement); (4) refusal handling (what NOT to do, when to halt); (5) chain-of-thought scaffolds (numbered steps when reasoning order matters); (6) explicit input-state assumptions.

## When to Use (Proactive Triggers)

1. New skill being authored — pair with `skill-builder` for prompt portions
2. Existing skill underperforming — user reports "the skill doesn't reliably do X"; iterate the prompt
3. New subagent being defined — system prompt for `template/.claude/agents/<slug>.md`
4. New forcing function template — adding to `templates/prompt-snippets/`
5. Adversarial review surfaces a prompt-quality issue (e.g., model hallucinated when prompt was ambiguous)

## Output Artifacts

1. **Authored / revised prompt** in the target file (subagent definition / step file / snippet)
2. **Prompt rationale** at `_context/audit/prompt-changes-{date}.md` — before/after diff + which best-practice was applied + expected behaviour change
3. **Forcing-function additions** to `templates/prompt-snippets/` (if a reusable pattern emerges from this iteration)
4. **A/B test recommendation** (when iterating an underperforming prompt) — sketch alternative phrasings + which to try first

## Prerequisites

- `templates/prompt-snippets/` exists with the existing forcing-function library (attention-preamble, output-contract, forcing-function-mermaid, forcing-function-table, review-cot-triangle)
- Target file (skill / agent / snippet) is identified
- Memory `feedback_simpler_v1` applies — prefer simpler v1 over architecturally elegant v3

## Process

→ See [workflow.md](workflow.md) for full process.

1. **Step 1 — Identify prompt class** (system / step / snippet) and current state
2. **Step 2 — Apply best-practices checklist**:
   - [ ] Concrete examples present (or abstract framing justified)
   - [ ] Output format contract specified (Markdown structure / JSON schema reference / list shape)
   - [ ] Role-priming opens the prompt (who Claude IS for this work)
   - [ ] Refusal handling explicit (what NOT to do; when to halt for input)
   - [ ] Chain-of-thought scaffold (numbered steps; intermediate-state checkpoints)
   - [ ] Input-state assumptions stated (what files/context Claude has)
3. **Step 3 — Apply forcing-function snippets** where applicable (`output-contract.md` / `attention-preamble.md` / etc.)
4. **Step 4 — Surface ambiguities to user** — anything the original prompt assumed without stating
5. **Step 5 — Author revised prompt**; emit before/after diff
6. **Step 6 — Document rationale** at `_context/audit/prompt-changes-{date}.md`
7. **Step 7 — If pattern is reusable**, propose new `templates/prompt-snippets/<name>.md` (reviewed by `prompt-governance` before merge)

## Activation-Gate Checklist

- [ ] All 6 best-practices criteria evaluated (each pass / fail with rationale)
- [ ] Forcing-function snippets applied where applicable
- [ ] Before/after diff documented
- [ ] Rationale + expected behaviour change recorded
- [ ] If new snippet authored: routed to `prompt-governance` for review

## Output

Revised prompt in target file + rationale doc. Iteration history persists at `_context/audit/prompt-changes-*.md` so behavioural drift can be traced when a skill underperforms.

## Pairing with `prompt-governance`

This skill authors; `prompt-governance` (sibling skill) reviews + tracks portfolio-level concerns (consistency across skills, snippet reuse opportunities, anti-patterns surfacing). Together they form the meta-couplet: author → review → adopt.

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `prompt-engineer-toolkit` skill + best-practices distillation from Anthropic Claude prompt engineering docs. Implementation original to coldpress-os; integrates with existing `templates/prompt-snippets/` library + `skills/utilities/advanced-elicitation/`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U11a) | Initial prompt-engineering skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT) + Anthropic best-practices. Pairs with prompt-governance for review-side. |
