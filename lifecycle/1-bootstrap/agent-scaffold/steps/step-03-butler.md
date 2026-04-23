---
step_number: 3
step_name: "Configure Butler"
step_goal: "Generate SYSTEM.md and settings.json for the project's Butler agent"
halts_for_input: true
next_step: "complete"
---

## Goal

Set up Butler as the project orchestrator.

## Instructions

1. **Generate `.claude/SYSTEM.md`** from `template/.claude/SYSTEM.md` template, filled with:
   - Project name and type from coldpress.yaml
   - Lifecycle phase routing table
   - Sacred document protection rules
   - Skill catalog summary

2. **Generate `.claude/settings.json`** with default permission settings.

3. **Update project `CLAUDE.md`** with framework reference section.

4. **Present summary:**
   - Total wrappers generated
   - Butler configured
   - Next recommended action: Phase 2 (Discovery)

## User Interaction

"Butler is configured with **{N}** skill wrappers. Your project is ready. Start with Phase 2: Discovery?"

## Output

Butler configured. Workflow complete.

## Navigation

→ Workflow complete. Recommend: Phase 2 Discovery.
