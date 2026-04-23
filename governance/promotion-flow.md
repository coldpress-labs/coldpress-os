# Promotion Flow — devSandbox → App

> Rules governing what promotes from the development sandbox to the production app repository. Applicable to Pattern A (Three-Tier) projects.

---

## 1. Principle

The devSandbox contains everything: planning, orchestration, framework, AND application code. The app repo contains ONLY validated, production-ready application code and config.

**Planning and orchestration never ship with the product.**

---

## 2. What Promotes

These directories and files are eligible for promotion from devSandbox to app:

### Application Code
- `app/`, `src/`
- `components/`
- `convex/` (or equivalent backend)
- `hooks/`, `lib/`, `utils/`
- `emails/`, `prompts/`
- `public/`
- `middleware.ts`

### Configuration
- `package.json`, `package-lock.json`
- `tsconfig.json`, `tailwind.config.*`
- `next.config.*`, `vite.config.*` (or equivalent)
- `postcss.config.*`
- `.github/workflows/`

### Documentation (public-facing only)
- `README.md` (if public-facing)
- `LICENSE`

---

## 3. What NEVER Promotes

| Category | Paths | Why |
|----------|-------|-----|
| Framework | `coldpress-os/` | Read-only submodule, dev-only |
| Orchestration | `.claude/` | Agent config, dev-only |
| Planning artifacts | `_context/` | Internal planning docs |
| Project docs | `docs/` | Internal context, specs |
| Project config | `coldpress.yaml` | Framework config, dev-only |
| Dev credentials | `.env.local` | Environment-specific |
| OS artifacts | `.DS_Store` | System files |

---

## 4. Promotion Process

1. **Validate in sandbox** — All tests pass, code review complete, story accepted
2. **Copy promotable files** — Only files from the "What Promotes" list
3. **Install dependencies** — `npm install` in app repo
4. **Verify build** — App builds and runs in production mode
5. **Commit in app** — With reference to the sandbox commit/story
6. **Deploy** — From app repo per deployment pipeline

---

## 5. Credentials

| Location | Purpose | Committed? |
|----------|---------|-----------|
| `{project-root}/accounts-and-keys.md` | Master credential reference | Never (local root) |
| `devSandbox/.env.local` | Development credentials | Never (gitignored) |
| `app/.env.local` | Production credentials | Never (gitignored) |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial promotion flow — from SYSTEM.md Pattern A rules |
