---
name: validate-sacred-doc
description: Semantic policy enforcement on sacred docs (Conftest + Rego) — upstream references, approver rules, cross-doc consistency
license: MIT
compatibility: Invoked by @butler in Phase 3
allowed-tools: "Bash Read"
version: "1.0"
---

## Purpose

Enforce **semantic** policies on sacred docs that go beyond structural-shape validation. Examples:

- "PRD must reference at least one ADR under `adr_references[]`" — structural shape alone accepts an empty array; semantic policy demands at least one entry.
- "Architecture.md mutations require `approvers[]` to contain ≥1 name" — shape allows the empty array; policy rejects it.
- "Tech-stack `stack_pack` must match a known stack-pack id registered in `skills/stack-packs/`" — cross-reference the doc against another part of the repo.
- "A PRD's `workflowType` must be `prd` (structural) AND its filename must be `prd.md` (cross-field)" — semantic enforcement.

Backed by [Conftest](https://github.com/open-policy-agent/conftest) (Apache-2.0), which evaluates [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/) policies from OPA. Conftest is a Go binary; invoked as a subprocess.

Pairs with the Ajv-based structural validator (`validate-schema`) — both run at the same lifecycle moments. Structural first, semantic second.

## When to Use

- Immediately after `validate-schema` passes — a doc with invalid shape can't be meaningfully evaluated for semantics.
- Phase 3/4/5 gate acceptance checks (wired via `gate.json` `skill_ref`).
- Pre-commit hook on sacred-doc mutations (opt-in; wires in a follow-up block when the hook infrastructure stabilises).

## Prerequisites

- **Conftest on PATH.** Install: `brew install conftest` or `curl -L https://github.com/open-policy-agent/conftest/releases/latest/download/conftest_<version>_Linux_x86_64.tar.gz | tar xz`.
- Rego policies shipped with coldpress-os at `authoring/governance/policies/`.

## Process

1. Locate the sacred doc; extract frontmatter as YAML.
2. Invoke Conftest with the shipped policy bundle:
   ```bash
   conftest test <doc-path> \
     --policy coldpress-os/authoring/governance/policies/ \
     --namespace sacred_doc \
     --output json > /tmp/conftest-out.json || true
   ```
3. Parse Conftest's JSON output; map violations (`failures[]` + `warnings[]`) into a skill-friendly report.
4. Exit codes:
   - `0` — all policies passed (including warnings-only)
   - `1` — at least one `failures[]` violation
5. Write the human-readable report to `_context/audit/governance/sacred-doc-{basename}-{date}.md` for audit trail.

## The shipped Rego policies (seed set)

At `authoring/governance/policies/`:

| Policy file | What it enforces |
|-------------|------------------|
| `prd_has_adr.rego` | `workflowType == "prd"` docs MUST have ≥1 `adr_references[]` entry matching `^ADR-\d{4}$`. |
| `architecture_has_approvers.rego` | `workflowType == "architecture"` docs MUST have ≥1 `approvers[]` entry. |
| `pert_references_architecture.rego` | `workflowType == "pert-chart"` docs MUST list `architecture.md` under `inputDocuments[]`. |

Adding a new policy: drop a new `.rego` file under `authoring/governance/policies/`, restart Conftest. No registry update required.

## Output

Stdout summary + archived report at `_context/audit/governance/`.

## Failure modes

- **Conftest not installed** — aborts with install hint.
- **Policy syntax error** — indicates framework corruption; exits `1`.
- **Doc frontmatter unreadable** — run `validate-schema` first.

## Licence

Conftest is Apache-2.0. Rego policies shipped with coldpress-os are MIT (matching the framework licence).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Conftest-backed semantic validator — part of Wave 5 Block Y §5.2. Seed Rego policies shipped at `authoring/governance/policies/`. Subprocess adapter script deferred pending Conftest install for end-to-end validation. |
