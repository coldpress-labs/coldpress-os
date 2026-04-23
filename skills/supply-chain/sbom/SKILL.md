---
name: "sbom"
description: "Generate an SPDX or CycloneDX SBOM with Syft; emits the SBOM document and a ScanResult stub for gate integration"
type: "simple"
category: "supply-chain"
agent: "qa"
phases: [7]
tools: ["Bash", "Read", "Write"]
inputs:
  - "project root or container image"
outputs:
  - artifact: "SBOM document"
    location: "_context/audit/sbom/sbom-{date}.spdx.json"
    format: "spdx-json"
  - artifact: "ScanResult stub"
    location: "_context/audit/security/syft-{date}.json"
    format: "json"
version: "1.0"
---

## Purpose

Generate a Software Bill of Materials (SBOM) with [Syft](https://github.com/anchore/syft) (Apache-2.0). SBOMs document every dependency — direct + transitive — in a machine-readable format (SPDX or CycloneDX), which is the prerequisite for:

- Downstream vulnerability queries (feed to Grype, OSV, etc.)
- Supply-chain attestation (feed to Sigstore/in-toto when that lands post-v1.0)
- Compliance evidence (EO 14028 / NIST SSDF)

Syft itself does not report vulnerabilities — it inventories. The scanner wrappers in §5.1 (`scan-vulns`, `scan-deps-and-containers`) do the CVE matching. This skill is the ingredient generator.

## Why this emits a ScanResult stub

The phase-7 gate dispatches via `skill_ref` → each skill emits a `ScanResult`. SBOM generation doesn't produce findings in the classical sense, but it IS a supply-chain gate: if the SBOM generation fails (corrupted manifest, unreachable deps, unknown ecosystem), that's a `status: "error"` signal the aggregator should surface. So the skill emits:

1. The SBOM document itself at `_context/audit/sbom/sbom-{date}.spdx.json` (the actual deliverable).
2. A `ScanResult` stub at `_context/audit/security/syft-{date}.json` with `findings: []` and `status: "success" | "error"` driven by Syft exit code. Lets the aggregator treat SBOM-generation health as a first-class gate concern.

## When to Use

- Phase 7 pre-deployment gate (mandatory for projects declaring `supply_chain.required: true` in `coldpress.yaml`; best-effort otherwise)
- Release tag prep — ship the SBOM alongside the release artefact
- Compliance audits

## Prerequisites

- **Syft on PATH.** Install: `brew install syft` or `curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh`.

## Process

1. Generate SBOM in SPDX-JSON format (default; CycloneDX available via `--output cyclonedx-json`):
   ```bash
   syft . --output spdx-json=_context/audit/sbom/sbom-{date}.spdx.json
   ```
2. Emit the `ScanResult` stub:
   - `status: "success"` with `findings: []` on exit 0
   - `status: "error"` with `error_message` populated on exit != 0
   - `summary`: all-zero counts

## Output

- SBOM document (the real deliverable)
- `ScanResult` stub for gate bookkeeping

## Licence

Syft is Apache-2.0. Subprocess invocation.

## What this skill does NOT do

- **Does not** assess vulnerabilities — that's `scan-vulns` / `scan-deps-and-containers`
- **Does not** sign the SBOM — Sigstore / cosign wrap-up is post-v1.0 scope (plan §5.2)
- **Does not** diff SBOMs between releases — deferred to a follow-up `sbom-diff` skill if demand surfaces

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Syft/SBOM wrapper spec — part of Wave 5 Block Y §5.1. Produces SPDX-JSON deliverable + ScanResult stub for gate hygiene. Subprocess adapter deferred pending install. |
