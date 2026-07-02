---
name: deploy-preview
description: Phase 8/9 — deploy a per-story (or per-wave) PREVIEW URL via the deploy pack, when the pack supports it (capabilities.deploy_preview). The verifier runs visual/e2e/instrumentation checks against the real preview URL, not localhost; humans (and clients) review continuously. Skipped on packs without native previews.
license: MIT
compatibility: Invoked by @devops in Phase 8
allowed-tools: "Read Bash"
---

## Purpose

Give every story (or wave) a **real preview URL** at verifier hand-off, so
verification and the human taste-check happen against a deployed environment
continuously — not once at P9. Cheap where the platform provides it natively
(Vercel/Cloudflare/Netlify all do); skipped where it doesn't.

## When to Use

- At Phase 8 verifier hand-off for a completed story/wave (§5 P8 preview deployments).
- Requires the pack's `capabilities.deploy_preview: true` — otherwise this skill
  reports "preview not supported by <pack>" and verification runs against staging.

## Process

1. **Check capability** — load the pack; if `capabilities.deploy_preview` is false, skip.
2. **Resolve** the pack + stack inputs; set `${STORY_BRANCH}` to the story/wave branch.
3. **Deploy preview** — run `targets.preview.deploy_cmd` (e.g. `vercel deploy`,
   `wrangler pages deploy --branch <story-branch>`).
4. **Return the preview URL** — the `@verifier` runs `visual-verify` + e2e +
   instrumentation against it; the human/client peeks (§7.17).

## Output

A per-story/wave preview URL for clean-room verification + continuous human review.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-B) | NEW (§5 P8/P9 preview deployments). Pack `deploy-preview` verb; gated on `capabilities.deploy_preview`; feeds the clean-room verifier + continuous human review. |
