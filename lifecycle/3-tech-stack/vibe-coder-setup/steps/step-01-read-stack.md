---
step_number: 1
step_name: "Read Tech Stack"
step_goal: "Read docs/tech-stack.md and plan the setup"
halts_for_input: false
next_step: "step-02-install.md"
---

## Goal

Understand exactly what needs to be installed and configured.

## Instructions

1. **Read** `docs/tech-stack.md` — extract every technology, version, and tool specified.
2. **Build a setup checklist:**
   - Runtime(s) to verify (Node.js version, Python version, etc.)
   - Package manager to use
   - Core dependencies to install
   - Dev dependencies to install
   - Configuration files needed (tsconfig, eslint, prettier, etc.)
   - Environment variables required
3. **Check current state** — what's already installed or configured?
4. **Present the setup plan** to the user.

## Output

Setup plan documented. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-install.md](step-02-install.md)
