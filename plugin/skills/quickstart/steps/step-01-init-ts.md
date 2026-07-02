---
step_number: 1
step_name: "Initialize TypeScript Project"
step_goal: "Create package.json with correct fields for an npm-publishable package"
halts_for_input: true
next_step: "step-02-tsup.md"
---

## Goal

Set up `package.json` with the correct structure for a dual-mode (CJS + ESM) npm package.

## Instructions

1. Ask:

**Question:** Is this primarily a CLI tool, a library, or both?
- **(A)** CLI tool only (has a `bin` entry; no programmatic API)
- **(B)** Library only (programmatic API; no `bin`)
- **(C)** Both (CLI + programmatic API)

[Wait for user input]

2. Initialize with pnpm:
   ```bash
   pnpm init
   ```

3. Update `package.json` with the correct fields:
   ```json
   {
     "name": "<package-name-from-coldpress.yaml>",
     "version": "0.1.0",
     "type": "module",
     "main": "./dist/index.cjs",
     "module": "./dist/index.js",
     "exports": {
       ".": {
         "import": "./dist/index.js",
         "require": "./dist/index.cjs"
       }
     },
     "bin": {
       "<cli-name>": "./dist/cli.js"
     },
     "files": ["dist", "README.md"],
     "engines": { "node": ">=20" },
     "scripts": {
       "build": "tsup",
       "test": "vitest run",
       "test:watch": "vitest"
     }
   }
   ```
   Remove `bin` field if library-only (Option B).

4. Install TypeScript and base types:
   ```bash
   pnpm add -D typescript @types/node
   ```

5. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "strict": true,
       "outDir": "dist",
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     },
     "include": ["src"]
   }
   ```

6. Create `src/index.ts` (entry point) and `src/cli.ts` (if CLI):
   ```typescript
   // src/index.ts
   export const hello = (name: string): string => `Hello, ${name}!`;
   ```
   ```typescript
   // src/cli.ts
   #!/usr/bin/env node
   import { hello } from "./index.js";
   console.log(hello("world"));
   ```

## Output

- `package.json` with correct dual-mode fields
- `tsconfig.json` with `strict: true`
- `src/index.ts` and `src/cli.ts` entry points

## Navigation

→ Next: [step-02-tsup.md](step-02-tsup.md)
