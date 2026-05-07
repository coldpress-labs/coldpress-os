---
step_number: 1
step_name: "Read Tech Stack"
step_goal: "Read _context/sacred/tech-stack.md and plan the setup"
halts_for_input: false
next_step: "step-02-install.md"
---

## Goal

Understand exactly what needs to be installed and configured. This step applies to the generic provision path only — if a stack pack was detected at Step 0, the pack's quickstart skill handles stack reading internally.

## Instructions

1. **Read** `_context/sacred/tech-stack.md` — extract every technology, version, and tool specified.
2. **Read** `coldpress.yaml baselines:` block — note which categories are `confirmed` vs `opted-out` (used in Step 3 Part B).
3. **Build a setup checklist:**
   - Runtime(s) to verify (Node.js version, Python version, etc.)
   - Package manager to use
   - Core dependencies to install
   - Dev dependencies to install
   - Configuration files needed (tsconfig, eslint, prettier, etc.)
   - Environment variables required
   - Baselines to activate (confirmed categories from `coldpress.yaml`)
4. **Check current state** — what's already installed or configured?
5. **Present the setup plan** to the user — including which baselines will be activated in Step 3.

## Output

Setup plan documented. `step_1_complete: true`

## Navigation

→ Auto-proceed to [step-02-install.md](step-02-install.md)
