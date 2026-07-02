---
step_number: 5
step_name: "Verify"
step_goal: "Confirm build, tests, and pack all pass"
halts_for_input: false
next_step: null
---

## Goal

Confirm the project builds, tests pass, and the package is ready to publish with the correct files.

## Instructions

1. Run the build:
   ```bash
   pnpm run build
   ```
   Expected: `dist/` is created with `.js`, `.cjs`, `.d.ts`, and `.d.cts` files. Exit code 0.

2. Run the tests:
   ```bash
   pnpm test
   ```
   Expected: Vitest runs and all tests pass. Exit code 0.

3. Dry-run the pack:
   ```bash
   npm pack --dry-run
   ```
   Expected output includes:
   - `dist/index.js`
   - `dist/index.cjs`
   - `dist/index.d.ts`
   - `dist/index.d.cts`
   - `dist/cli.js` (if CLI)
   - `README.md`

   If any `src/` files appear in the tarball, check the `files` field in `package.json`.

4. Verify the `exports` map resolves correctly:
   ```bash
   node -e "import('@your-package/name').then(m => console.log(Object.keys(m)))"
   node -e "const m = require('./dist/index.cjs'); console.log(Object.keys(m))"
   ```
   Replace `@your-package/name` with your actual package name.

5. If CLI, verify the bin entry works:
   ```bash
   node dist/cli.js
   ```
   Expected: your CLI entry point runs without error.

6. Check `package.json` one final time:
   - `"version"` is `"0.1.0"` (or your intended initial version)
   - `"files"` includes `"dist"` and `"README.md"`
   - `"main"` points to `"./dist/index.cjs"`
   - `"module"` points to `"./dist/index.js"`
   - `"exports"` has both `import` and `require` conditions
   - `"bin"` is present (if CLI) and points to `"./dist/cli.js"`

## Completion Criteria

- `pnpm run build` exits 0 — `dist/` produced with CJS + ESM + `.d.ts` outputs
- `pnpm test` exits 0 — Vitest passes
- `npm pack --dry-run` exits 0 — tarball includes `dist/` and `README.md`, no stray `src/`
- `.changeset/` initialized
- `.github/workflows/release.yml` present with npm provenance configured

## Navigation

Setup complete. Push to GitHub and add `NPM_TOKEN` to repository secrets to activate the release workflow.
