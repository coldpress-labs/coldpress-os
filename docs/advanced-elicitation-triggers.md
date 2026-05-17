---
name: advanced-elicitation-triggers
description: Heuristics that cause Butler to invoke advanced-elicitation on a user answer. FP10 from Phase II Part 2 deep-dive.
phase_authored: 2
status: reference
version: "1.0"
---

# Advanced-Elicitation — Invocation Triggers

`advanced-elicitation` ([skills/utilities/advanced-elicitation/](../skills/utilities/advanced-elicitation/)) pushes the LLM to reconsider a shallow or hedged user answer. Without clear triggers, Butler either over-invokes it (annoying) or under-invokes it (misses real thin-answer cases). This spec codifies the triggers so behaviour is predictable and testable.

**Scope:** applies across Phase 2 sub-skills. Phase 3-9 may extend as their deep-dives land.

---

## Invocation rule

**Invoke `advanced-elicitation` when:**

- Any **strong trigger** fires, OR
- **≥2 moderate triggers** fire in a single user answer

## Strong triggers

| Trigger | Detection |
|---|---|
| **Word count < 10** on an open-ended question | Split the answer on whitespace; if `word_count < 10` and the question type is open (not yes/no), fire |
| **Single-word answer** to an open question | `word_count == 1`; any single-word response to a "what / why / how / describe" prompt |
| **Deflection marker** | Answer contains any of: `"TBD"`, `"we'll figure it out"`, `"we'll see"`, `"later"`, `"depends"`, `"not sure yet"`, `"probably"`, `"I dunno"`. Case-insensitive substring match |

## Moderate triggers (count ≥2 to invoke)

| Trigger | Detection |
|---|---|
| **Hedge word** present | Count occurrences of: `"maybe"`, `"kind of"`, `"sort of"`, `"I guess"`, `"probably"`, `"not sure"`, `"I think"`, `"perhaps"`, `"somewhat"`. Each occurrence = 1 moderate trigger |
| **Generic cliché** present | Phrases like `"tech-savvy"`, `"cutting-edge"`, `"user-friendly"`, `"best-in-class"`, `"disruptive"` without substantive context = 1 moderate trigger each |
| **Repeat of question wording** without new content | User echoes the question back with minimal transformation (e.g., Q: *"What's the North Star metric?"* A: *"The North Star metric is… the most important thing"*) |

Two hedge words in one answer → invoke. One hedge word + one cliché → invoke. Etc.

## User dismissal

Any time Butler invokes advanced-elicitation and the user responds with *"I know what I mean"* / *"that's fine"* / *"move on"* / equivalent short dismissal — Butler honours the dismissal and does not re-prompt on the same answer.

**Don't escalate** on dismissal. If the user genuinely knows what they mean, forcing additional elicitation burns rapport. The trigger list favours recall over precision; dismissal is the precision correction.

## Method selection bias

When advanced-elicitation fires, which of its 50 catalog methods get applied depends on the calling sub-skill's step. See [data/methods/method-defaults.yaml](../data/methods/method-defaults.yaml) for the phase-2 bias table (maps sub-skill step → 2-3 recommended catalog methods).

Runtime override is permitted — the YAML is a starting bias, not a cage.

## Implementation notes

- **Trigger detection runs in Butler's orchestration layer**, not inside each skill. Butler inspects the user's last turn before deciding whether to route it to the calling skill OR to advanced-elicitation first.
- **False-positive tolerance:** the trigger list favours recall over precision because (a) the user can dismiss instantly, and (b) missed thin answers silently degrade sacred-doc quality, which costs more than a rejected elicitation offer.
- **Not applicable to closed questions.** Yes/no questions and specific-value questions (e.g., *"what's the WCAG target?"*) don't trigger — the answer length is constrained by the question shape.
- **Not applicable to confirmations.** *"Yes, proceed"* / *"Looks good"* / short confirmations to presented drafts don't trigger — they're not open-ended answers.

## Testing these triggers

Fixture cases (Phase II Part 2 Wave 3.8 completion):

| Input (from a discovery interview context) | Expected |
|---|---|
| *"Build a task tracker."* | fire (word count < 10 on open question) |
| *"A."* | fire (single-word on open) |
| *"TBD for now."* | fire (deflection marker) |
| *"Maybe task management, I guess, probably for small teams."* | fire (3 moderate triggers) |
| *"Mid-career PMs who lose 30-60 min/day reconciling tool overlap between Jira and Notion."* | no fire (specific, > 10 words, no hedging) |
| *"User-friendly tools for cutting-edge PMs."* | fire (2 cliché moderates) |
| *"Yes, that's right."* | no fire (confirmation to a presented claim) |
| *"WCAG AA."* | no fire (specific answer to closed-form question) |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial spec per Phase II Part 2 Wave 3.8 (FP10). Heuristics codified: strong triggers (word count, single-word, deflection markers) + moderate triggers (hedges, clichés, question-echoes) + ≥2-moderate invocation rule + user dismissal pattern. Method-selection bias pointer to `method-defaults.yaml`. Fixture cases for test authoring. |
