# Security Policy

## Supported versions

coldpress-os is currently **pre-alpha** (v0.x). Only the latest commit on
`main` is supported. Breaking changes can land on any minor version bump
until v1.0. If you're running an older commit, upgrading is the first
recommended step.

| Version | Supported |
|---------|-----------|
| latest `main` | ✅ |
| any prior commit | ❌ — please upgrade first |

---

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**
Public issues are indexed by search engines the moment they are filed and
turn a private report into a zero-day.

Instead, email:

> **team@coldpressai.com**

with the subject line `security: <short description>`. Include:

- A description of the vulnerability
- Steps to reproduce (or a proof-of-concept if safe to share)
- The commit SHA or version you observed it on
- Your assessment of impact (what an attacker could do)
- Whether you'd like credit in the eventual fix

We commit to:

- **Acknowledging your report within 5 business days**
- **Providing an initial assessment within 10 business days**
- **Keeping you informed as we investigate and fix**
- **Crediting you in the release notes of the fix** — unless you prefer
  anonymity

We ask in return that you give us a reasonable window to fix the issue
before disclosing publicly. Responsible disclosure benefits everyone using
coldpress-os.

---

## What is in scope

- Vulnerabilities in coldpress-os's skills, workflows, agents, or
  orchestrator that could compromise user projects consuming the framework
- Supply-chain or integrity issues in coldpress-os itself (tampered
  releases, compromised repository state)
- Unsafe defaults in the `install/` scaffolding that could expose user
  secrets or credentials

## What is out of scope

- Vulnerabilities in the upstream projects coldpress-os derives from
  (BMAD-METHOD, Creative Intelligence Suite, Whiteport Design System) —
  please report those to the respective upstream projects directly.
  See [NOTICE.md](NOTICE.md) for upstream contact points.
- Vulnerabilities in tools and services coldpress-os invokes (Claude Code,
  GitHub, package managers) — report upstream.
- Vulnerabilities specific to your own project code generated *using*
  coldpress-os — coldpress-os is a framework, not a guarantor of the code
  produced within it.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-15 | Alfred | Initial SECURITY.md — private disclosure policy established ahead of public release |
