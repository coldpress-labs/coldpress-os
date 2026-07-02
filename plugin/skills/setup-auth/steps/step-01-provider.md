---
step_number: 1
step_name: "Select Provider"
step_goal: "Choose and configure the authentication provider"
halts_for_input: true
next_step: "step-02-backend.md"
---

## Goal

Select an auth provider and set up the account/keys.

## Instructions

1. **Present options:** Clerk (recommended), Auth0, Custom JWT
2. **Guide setup** of the selected provider's dashboard
3. **Collect API keys** and configure environment variables
4. **Never log or display secret keys**

## Output

Provider selected, keys configured. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-backend.md](step-02-backend.md)
