---
name: scan-vulns
description: Run OSV-Scanner against dependency manifests; emits normalised ScanResult JSON
license: MIT
compatibility: Invoked by @verifier in Phase 7
allowed-tools: "Bash Read Write"
version: "1.0"
---

## Purpose

Run [OSV-Scanner](https://github.com/google/osv-scanner) (Apache-2.0) against dependency manifests. Google's OSV database aggregates 20+ ecosystems (npm, PyPI, Cargo, Go, Maven, NuGet, RubyGems, etc.) into a single queryable corpus — catches CVEs that vendor-specific scanners miss, and vice versa.

Runs alongside Trivy (§5.1 `scan-deps-and-containers`) intentionally — different datasets, different coverage. Finding dedup happens in the aggregator, not here.

Emits a `ScanResult` conforming to `schemas/security-gate-result.schema.ts`.

## When to Use

- Phase 7 pre-deployment gate
- After dependency bumps
- Comparison sanity-check against Trivy output

## Prerequisites

- **OSV-Scanner on PATH.** Install: `brew install osv-scanner` or download from releases.

## Process

1. Invoke OSV-Scanner in recursive mode, JSON output:
   ```bash
   osv-scanner --recursive --format json . > _context/audit/security/osv-raw.json || true
   ```
   Non-zero exit on findings; wrapper tolerates.
2. **Normalise** `results[].packages[].vulnerabilities[]` to `FindingSchema`. OSV severity → ladder:
   - OSV uses CVSS v3 severity scores (`database_specific.severity` or `severity[].score`). Convert:
     - CVSS ≥ 9.0 → `critical`
     - 7.0–8.9 → `high`
     - 4.0–6.9 → `medium`
     - 0.1–3.9 → `low`
     - No score → `info`
   - For vulns without CVSS, use OSV's `database_specific.severity` enum (CRITICAL/HIGH/MODERATE/LOW) mapped directly.
3. Compute histogram; write `ScanResult` JSON.
4. Exit `0` on success, `1` on tool failure.

## Output

One `ScanResult` JSON file.

## Failure modes

- **OSV-Scanner not installed** — aborts with install hint.
- **Unsupported manifest types** — OSV-Scanner prints warnings on stderr; wrapper passes them through but doesn't fail.

## Licence

OSV-Scanner is Apache-2.0. Subprocess invocation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial OSV-Scanner wrapper spec — part of Wave 5 Block Y §5.1. CVSS-to-severity-ladder mapping codified. Subprocess adapter deferred pending install. |
