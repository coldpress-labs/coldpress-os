import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
  },
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  dts: false,
  splitting: false,
  sourcemap: false,
  minify: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Runtime dependencies declared in package.json are resolved from
  // node_modules at runtime — don't bundle them. This also sidesteps
  // CJS-interop dynamic-require failures (e.g. `yaml`'s internal
  // `require("process")`) that would otherwise break under an ESM
  // bundle.
  external: ["@clack/prompts", "commander", "picocolors", "yaml", "zod"],
});
