---
step_number: 2
step_name: "Configure tsup Build"
step_goal: "Install tsup and create tsup.config.ts for dual CJS/ESM output"
halts_for_input: false
next_step: "step-03-bin-clack.md"
---

## Goal

Configure tsup as the build tool with CJS + ESM dual output and source maps.

## Instructions

1. Install tsup:
   ```bash
   pnpm add -D tsup
   ```

2. Create `tsup.config.ts`:
   ```typescript
   import { defineConfig } from "tsup";

   export default defineConfig({
     entry: ["src/index.ts", "src/cli.ts"],
     format: ["cjs", "esm"],
     dts: true,
     sourcemap: true,
     clean: true,
     splitting: false,
     treeshake: true,
   });
   ```
   Remove `"src/cli.ts"` from `entry` if library-only.

3. Run a test build:
   ```bash
   pnpm run build
   ```
   Verify `dist/` is created with `.js`, `.cjs`, `.d.ts`, and `.d.cts` files.

## Output

- `tsup.config.ts` created
- `dist/` produced by test build

## Navigation

→ Next: [step-03-bin-clack.md](step-03-bin-clack.md)
