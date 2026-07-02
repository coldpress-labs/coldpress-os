---
step_number: 3
step_name: "Configure Tooling + Baselines"
step_goal: "Part A: core tooling (lint, format, hooks, env, editor). Part B: activate confirmed baselines from coldpress.yaml."
halts_for_input: false
next_step: "step-04-verify.md"
---

## Goal

Two-part configuration step. Part A wires up core development tooling. Part B activates each baseline category that was confirmed at Phase 3 stack-locking.

---

## Part A — Core Tooling

### A1. Linting

Configure ESLint (or equivalent for the locked stack):
- Create config file (`eslint.config.js` or `.eslintrc.json`)
- Apply rules matching the project's language (TS strict mode if TypeScript)
- Add `lint` script to `package.json`

### A2. Formatting

Configure Prettier (or equivalent):
- Create `.prettierrc` with project settings
- Add `format` and `format:check` scripts to `package.json`
- Confirm no lint/format rule conflicts (use `eslint-config-prettier` if both are active)

### A3. Git Hooks

Set up pre-commit hooks via Husky + lint-staged (or pack-specified equivalent):
- `pnpm add -D husky lint-staged`
- `npx husky init`
- Configure `.husky/pre-commit` to run lint-staged
- Configure `lint-staged` in `package.json` for staged `.ts/.tsx/.js/.jsx` files

### A4. Environment Variables

Create `.env.template`:
- List every required environment variable with a comment explaining its purpose
- Add `.env` and `.env.local` to `.gitignore`
- Do NOT commit real secrets

### A5. Editor Config

Create `.vscode/settings.json` (or `.editorconfig` if VS Code is not the specified editor):
- Format on save
- Default formatter matching the configured formatter
- Tab size and indent style per project convention

---

## Part B — Baselines Activation Loop

Read `coldpress.yaml baselines:`. For each of the 4 categories, check `status`:

- `opted-out`: skip — no actions fire. Log skip to env-provision tracking.
- `confirmed` or `confirmed-with-override`: apply the category's `env_provision_actions` from `data/standards/baselines.yaml`. Apply overrides from `coldpress.yaml baselines.{category}.overrides` if present.

Process categories in this order: `seo_aeo_llm` → `accessibility` → `security` → `future_proof`.

Write `sub_state.env_provision_category: "{category}"` to `.coldpress/local-config.yaml` on entry to each category; clear on completion (allows resume mid-loop).

---

### B1. seo_aeo_llm

If confirmed:
1. Install framework-appropriate sitemap plugin (e.g., `@astrojs/sitemap`, `next-sitemap`, or `vite-plugin-sitemap`)
2. Generate `public/llms.txt` starter from template — fields: project name, description, key URLs
3. Wire OG/Twitter metadata helper into the layout component (framework-dependent starter snippet)
4. Add structured-data JSON-LD starter to `<head>` (type: WebSite or SoftwareApplication per product_type)
5. Verify `robots.txt` exists; create default if missing

Check overrides: `llms_txt_template`, `jsonld_type`, `og_site_name`.

---

### B2. accessibility

If confirmed:
1. `pnpm add -D axe-core eslint-plugin-jsx-a11y @axe-core/playwright`
2. Enable jsx-a11y rules in ESLint config (add `plugin:jsx-a11y/recommended` or equivalent)
3. Create `.lighthouserc.json` or `.lighthouserc.js` with:
   ```json
   { "ci": { "assert": { "assertions": { "categories:accessibility": ["error", {"minScore": 0.9}] } } } }
   ```
4. Add axe-core import to test setup file for runtime checks

Check overrides: `a11y_min_score` (default: 0.9).

---

### B3. security

If confirmed:
1. Write `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
   ```
2. Add `npm audit --audit-level=high` (or pnpm equivalent) as a CI check step
3. Configure pre-commit scan-secrets hook: add `detect-secrets` or `gitleaks` to `.husky/pre-commit` (tool per user's installed security toolchain; prompt if neither is installed)
4. Confirm `.gitignore` covers common secret patterns (`.env`, `*.pem`, `*.key`)

Check overrides: `audit_level` (default: `high`), `secrets_scanner` (default: `detect-secrets`).

---

### B4. future_proof

If confirmed:
1. Set `"strict": true` in `tsconfig.json` (create if missing)
2. Set `"target"` in `tsconfig.json` to override value or default `ES2022`
3. Extend `.lighthouserc.json` with Core Web Vitals thresholds:
   ```json
   {
     "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
     "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
     "interaction-to-next-paint": ["error", {"maxNumericValue": 200}]
   }
   ```
4. Add `lighthouse-ci` to CI workflow (create stub `.github/workflows/lighthouse.yml` if GHA is the locked CI)

Check overrides: `lcp_max_ms` (default: 2500), `cls_max` (default: 0.1), `inp_max_ms` (default: 200), `es_target` (default: `ES2022`).

---

### Skipped categories

For each `opted-out` category, append a row to `_context/tracking/env-provision-{date}.md`:

```
| {category} | opted-out | — |
```

---

## Output

Core tooling configured; baselines activated (confirmed categories only). `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-verify.md](step-04-verify.md)
