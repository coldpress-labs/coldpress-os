---
name: "dep-health-check"
description: "Audit project dependencies for vulnerabilities, outdated packages, and health issues"
type: "simple"
category: "ops"
phases: [7]
inputs:
  - "package.json or equivalent manifest"
  - "lock file (package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb)"
outputs:
  - artifact: "Dependency Health Report"
    location: "_output/ops/dep-health-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Performs a comprehensive audit of project dependencies, checking for known vulnerabilities, outdated packages, unused dependencies, license compliance issues, and bundle size impact.

## When to Use

- "check dependencies"
- "run dep health check"
- "audit packages"
- Before deployment or release
- Periodically as part of maintenance

## Prerequisites

- Project must have a package manager manifest (`package.json`, `Cargo.toml`, `requirements.txt`, etc.)
- Lock file should exist for accurate vulnerability scanning

## Process

1. **Detect package manager and lock file.** Identify: npm, yarn, pnpm, bun, cargo, pip, or other.

2. **Vulnerability scan.** Run the appropriate audit command and categorize findings:
   - **Critical** — Active exploits, RCE, data exposure
   - **High** — Privilege escalation, injection vectors
   - **Medium** — DoS potential, information disclosure
   - **Low** — Theoretical risks, minor issues

3. **Outdated package check.** Identify packages behind:
   - Major versions (breaking changes likely)
   - Minor versions (new features available)
   - Patch versions (bug fixes available)

4. **Unused dependency detection.** Scan source code for import/require statements and cross-reference against declared dependencies. Flag deps that appear unused.

5. **License compliance check.** Flag dependencies with:
   - GPL/AGPL licenses (viral copyleft — may affect your project's license)
   - Unknown or missing licenses
   - License incompatibilities with your project's license

6. **Dependency size impact.** Identify the top 10 largest dependencies by install size. Flag any that seem disproportionately large for their purpose.

7. **Generate report** with all findings organized by category and severity.

8. **Present findings and recommendations.** Never auto-upgrade — present options for user decision.

**Critical rule:** Never run `npm audit fix` or equivalent auto-upgrade commands. Report only.

## Output

A dependency health report with vulnerability findings, outdated packages, unused deps, license issues, and size analysis.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from dep-health-check, adapted to coldpress-os schema |
