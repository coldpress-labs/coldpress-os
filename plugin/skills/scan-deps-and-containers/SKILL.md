---
name: scan-deps-and-containers
description: Run Trivy against dependency manifests + container images; emits normalised ScanResult JSON
license: MIT
compatibility: Invoked by @qa in Phase 7
version: "1.0"
---

## Purpose

Run [Trivy](https://github.com/aquasecurity/trivy) (Apache-2.0) in `fs` (filesystem) mode against the project root to scan dependency manifests for known CVEs + misconfigurations. When the project has a container context (`Dockerfile` present, or user supplies an image tag), also scan the image layers.

Trivy overlaps with OSV-Scanner (§5.1 `scan-vulns`) but covers a broader signal: CVE DB + misconfiguration + license findings + container layers. The overlap is intentional — two independent datasets catch different gaps.

Emits a `ScanResult` conforming to `schemas/security-gate-result.schema.ts`.

## When to Use

- Phase 7 pre-deployment gate
- After dependency bumps (any manifest change)
- After Dockerfile changes

## Prerequisites

- **Trivy on PATH.** Install: `brew install trivy` or `curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh`.
- **First run downloads the vulnerability DB** (~500MB). Subsequent runs use the cache.

## Process

1. Invoke Trivy in filesystem mode, JSON output:
   ```bash
   trivy fs --format json --severity CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN --quiet . > _context/audit/security/trivy-raw.json
   ```
2. If a Dockerfile or user-supplied image tag is present, also:
   ```bash
   trivy image --format json --quiet <image> >> <second output file>
   ```
   Merge both result sets into a single `ScanResult`.
3. **Normalise** each `Results[].Vulnerabilities[]` (+ `.Misconfigurations[]` if present) to `FindingSchema`. Severity mapping:
   - `CRITICAL` → `critical`
   - `HIGH` → `high`
   - `MEDIUM` → `medium`
   - `LOW` → `low`
   - `UNKNOWN` → `info`
4. Compute histogram; write `ScanResult` JSON.
5. Exit `0` on success, `1` on Trivy tool failure.

## Output

One `ScanResult` JSON file covering both filesystem-level deps and (optionally) container layers.

## Failure modes

- **Trivy not installed** — aborts with install hint.
- **Vulnerability DB fetch fails (offline)** — Trivy retries from cache; wrapper surfaces as `status: "error"` if cache is missing.
- **No manifests found** — emits `status: "success"` with zero findings. Not an error.

## Licence

Trivy is Apache-2.0. Subprocess invocation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Trivy wrapper spec — part of Wave 5 Block Y §5.1. Covers fs + container scanning. Overlap with OSV-Scanner intentional. Subprocess adapter deferred pending Trivy install. |
