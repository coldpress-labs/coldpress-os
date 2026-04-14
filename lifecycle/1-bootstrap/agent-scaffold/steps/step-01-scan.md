---
step_number: 1
step_name: "Scan Skills"
step_goal: "Inventory all available coldpress-os skills for wrapper generation"
halts_for_input: false
next_step: "step-02-wrappers.md"
---

## Goal

Build a complete list of skills that need wrappers.

## Instructions

1. **Read `coldpress-os/data/agents/skill-catalog.csv`** to get all skill definitions.
2. **Read `coldpress.yaml`** to check for stack pack selection.
3. **Build wrapper list:**
   - All skills from reviews, testing, creative, utilities, ops, meta categories
   - Stack-pack skills only for the selected stack pack
   - Skip skills for unselected stack packs
4. **Count total wrappers** to generate.

## Output

Wrapper list in frontmatter. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-wrappers.md](step-02-wrappers.md)
