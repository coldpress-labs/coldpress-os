---
step_number: 1
step_name: "Initialize"
step_goal: "Load context and detect operating mode (create/edit/validate)"
halts_for_input: true
next_step: "step-02-vision.md"
---

## Goal

Load all available context documents and determine which operating mode to use: create (c), edit (e), or validate (v).

## Instructions

1. **Detect mode:**
   - Check if `_context/sacred/prd.md` already exists
   - If exists: offer edit (e) or validate (v) modes
   - If not exists: default to create (c) mode
   - User can override with explicit mode flag

2. **Load context documents:**
   - `_context/sacred/context.md` — project context (required)
   - `_context/sacred/tech-stack.md` — technology decisions (required)
   - `_context/planning/product-brief-*.md` — product brief (recommended)
   - `_context/planning/design-brief-*.md` — design brief (recommended)
   - Discovery research outputs if available

3. **Summarize loaded context:**
   - Present a brief summary of what's been loaded
   - Identify gaps: "I don't have X — we'll need to address this during the process"
   - Confirm readiness with user

4. **Mode-specific routing:**
   - **Create (c):** Proceed through steps 2-5 in order
   - **Edit (e):** Load existing PRD, present current state, then guided modification
   - **Validate (v):** Route to `validate-prd` skill instead

## Output

Context loaded, mode determined, ready to proceed. `step_1_complete: true`

## Navigation

-> Proceed to [step-02-vision.md](step-02-vision.md)
