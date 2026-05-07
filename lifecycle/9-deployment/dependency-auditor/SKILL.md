---
name: "dependency-auditor"
description: "Deep dependency audit beyond dep-health-check: CVE matching against NVD/OSV/GitHub Advisory Database; supply-chain risk scoring (typosquat / abandoned / suspicious-maintainer); license-compatibility check; transitive-dep risk surfacing. Emits 0–100 health score per dep + remediation priority list."
type: "workflow"
category: "lifecycle"
phase: 9
agent: "devops"
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "TechStackLock node (declared deps)"
  cold_file_reads:
    - "package.json"
    - "package-lock.json"
    - "pyproject.toml or requirements.txt (if Python project)"
    - "_context/sacred/tech-stack.md"
    - "_context/sacred/architecture.md (NFR security section)"
  existence_checks:
    - "package.json or pyproject.toml or Cargo.toml (one of)"
    - "lock file present (npm shrinkwrap / package-lock / poetry.lock / Cargo.lock)"
outputs:
  - artifact: "Dependency audit report"
    location: "_context/audit/dep-audit-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Per-dep health scores"
    location: "_context/audit/dep-health-scores-v{N}.json"
    format: "json"
    sacred: false
  - artifact: "Remediation priority list"
    location: "_context/audit/dep-remediation-v{N}.md"
    format: "markdown"
    sacred: false
---

## Purpose

The existing `dep-health-check` skill verifies dependencies are reachable + version-pinned + not deprecated. This skill goes deeper: **CVE matching** against NVD / OSV / GitHub Advisory DB; **supply-chain risk** (typosquat patterns, abandoned packages, single-maintainer / suspicious-maintainer flags, recent ownership transfer); **license compatibility** (re-checks against `coldpress-os` MIT requirement; flags GPL/AGPL transitive); **transitive-dep risk** (a low-risk direct dep that pulls in a high-risk transitive).

Emits a 0–100 health score per dep + a prioritised remediation list. Does NOT auto-fix (security-critical change must be human-approved).

## When to Use (Proactive Triggers)

1. Phase 9 pre-deploy — runs after `dep-health-check`, before `deploy`
2. Quarterly cron — supply-chain risks evolve; re-audit even when deps haven't changed
3. Post-CVE disclosure — fast re-audit when a major CVE drops (Heartbleed-class events)
4. New dep added to package.json — single-dep audit before merge
5. License-policy review — when estate licensing changes (e.g., considering AGPL ban tightening)

## Output Artifacts

1. **Dep audit report** at `_context/audit/dep-audit-v{N}.md` — executive summary + categorised findings (CVE / supply-chain / license / transitive)
2. **Per-dep health scores** at `_context/audit/dep-health-scores-v{N}.json` — array of `{name, version, score, breakdown: {cve, supply_chain, license, maintenance}, recommendation}`
3. **Remediation priority list** at `_context/audit/dep-remediation-v{N}.md` — ranked actions: upgrade-to-X, replace-with-Y, remove (vulnerable + unused), accept-risk (with rationale)
4. **License-violation flag** — surfaces any GPL/AGPL transitive deps as block-severity for MIT-licensed coldpress-os

## Prerequisites

- Lock file present (transitive resolution requires deterministic dep tree)
- Network access to OSV / NVD / GitHub Advisory APIs (skill is offline-graceful but degraded)
- For language-specific checks: appropriate manifest (`package.json`, `pyproject.toml`, `Cargo.toml`)

## Process

→ See [workflow.md](workflow.md) for full process.

1. **Step 1 — Resolve full dep tree** from lock file (transitive included)
2. **Step 2 — CVE match** each dep+version against OSV.dev API (most comprehensive cross-ecosystem); fall back to NVD for npm + GitHub Advisory for project-specific
3. **Step 3 — Supply-chain heuristics** per dep:
   - Typosquat detection (Levenshtein ≤2 from popular packages)
   - Abandoned (no commits in N months; configurable, default 18)
   - Single-maintainer with ownership transfer < 90 days ago
   - Recent unpublishes / republishes (suspicious activity)
4. **Step 4 — License audit** — extract `license` field per dep; cross-reference against `coldpress-os` MIT compatibility (allow: MIT/Apache-2.0/BSD/CC0/ISC/0BSD; warn: LGPL; block: GPL/AGPL)
5. **Step 5 — Score per dep** (0-100):
   - CVE: -10 per Critical, -5 per High, -2 per Medium (capped at -50)
   - Supply-chain: -15 if typosquat; -10 if abandoned; -10 if suspicious-maintainer
   - License: -25 if blocked; -10 if warn; 0 if compatible
   - Maintenance: -5 per missing-required-field; -5 per >12mo since last release
   - Cap minimum at 0
6. **Step 6 — Build remediation list** ranked by score ascending (lowest score first, since worst-risk first to fix)
7. **Step 7 — Emit reports**; cross-reference dep-health-check (this skill complements, doesn't replace)

## Activation-Gate Checklist

- [ ] Full transitive dep tree resolved (no missing-from-lock)
- [ ] CVE match attempted for every dep (degraded if offline; logged)
- [ ] Supply-chain heuristics run on every dep
- [ ] License check covers transitive deps
- [ ] Health score computed per dep with breakdown
- [ ] Remediation list ranked by severity
- [ ] License-block findings raised as Phase 9 deploy-gate BLOCKERS

## Output

Three reports in `_context/audit/`. License-block findings BLOCK Phase 9 deploy. CVE Critical/High → block (configurable in `coldpress.yaml` baselines.security). Health scores feed into Phase 11 retrospective if patterns emerge (e.g., chronic supply-chain weakness in a tech-stack choice).

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `dependency-auditor` skill. Implementation original to coldpress-os; complements existing `lifecycle/9-deployment/dep-health-check/` skill (lighter, presence-only).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U09) | Initial dependency-auditor skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). Complements existing dep-health-check; deeper CVE+supply-chain+license analysis. |
