---
step_number: 2
step_name: "Backend Auth"
step_goal: "Configure Convex auth middleware and user management"
halts_for_input: false
next_step: "step-03-functions.md"
---

## Goal

Set up Convex-side authentication.

## Instructions

1. **Create `convex/auth.config.ts`** with provider configuration.
2. **Add users table** to schema if not present.
3. **Create user management functions** (getUser, storeUser).
4. **Configure Convex environment variables** for the auth provider.

## Output

Backend auth configured. `step_2_complete: true`

## Navigation

→ Auto-proceed to [step-03-functions.md](step-03-functions.md)
