---
name: "deploy-select"
description: "Phase 3 — choose the deploy_pack (orthogonal to stack_pack but constrained by it): default from the project profile, then confirm against the generated stack×deploy compatibility matrix. Only offers packs whose compatible_stacks include the locked stack; warns on unsupported pairs. Writes deploy_pack to coldpress.yaml."
type: "simple"
category: "lifecycle"
phase: 3
agent: "architect"
tools: ["Read", "Write", "Bash"]
inputs:
  - "the locked stack_pack (coldpress.yaml, from stack-locking)"
  - "the project profile default deploy_pack (§4.9)"
  - "docs/generated/stack-deploy-matrix.md (compatibility matrix)"
outputs:
  - artifact: "deploy_pack write-back"
    location: "coldpress.yaml"
    format: "yaml"
---

## Purpose

Pick **where the project ships** — the `deploy_pack` — at the same commit point
the stack locks. Deploy is a swappable axis (Vercel / Cloudflare / …), but it is
**not** independent of the stack: a pack can only ship stacks it supports, and it
consumes the stack's build config. This skill makes the choice explicit and checked.

## When to Use

- Phase 3, right after `stack-locking` writes `stack_pack` — before `env-provision` + the walking skeleton (which deploys to staging).

## Process

1. **Start from the profile default** — the profile (§4.9) pre-fills a `deploy_pack`.
2. **Consult the compatibility matrix** — `docs/generated/stack-deploy-matrix.md`
   (generated from every pack's `compatible_stacks`). Only offer deploy packs whose
   `compatible_stacks` include the **locked `stack_pack`**; **warn** and require an
   explicit override for an unsupported pair (e.g. an SSR stack on a static-only host).
3. **Verify the stack provides the pack's `stack_inputs`** — the build values the
   pack's commands consume (`BUILD_DIR`, `BUILD_CMD`, `NODE_VERSION`). A pack that
   needs a value the locked stack doesn't declare is not selectable.
4. **Confirm with the user** (this is on the P3 commit path), then **write
   `deploy_pack:`** to `coldpress.yaml` alongside `stack_pack`.

## Output

`coldpress.yaml` with `deploy_pack` set (validated). The walking skeleton then
deploys to staging via `deploy-staging` using this pack.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS6-B) | NEW (§5 P3). Selects `deploy_pack` at stack-lock: profile default → compatibility-matrix check (compatible_stacks ∩ locked stack) → stack_inputs availability → coldpress.yaml write-back. The stack×deploy coupling made explicit at the point of choice. |
