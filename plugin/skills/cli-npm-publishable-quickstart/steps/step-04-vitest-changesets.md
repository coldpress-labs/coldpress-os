---
step_number: 4
step_name: "Vitest + Changesets + GitHub Actions"
step_goal: "Add testing, release management, and CI/CD pipeline"
halts_for_input: false
next_step: "step-05-verify.md"
---

## Goal

Add Vitest for testing, changesets for release management, and a GitHub Actions workflow for npm publish with provenance.

## Instructions

### Vitest

1. Install Vitest:
   ```bash
   pnpm add -D vitest
   ```

2. Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from "vitest/config";

   export default defineConfig({
     test: {
       globals: true,
     },
   });
   ```

3. Create `src/index.test.ts`:
   ```typescript
   import { describe, expect, it } from "vitest";
   import { hello } from "./index.js";

   describe("hello", () => {
     it("returns greeting", () => {
       expect(hello("world")).toBe("Hello, world!");
     });
   });
   ```

### Changesets

4. Install changesets:
   ```bash
   pnpm add -D @changesets/cli
   pnpm changeset init
   ```

5. Update `.changeset/config.json` — set `"access": "public"` if publishing to public npm registry.

### GitHub Actions — Release Workflow

6. Create `.github/workflows/release.yml`:
   ```yaml
   name: Release
   on:
     push:
       branches:
         - main
   permissions:
     contents: write
     id-token: write

   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
           with: { version: 9 }
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             registry-url: https://registry.npmjs.org
             cache: pnpm
         - run: pnpm install --frozen-lockfile
         - run: pnpm run build
         - run: pnpm test
         - name: Publish to npm
           uses: changesets/action@v1
           with:
             publish: pnpm changeset publish
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
             NPM_CONFIG_PROVENANCE: "true"
   ```

7. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
           with: { version: 9 }
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: pnpm }
         - run: pnpm install --frozen-lockfile
         - run: pnpm run build
         - run: pnpm test
   ```

## Output

- Vitest installed + sample test
- Changesets initialized
- GitHub Actions CI + release workflows
- npm provenance configured in release workflow

## Navigation

→ Next: [step-05-verify.md](step-05-verify.md)
