---
step_number: 2
step_name: "Convex Init"
step_goal: "Initialize Convex and connect to a deployment"
halts_for_input: true
next_step: "step-03-scaffold.md"
---

## Goal

Set up Convex as the backend for the project.

## Instructions

1. **Install Convex:** `npm install convex`
2. **Run init:** `npx convex init` (or `npx convex dev` for first-time setup)
3. **Configure ConvexProvider** in the app's root component.
4. **Set up environment variables** for Convex URL.
5. **Verify connection** to Convex dashboard.

## Output

Convex initialized and connected. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-scaffold.md](step-03-scaffold.md)
