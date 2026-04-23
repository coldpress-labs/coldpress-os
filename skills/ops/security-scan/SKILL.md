---
name: "security-scan"
description: "Run OWASP-informed security analysis on the project codebase"
type: "simple"
category: "ops"
phases: [7]
inputs:
  - "project source code"
  - "_context/sacred/architecture.md"
  - "_context/sacred/tech-stack.md"
outputs:
  - artifact: "Security Scan Report"
    location: "_context/audit/security-scan-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Performs a deep security analysis covering the OWASP Top 10, authentication/authorization flows, data exposure risks, input validation, and web hardening checks. Analysis only — does not apply fixes.

## When to Use

- "run security scan"
- "check security"
- "OWASP review"
- Before deployment to production
- After implementing auth or data-handling features
- As part of periodic security review

## Prerequisites

- Project codebase must be accessible
- `_context/sacred/architecture.md` and `_context/sacred/tech-stack.md` recommended for context
- Scope can be: full project, specific epic, story, or file list

## Process

1. **Determine scope and stack.** Identify:
   - Frontend framework (React, Next.js, Vue, etc.)
   - Auth provider (Clerk, Auth0, custom, etc.)
   - Database layer (Convex, Prisma, Supabase, etc.)
   - Hosting platform (Vercel, AWS, etc.)

2. **OWASP Top 10 review.** Check each category:
   - **A01: Broken Access Control** — Missing auth checks, IDOR, privilege escalation
   - **A02: Cryptographic Failures** — Weak hashing, missing encryption, exposed keys
   - **A03: Injection** — SQL/NoSQL injection, XSS, command injection
   - **A04: Insecure Design** — Missing rate limiting, no abuse prevention
   - **A05: Security Misconfiguration** — Default configs, verbose errors, open CORS
   - **A06: Vulnerable Components** — Known CVEs in dependencies
   - **A07: Auth Failures** — Weak passwords, missing MFA, session issues
   - **A08: Data Integrity** — Unsigned updates, CI/CD vulnerabilities
   - **A09: Logging/Monitoring** — Missing audit trails, no alerting
   - **A10: SSRF** — Unvalidated URLs, internal service exposure

3. **Authentication & authorization flow review.** Trace the complete auth flow from login to API access to session management.

4. **Data exposure audit.** Check:
   - Client-side bundle for leaked secrets or sensitive data
   - API responses for over-fetching (returning more data than needed)
   - Logging for PII or credential leakage

5. **Input validation review.** Check:
   - Type, length, and format validation on all user inputs
   - Sanitization of HTML/script content
   - File upload restrictions and validation

6. **Web hardening check.** Verify:
   - Content Security Policy (CSP) headers
   - X-Frame-Options / X-Content-Type-Options
   - HSTS configuration
   - Cookie security flags (HttpOnly, Secure, SameSite)

7. **Generate report** with findings by severity and OWASP category.

8. **Present findings with remediation guidance.** Each finding includes severity, evidence, and specific fix recommendation.

**Critical rule:** Analysis only. Never apply fixes. Present findings for user decision.

## Output

A comprehensive security scan report organized by OWASP category with severity ratings and remediation guidance.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from security-scan, adapted to coldpress-os schema |
