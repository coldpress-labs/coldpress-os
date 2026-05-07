---
step_number: 3
step_name: "Visual Direction + Token Foundation Reference"
step_goal: "Author visual direction (mood, references, foundational token feel); design-thinking ideate + brainstorming Tier-1; advanced-elicitation on vague visual"
halts_for_input: true
next_step: "step-04-platform.md"
partial_completion_id: "design_brief_step_03"
---

## Goal

Author the visual direction section. NOTE: Final design tokens (specific colour values, typography pairs, spacing scale) live in `brand-guidelines-v{N}.md` (Wave 5.4 skill). design-brief documents the *direction* — mood, references, foundational feel — so brand-guidelines can author concrete tokens against it.

Method playbook Tier-1 wire-ins: `design_thinking` ideate stage (visual ideation); `brainstorming` (what_if_mashup, scamper); `advanced_elicitation` on vague_visual_direction.

## Instructions

### 1. Partial-completion write

Write `partial_completion: { step_id: "design_brief_step_03", sub_skill: "visual_direction", at: "started" }`.

### 2. Visual direction prompt

> **Visual direction (mood + references).** Based on personas + content strategy + brand voice:
>
> - **Mood (3–5 adjectives):** e.g., "trustworthy / clinical / calming" or "energetic / playful / direct".
> - **Visual references (3–5 URLs or descriptions):** existing products / interfaces / artworks that capture the desired feel.
> - **Tonal contrast:** how should this look feel different from competitors?
> - **Density:** sparse-and-airy / structured-dense / immersive?
>
> *Tier-1 method: `brainstorming` (what_if_mashup) if user wants to explore unconventional directions.*
> *Tier-1 method: `design_thinking` ideate stage for systematic visual ideation.*

Halt for user input.

### 3. Advanced-elicitation trigger

Check user's visual description against vague-visual patterns ("clean", "modern", "minimal", "professional"). If matches: invoke `advanced-elicitation` (method `concrete-references`) — drill down via "show me a screen that feels right; what's wrong with these similar references?".

### 4. Tech-stack feasibility check (graph-derived)

From Step 0 graph: `tech-stack-md.css_strategy` (CSS-in-JS / Tailwind / CSS modules / vanilla CSS). Confirm visual direction is implementable:

- Tailwind: limit token feel to design-system-friendly atomic patterns
- CSS-in-JS: themes can be richer; runtime theming possible
- vanilla CSS: simpler tokens; less runtime flexibility

If user's visual direction needs a capability the stack doesn't support (e.g., "pixel-perfect motion graphics" but stack is React + Tailwind no animation library), surface as design-delta with `delta_type: conflicting` and `recommendation: flag_for_architecture_ADR` (Phase 6 may need to add ADR for animation library).

### 5. Foundational token feel (NOT specific tokens)

Capture token *direction*:

- Colour family: warm / cool / neutral / vibrant
- Typography pair concept: serif-headline + sans-body / mono-everywhere / variable-font / etc.
- Spacing scale concept: tight / generous / 4px-grid / 8px-grid
- Motion: subtle / playful / static

Specific tokens (e.g., `#0066CC`, `Inter 400`, `8px`) are authored in `brand-guidelines` skill (Wave 5.4) using this direction as input.

### 6. Write into draft document

Append `## Visual Direction` section. Include mood, references, density, foundational token feel, tech-stack-feasibility note.

Add a forward-pointer: "Specific token values land in `_context/design/brand-guidelines-v{N}.md`."

### 7. Partial-completion clean

Update `partial_completion: { step_id: "design_brief_step_03", sub_skill: "visual_direction", at: "visual_drafted" }`.

## Output

- Draft document has Visual Direction section
- Foundational token-feel direction captured (specific tokens deferred to brand-guidelines)
- Tech-stack feasibility checked; any conflicts surfaced as design-deltas

## Navigation

→ Next: [step-04-platform.md](step-04-platform.md)
