---
step_number: 3
step_name: "Directory Scan"
step_goal: "Map and document the complete directory structure"
halts_for_input: false
next_step: "step-04-architecture.md"
---

## Goal

Create a comprehensive map of the project's file and directory structure with descriptions.

## Instructions

1. **Generate directory tree** from project root, respecting `.gitignore` patterns.

2. **Identify critical directories** based on project type:
   - Source directories, entry points, configuration
   - Test directories and patterns
   - Public/static assets
   - Generated/build output (to exclude from deep scan)

3. **For deep/exhaustive scans:** Document each directory's purpose based on file contents.

4. **Identify file organization patterns:**
   - Feature-based, layer-based, or hybrid
   - Naming conventions
   - Co-location patterns (tests next to source, styles next to components)

5. **Write `_output/docs/source-tree.md`** immediately.

## Output

Source tree documentation written to `_output/docs/source-tree.md`. Update frontmatter: `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-architecture.md](step-04-architecture.md)
