---
step_number: 1
step_name: "Mode Detection"
step_goal: "Detect standalone vs bridge mode and load product-brief if available"
halts_for_input: true
next_step: "step-02-content.md"
---

## Goal

Determine whether to run in standalone mode (full discovery) or bridge mode (import product-brief), and load all available context.

## Instructions

1. **Check for product brief:**
   - Look for `_context/planning/product-brief-*.md`
   - If found: activate **bridge mode** — product context is already captured
   - If not found: activate **standalone mode** — full discovery needed

2. **Bridge mode:**
   - Load the product brief and extract: vision, users, value prop, features, constraints
   - Confirm with user: "I found your product brief. I'll use it as the foundation — skipping redundant discovery."
   - Skip to content strategy (steps 1-12 of standalone are covered)

3. **Standalone mode:**
   - Conduct condensed product discovery inline:
     - "What's the product?" / "Who's it for?" / "What's the core value?"
   - Load `docs/context.md` and `docs/tech-stack.md` if available
   - Gather enough context to proceed to content strategy

4. **Load design context:**
   - Check for existing brand guidelines, style references, or inspiration
   - Ask about design constraints (existing brand, platform requirements)

## Output

Mode selected, product context loaded, ready for content strategy. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-content.md](step-02-content.md)
