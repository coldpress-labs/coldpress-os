---
name: env-check
description: Validate environment variables, .env file sync, and secrets safety
license: MIT
compatibility: Phase 7
version: "1.0"
---

## Purpose

Validates that environment variables are properly documented, `.env.example` stays in sync with code references, naming conventions are followed, and no secrets are committed to the repository.

## When to Use

- "check env variables"
- "run env check"
- "validate environment"
- Before deployment to catch missing or mismatched env vars
- After adding new environment variables to the codebase

## Prerequisites

- Project must have at least one `.env.example` or `.env` file, or code referencing `process.env` / `import.meta.env`

## Process

1. **Detect environment file structure.** Find all env-related files: `.env`, `.env.example`, `.env.local`, `.env.development`, `.env.production`, `.env.test`

2. **Extract all env var references from source code.** Scan for `process.env.`, `import.meta.env.`, `Deno.env.get()`, and framework-specific patterns (e.g., `NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_`).

3. **Compare code references against `.env.example`.** Identify:
   - Vars referenced in code but missing from `.env.example`
   - Vars in `.env.example` but never referenced in code (stale)
   - Vars with mismatched names or typos

4. **Naming convention check.** Validate:
   - All vars use `UPPER_SNAKE_CASE`
   - Public-prefix vars match framework conventions (`NEXT_PUBLIC_`, `VITE_`)
   - No vars use reserved prefixes incorrectly

5. **Secrets-in-code detection.** Scan source files for:
   - Hardcoded API keys (patterns: `sk-`, `pk_`, `api_key = "..."`)
   - Hardcoded passwords or tokens
   - Private keys or certificates inline
   - `.env` files tracked by git (check `.gitignore`)

6. **Platform-specific validation.** Based on detected platform:
   - **Vercel:** Check `vercel.json` env config
   - **Convex:** Check `convex/` env patterns
   - **Docker:** Check `docker-compose.yml` env declarations
   - **CI/CD:** Check workflow files for secret references

7. **Generate report** with findings organized by severity.

8. **Present findings and recommendations** to user.

**Critical rule:** NEVER read actual values from `.env` files — only examine `.env.example` and code references.

## Output

An environment check report with sync status, naming violations, security findings, and platform-specific recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from env-check, adapted to coldpress-os schema |
