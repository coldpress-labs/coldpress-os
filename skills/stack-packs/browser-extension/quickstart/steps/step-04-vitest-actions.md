---
step_number: 4
step_name: "Vitest + GitHub Actions Release"
step_goal: "Add unit testing and a CI/CD pipeline that produces .zip (Chrome) and .xpi (Firefox)"
halts_for_input: false
next_step: "step-05-verify.md"
---

## Goal

Add Vitest for unit testing and a GitHub Actions release workflow that builds and zips the extension for both Chrome and Firefox.

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
       environment: "jsdom",
     },
   });
   ```

3. Add a sample test `src/utils.test.ts`:
   ```typescript
   import { describe, expect, it } from "vitest";

   describe("placeholder", () => {
     it("true is true", () => {
       expect(true).toBe(true);
     });
   });
   ```

4. Add test script to `package.json` (if not already present):
   ```json
   "scripts": {
     "test": "vitest run"
   }
   ```

### GitHub Actions — Release Workflow

5. Create `.github/workflows/release.yml`:
   ```yaml
   name: Release
   on:
     push:
       tags:
         - "v*"
   permissions:
     contents: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
           with: { version: 9 }
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: pnpm }
         - run: pnpm install --frozen-lockfile
         - run: pnpm test
         - name: Build Chrome
           run: pnpm build --browser chrome
         - name: Build Firefox
           run: pnpm build --browser firefox
         - name: Zip Chrome
           run: pnpm zip --browser chrome
         - name: Zip Firefox
           run: pnpm zip --browser firefox
         - name: Upload artefacts
           uses: actions/upload-artifact@v4
           with:
             name: extension-builds
             path: |
               .output/*.zip
               .output/*.xpi
         - name: Create GitHub Release
           uses: softprops/action-gh-release@v2
           with:
             files: |
               .output/*.zip
               .output/*.xpi
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

6. Create `.github/workflows/ci.yml`:
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
         - run: pnpm test
         - run: pnpm build --browser chrome
         - run: pnpm build --browser firefox
   ```

## Output

- Vitest installed + sample test
- GitHub Actions release workflow producing `.zip` + `.xpi` on version tags
- CI workflow running tests + builds on every push

## Navigation

→ Next: [step-05-verify.md](step-05-verify.md)
