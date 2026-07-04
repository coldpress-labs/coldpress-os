---
name: threat-model
description: "Model the threats (P6) — _context/architecture/threat-model.yaml: STRIDE-per-component threats (spoofing/tampering/repudiation/info-disclosure/DoS/elevation) each with a mitigation, a residual-risk rating, and a cross-reference to the security-registry path where the mitigation lives. Pairs with security-registry: the registry says WHERE the sensitive code is; the threat model says WHAT could go wrong there and HOW it's mitigated."
license: MIT
compatibility: Invoked by @architect in Phase 6
version: "1.0"
---

## Purpose

The security registry marks *where* the sensitive code is; the threat model reasons about *what an attacker does there and whether it's handled*. STRIDE-per-component keeps it systematic — for each component crossing a trust boundary, walk the six categories and record the threat, its mitigation, and the residual risk. The output is auditable at P9 (readiness) and gives the verifier a concrete checklist for security stories.

## When to Use

- During Phase 6, after `security-registry` (its entries are the components worth threat-modelling), before the Phase 6 gate.
- Re-run when a new external integration or trust boundary is added.

## Prerequisites

- `_context/architecture/security-registry.yaml` exists (the sensitive components to model).
- Trust boundaries identifiable from architecture.md + integration-inventory.

## Process

1. **Identify the assets + trust boundaries.** From the architecture + integration inventory, list the components that cross a trust boundary (user↔app, app↔third-party, app↔data store) — these are where threats concentrate.

2. **STRIDE each sensitive component.** For each, walk the six categories and record any credible threat:
   - **S**poofing (identity), **T**ampering (integrity), **R**epudiation (audit), **I**nformation disclosure (confidentiality), **D**enial of service (availability), **E**levation of privilege (authorisation).

3. **For each threat, name the mitigation + residual risk.** A threat with no mitigation is an open risk that must forward-carry (architecture-delta or an explicit accept). Cross-reference the `security-registry` path(s) where the mitigation is implemented (`security_registry_paths`) so the verifier can check the mitigation actually lands at P8.

4. **Emit `_context/architecture/threat-model.yaml`** (`ThreatModelSchema`):

   ```yaml
   threats:
     - id: T-01
       component: auth-service
       category: spoofing
       description: "credential stuffing against the login endpoint"
       mitigation: "rate-limit + lockout + optional MFA"
       residual_risk: low
       security_registry_paths: ["src/auth/**"]
     - id: T-02
       component: billing
       category: tampering
       description: "forged Stripe webhook mutating an order"
       mitigation: "verify Stripe signature; reject unsigned"
       residual_risk: low
       security_registry_paths: ["src/billing/**"]
   ```

## Output

`_context/architecture/threat-model.yaml`. Audited at P9 `readiness`; gives `verifier` a per-story security checklist for `risk: high` stories. Every `mitigation` should correspond to code under a `security-registry` path.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-04 | Butler (v0.4 WS10-A3) | NEW P6 producer (system-integration audit A3: threat-model was referenced but neither schema'd nor produced). Adds `ThreatModelSchema` (STRIDE-per-component + mitigation + residual-risk + security-registry cross-ref) + this producer; pairs with `security-registry`. |
