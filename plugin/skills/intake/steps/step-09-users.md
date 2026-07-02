---
step_number: 9
step_name: "Users & Value"
step_goal: "Identify user types + value; brownfield path asks about prior users"
halts_for_input: true
next_step: "step-10-constraints.md"
---

## Goal

Understand users, their needs, and the value proposition. Path diverges on `.coldpress/local-config.yaml project_shape` (set by Step 6) — brownfield asks legacy-specific questions; greenfield starts fresh.

## Instructions

### 0. Read project_shape

Read `project_shape` from `.coldpress/local-config.yaml` (set by Step 6, shape determination). Values: `greenfield | brownfield | ambiguous`.

- `greenfield` → §Greenfield path below
- `brownfield` → §Brownfield path below (plus greenfield questions for the target future state)
- `ambiguous` → surface the ambiguity to user, pick one path, note the call

### Greenfield path

1. **Identify user types:**
   - Who are the primary users?
   - Secondary users (admins, moderators, API consumers)?
   - Cross-check against any existing archetype signal in `_input/raw/` — user may have briefs, interview transcripts, or AI-chat exports mentioning audience.

2. **For each user type:**
   - Main goal when using this?
   - Biggest pain point today?
   - What would delight them?

3. **Value proposition:**
   - What does this do better than alternatives?
   - How does the user's life change?

### Brownfield path

When `project_shape == brownfield`, `_input/legacy/` contains prior attempts / old code. Start with the *people who used it*, not the code.

1. **Prior users — what we learn from the legacy:**
   - *"You mentioned prior code in `_input/legacy/`. Who used the previous version?"*
   - *"What did they love? What did they struggle with?"*
   - *"Are those same users our target now, or are we serving a different audience this time?"*

2. **Audience continuity:**
   - If same audience → what did we learn from them that shapes v2?
   - If shifted audience → why the shift? (usage data / business pivot / market shift?)

3. **After brownfield-specific questions, proceed with Greenfield questions 1-3** — the target-state framing still applies; we just have more prior-art context to work from.

### All paths — document findings

Write to the working context.md draft under Users section. Preserve direct user quotes from `_input/raw/` where available — they're gold for Phase 4 PRD acceptance criteria.

## User Interaction

Continue conversational interview. Build on the vision context from Step 8. If brownfield, the prior-user questions often reveal *why this v2 exists* — surface that explicitly; it belongs in Vision (Step 8) retroactively if it reframes the story.

**Advanced-elicitation bias:** if user types come back vague or generic, Butler may invoke advanced-elicitation biased toward **#4 User Persona Focus Group** and **#10 Customer Support Theater** (roleplay methods that surface real user shape).

## Output

Users section populated in the working context.md draft. Branch path (greenfield / brownfield / ambiguous) noted. `step_9_complete: true`

## Navigation

→ Proceed to [step-10-constraints.md](step-10-constraints.md)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-generate-project-context as `pre-project-interview` Step 2. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 9 inside `intake` (WS5-B, §8 item 6). |
