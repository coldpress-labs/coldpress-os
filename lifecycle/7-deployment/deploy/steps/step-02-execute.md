---
step_number: 2
step_name: "Execute Deploy"
step_goal: "Run the deployment command for the target platform"
halts_for_input: true
next_step: "step-03-verify.md"
---

## Instructions

1. **Execute platform-specific deployment:**
   - **Vercel:** `vercel --prod` or rely on git push trigger
   - **Docker:** Build image, push, deploy container
   - **Fly.io:** `fly deploy`
   - **Manual:** Guide user through deployment steps
2. **Monitor deployment** for errors.
3. **If deployment fails,** diagnose and present options.

## Output

Deployment executed. `step_2_complete: true`

## Navigation

→ Proceed to [step-03-verify.md](step-03-verify.md)
