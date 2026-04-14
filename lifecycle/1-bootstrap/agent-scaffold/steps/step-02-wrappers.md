---
step_number: 2
step_name: "Generate Wrappers"
step_goal: "Create thin skill wrapper files in .claude/skills/"
halts_for_input: false
next_step: "step-03-butler.md"
---

## Goal

Generate one thin wrapper per skill in `.claude/skills/`.

## Instructions

1. **Create `.claude/skills/` directory** if it doesn't exist.

2. **For each skill**, generate a 3-line wrapper:
   ```markdown
   # .claude/skills/{skill-name}/SKILL.md
   ---
   name: "{skill-name}"
   description: "{description from catalog}"
   ---
   Read and follow coldpress-os/skills/{category}/{skill-name}/SKILL.md
   ```

3. **For lifecycle skills** that aren't in the skills catalog (phase-specific workflows like create-prd, dev-story), generate wrappers pointing to lifecycle:
   ```markdown
   ---
   name: "{skill-name}"
   description: "{description}"
   ---
   Read and follow coldpress-os/lifecycle/{phase}/{skill-name}/SKILL.md
   ```

4. **Count generated wrappers** and report.

## Output

All wrappers written. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-butler.md](step-03-butler.md)
