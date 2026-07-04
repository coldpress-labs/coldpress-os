---
name: "security-registry"
description: "Enumerate the security-sensitive code paths (P6) — _context/architecture/security-registry.yaml: every path that handles authn/authz/secrets/PII/payment/crypto, keyed to an architecture component with a reason. This is the artefact that FORCES rigour downstream: P7 story-slice sets risk:high on any story whose owns/produces globs intersect a registered path (→ P8 solo dispatch + opus verify + Butler plan-approval), and `coldpress waves` excludes those stories from team-mode parallelism. A missing/empty registry silently disables the entire security-risk-forcing thread — so authoring it (even to declare 'none') is a deliberate P6 statement."
type: "workflow"
category: "lifecycle"
phase: 6
agent: "architect"
inputs:
  cold_file_reads:
    - "_context/sacred/architecture.md (components + data flows)"
    - "_context/sacred/prd.md (NFR security requirements + security_tier)"
    - "_context/architecture/data-model.yaml (PII-bearing entities)"
    - "_context/architecture/api-contract.yaml (auth-gated operations)"
outputs:
  - artifact: "Security registry"
    location: "_context/architecture/security-registry.yaml"
    format: "yaml"
    schema: "schemas/architecture/p6-artifacts.schema.ts (SecurityRegistrySchema)"
    sacred: false
version: "1.0"
---

## Purpose

Security rigour that depends on a developer remembering is not rigour. The security registry makes it structural: it enumerates the code paths that are security-sensitive, and downstream machinery reads that list to force the right handling — a story touching a registered path is automatically `risk: high`, dispatched solo, verified on opus, and gated behind Butler plan-approval. Without this file, `story-slice`'s risk-forcing has nothing to intersect against and the whole thread silently no-ops. Authoring it is therefore not optional at P6.

## When to Use

- During Phase 6, after the architecture components + data flows are drawn (so paths can be attributed), before the Phase 6 → 7 handoff (which carries the registry into `story-slice`).
- Re-run when the architecture adds a component that handles credentials, money, or personal data.

## Prerequisites

- `_context/sacred/architecture.md` exists (the component/data-flow source).
- `security_tier` known (T1/T2 raise the bar; even T0 should declare its sensitive paths honestly).

## Process

1. **Walk the architecture for sensitive surfaces.** For each component + data flow, ask: does it authenticate, authorise, store/transit a secret, handle PII, move money, or do crypto? Cross-reference the data-model (PII entities) and api-contract (auth-gated operations).

2. **Register each as a path entry** — a glob for the code path, its `category` (authn / authz / secrets / pii / payment / crypto / input-validation / session / access-control), a one-line `reason`, and the owning architecture `component`. The glob is what `story-slice` intersects story `owns`/`produces` globs against, so scope it to where the sensitive logic actually lives.

3. **Emit `_context/architecture/security-registry.yaml`** (`SecurityRegistrySchema`):

   ```yaml
   entries:
     - { path: "src/auth/**", category: authn, reason: "session + credential handling", component: auth-service }
     - { path: "src/billing/**", category: payment, reason: "Stripe charge + webhook", component: billing }
     - { path: "src/db/pii/**", category: pii, reason: "stores user email + address", component: data }
   ```

4. **If there are genuinely none**, emit `entries: []` — an explicit, reviewable "no security-sensitive paths" statement rather than an absent file. (The P6 gate should treat a *missing* file as unresolved, an *empty* one as a decision.)

5. **Hand off.** The Phase 6 → 7 handoff carries the registry so `story-slice` can force `risk: high` on intersecting stories; the story-graph schema then rejects any `security_registry` story that isn't `risk: high` (WS10-A3 cross-check).

## Output

`_context/architecture/security-registry.yaml`. Consumed by `story-slice` (risk-forcing), `dev-story`/`verifier` (P8 handling), and `coldpress waves` (team-mode exclusion). Complements `threat-model` (the STRIDE threats whose mitigations live at these paths).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A3) | NEW P6 producer (system-integration audit A3: the security registry is consumed by story-slice risk-forcing, dev-story/verifier, and `waves` team-mode exclusion, but no skill produced it and it wasn't even schema'd — the whole security-risk-forcing thread silently disabled on a missing file). Adds `SecurityRegistrySchema` + this producer; paired with the story-graph `security_registry ⇒ risk:high` cross-check refine. |
