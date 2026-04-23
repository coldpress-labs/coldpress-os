---
step_number: 2
step_name: "Create Directory Structure"
step_goal: "Scaffold the project directory from the coldpress-os template"
halts_for_input: false
next_step: "step-03-submodule.md"
---

## Goal

Create the project directory structure using the template at `install/project-template/`.

## Instructions

1. **Create project root** at the confirmed path (or use current directory).
2. **Initialize git repository** if not already a repo.
3. **Copy template structure** from `install/project-template/`:
   - `.claude/` directory with SYSTEM.md placeholder
   - `docs/` directory structure
   - `_context/` directory with subdirectories (planning, design, implementation, testing, tracking)
   - `CLAUDE.md` template
4. **Create `.gitignore`** with standard patterns (node_modules, .env, .env.local, .DS_Store).
5. **Create `.env.example`** with placeholder entries.

## Output

Directory structure created. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-submodule.md](step-03-submodule.md)
