# Promotion Flow — sandbox → live

> Rules governing what promotes from the development `sandbox/` tree to the production `live/` tree. Applicable to Pattern A (Three-Tier) projects. Terminology matches `sacred-docs.md` §6 (`sandbox/` → `live/`).

---

## 1. Principle

The `sandbox/` tree contains everything: planning, orchestration, framework, AND application code. The `live/` tree contains ONLY validated, production-ready application code and config.

**Planning and orchestration never ship with the product.**

---

## 2. What Promotes

These directories and files are eligible for promotion from `sandbox/` to `live/`:

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

1. **Validate in `sandbox/`** — All tests pass, code review complete, story accepted
2. **Copy promotable files** — Only files from the "What Promotes" list, into `live/`
3. **Install dependencies** — `npm install` in the `live/` tree
4. **Verify build** — The `live/` tree builds and runs in production mode
5. **Commit in `live/`** — With reference to the `sandbox/` commit/story
6. **Deploy** — From the `live/` tree per deployment pipeline

---

## 5. Credentials

| Location | Purpose | Committed? |
|----------|---------|-----------|
| `{project-root}/accounts-and-keys.md` | Master credential reference | Never (local root) |
| `sandbox/.env.local` | Development credentials | Never (gitignored) |
| `live/.env.local` | Production credentials | Never (gitignored) |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-07-02 | Butler | Terminology aligned to `sacred-docs.md` §6: `devSandbox → App` replaced with `sandbox/ → live/` throughout (title, principle, promotion lists, process, credentials table). Resolves the drift flagged in the v0.4 overhaul audit (§2.2). Content/rules unchanged — only tier naming. Part of WS0 §8 item 13. |
| 1.0 | 2026-04-07 | Alfred | Initial promotion flow — from SYSTEM.md Pattern A rules |
