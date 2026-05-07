---
step_number: 3
step_name: "Set Up CLI Entry + CLI Framework"
step_goal: "Pick a CLI framework (clack/commander/yargs) and wire the bin entry"
halts_for_input: true
next_step: "step-04-vitest-changesets.md"
---

## Goal

If this is a CLI tool, pick a CLI framework and update `src/cli.ts` with a real entry point. Skip this step for library-only packages.

## Instructions

1. If library-only (from Step 1): skip to next step.

2. Ask:

**Question:** Which CLI framework would you like to use?
- **(A)** `@clack/prompts` — beautiful interactive prompts, minimal API (recommended for interactive CLIs)
- **(B)** `commander` — classic declarative command parsing, subcommands, options
- **(C)** `yargs` — fluent API, middleware-friendly
- **(D)** None — plain `process.argv` / custom

[Wait for user input]

3. Install the chosen framework:
   - Clack: `pnpm add @clack/prompts`
   - Commander: `pnpm add commander`
   - Yargs: `pnpm add yargs` + `pnpm add -D @types/yargs`

4. Update `src/cli.ts` with a minimal entry point using the chosen framework:

   **Clack example:**
   ```typescript
   #!/usr/bin/env node
   import * as p from "@clack/prompts";

   async function main() {
     p.intro("my-cli");
     const name = await p.text({ message: "What is your name?" });
     if (p.isCancel(name)) { p.cancel("Cancelled"); process.exit(0); }
     p.outro(`Hello, ${name}!`);
   }

   main();
   ```

5. Ensure `src/cli.ts` starts with `#!/usr/bin/env node`.

## Output

- CLI framework installed
- `src/cli.ts` has a working entry point

## Navigation

→ Next: [step-04-vitest-changesets.md](step-04-vitest-changesets.md)
