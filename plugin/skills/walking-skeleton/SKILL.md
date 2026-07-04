---
name: walking-skeleton
description: "★ Prove the stack by deploying a walking skeleton (P3) — a hello-world through the ENTIRE locked stack + deploy pack to STAGING, before a single feature is planned. The single best de-risking step for 'deploy anywhere': it flushes out env/secret/build/deploy-pipeline problems while they're free instead of at P9. Runs a license scan on the locked dependency set. Sets the P3 gate keys `walking_skeleton_deployed` + `license_scan_clean`. NEVER cut — both lanes."
license: MIT
compatibility: Invoked by @architect in Phase 3
version: "1.0"
---

## Purpose

Every "deploy anywhere" claim dies at the first real deploy. The walking skeleton kills that risk at Phase 3, for free: build the smallest possible app — one route that renders "hello" and reads one env var — and push it through the *entire* locked stack and deploy pack to **staging**, before any feature is planned. If the build config, the secrets wiring, the deploy pipeline, or the pack selection is wrong, you find out now (when the fix is one config line) instead of at P9 (when it blocks a release). It also runs a license scan on the locked dependency set, so a GPL/AGPL surprise surfaces at lock time, not ship time. It is a ★ non-negotiable in both lanes.

## When to Use

- At the end of Phase 3, after `stack-locking` + `deploy-select` + `env-provision`, before Phase 4 begins. The P3 exit gate requires it.

## Prerequisites

- The stack is locked (`tech-stack.md` sacred) with `BUILD_CMD`/`BUILD_DIR`.
- A `deploy_pack` is selected (`deploy-select`) and its staging target is reachable.
- `secure/manifest.yaml` declares the env keys; `env-provision` has set them.

## Process

1. **Scaffold the skeleton** — the minimal app the locked stack can build: one route that renders a sentinel string and reads exactly one env var (to prove secret wiring). No features, no design — this is a pipeline test, not a product.

2. **Build it** with the locked stack's `BUILD_CMD` → `BUILD_DIR`. A build failure here is a stack/config problem to fix before Phase 4, not a feature problem.

3. **Deploy to staging** via the selected deploy pack (`deploy-staging`). This exercises the real pipeline: pack CLI, env injection, build settings — end to end.

4. **Prove it** — `smoke` the staging URL: the sentinel route returns 200 with the sentinel string, and the one env var read back correctly. Record the staging URL in `state.yaml deploy.staging`.

5. **License scan** — run the license policy (the same one `readiness` re-runs at P9) over the locked dependency set. Block on GPL/AGPL/SSPL in client-shipped code. This catches a licence problem at lock time, when swapping a dependency is still cheap.

6. **Set the P3 gate keys** in `.coldpress/state.yaml`:
   - `gates.p3.walking_skeleton_deployed: true` (staging smoke green),
   - `gates.p3.license_scan_clean: true` (no blocking licence).
   Both are required for the P3 exit gate; leave a key `false` (or absent) if its step didn't pass — the gate stays red honestly.

## Output

A live staging deployment of the walking skeleton + the two P3 gate keys set. De-risks every later deploy (P8 preview, P9 prod) by proving the pipeline once, early.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A6) | NEW P3 producer (system-integration audit A6: the walking skeleton is a ★ P3 non-negotiable in the plan (§5 P3) but no skill existed and the gate keys `walking_skeleton_deployed`/`license_scan_clean` existed nowhere). Scaffolds + builds + deploys a hello-world to staging via the locked stack + deploy pack, smokes it, runs the licence scan, and sets the two P3 gate keys. Never cut — both lanes. |
