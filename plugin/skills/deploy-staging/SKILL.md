---
name: deploy-staging
description: "Phase 9 — deploy to STAGING via the selected deploy pack: build with the locked stack's BUILD_CMD, push BUILD_DIR through the pack's staging deploy_cmd, map secure/ secrets via the pack's env_mapping. Returns the staging URL for smoke. Non-prod, so model-invocable (unlike deploy-prod)."
license: MIT
compatibility: Invoked by @devops in Phase 9
allowed-tools: "Read Bash"
---

## Purpose

Ship the build to **staging** — the always-on environment the walking skeleton and
every verified wave land on first. Identically shaped across packs: this skill reads
the selected `deploy_pack`'s `pack.yaml` and dispatches the platform CLI.

## Process

1. **Resolve the pack** — read `deploy_pack` from `coldpress.yaml`, load
   `data/deploy-packs/<name>/pack.yaml`.
2. **Resolve stack inputs** — pull `BUILD_CMD` / `BUILD_DIR` / `NODE_VERSION` (the
   pack's `stack_inputs`) from the locked stack / coldpress.yaml baselines. The pack
   does not define these — the stack does.
3. **Build** — run the stack's `BUILD_CMD`; confirm output at `BUILD_DIR`.
4. **Map secrets** — for each required key in `secure/manifest.yaml`, push it via the
   pack's `env_mapping.set_cmd` (scoped to the staging/preview environment). Never
   echo secret values.
5. **Deploy** — run `targets.staging.deploy_cmd` (with `${BUILD_DIR}` etc. resolved).
6. **Return the staging URL** (`targets.staging.url`) for `smoke`.

## Output

A live staging deployment + its URL. Hand to `smoke`; a green staging smoke is the
precondition `deploy-gate` checks before `deploy-prod`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-B) | NEW (§5 P9). Pack-driven staging deploy split out of the transitional `deploy` skill. Model-invocable (staging is safe); prod is the separate human-only `deploy-prod`. |
