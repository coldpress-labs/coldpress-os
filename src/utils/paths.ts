import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The root of the `@coldpress/core` package install.
 *
 * Locates the enclosing package directory by walking up from the current
 * file until a `package.json` with `name: "@coldpress/core"` is found.
 * This is robust to how the module is loaded:
 *   - Dev (tsx / vitest): each `.ts` file has its own `import.meta.url`;
 *     the walk finds the repo root.
 *   - Build (tsup bundle → `dist/cli.js`): `import.meta.url` is one level
 *     down; the walk finds the package install.
 *   - Distribution (`node_modules/@coldpress/core/dist/cli.js`): same.
 */
function findPackageRoot(): string {
  let current = dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 20; depth++) {
    const pkgPath = join(current, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "@coldpress/core") return current;
      } catch {
        // Ignore malformed package.json and keep walking.
      }
    }

    const parent = dirname(current);
    if (parent === current) break; // reached filesystem root
    current = parent;
  }

  throw new Error(
    "Could not locate @coldpress/core package root. " +
      "Looked for a package.json with name '@coldpress/core' walking up from " +
      fileURLToPath(import.meta.url),
  );
}

export const packageRoot = findPackageRoot();

export const templateDir = join(packageRoot, "template");

/**
 * Framework directories copied into each consumer project at
 * `<project>/coldpress-os/`. Mirrors the pre-npm git-submodule layout.
 * `plugin/` is the self-contained skill distribution (WS5-C, §8 item 8) —
 * copied into `coldpress-os/plugin/` and enabled via the scaffolded
 * `.claude/settings.json`, replacing init-time wrapper generation.
 */
export const frameworkDirs = [
  "lifecycle",
  "skills",
  "governance",
  "schemas",
  "data",
  "authoring",
  "plugin",
] as const;
// `schemas/` IS vendored (VP2 O22): lifecycle skills + gate.json checks reference
// `schemas/…` file paths (e.g. `schemas/design/design-brief.schema.json`), so the
// consumer scaffold must carry them — otherwise agents can't resolve the schema in
// their own bundle and hand-roll validators / reach into the framework repo. Schemas
// already ship in the npm tarball (package.json `files`), so this is consistent.
// NOTE: `docs/` is NOT copied wholesale (732 KB of framework-internal docs per
// project — WS11 S6). `copyFramework` copies only the CONSUMER_DOCS subset; the
// rest stays on GitHub.

/**
 * Top-level framework files that accompany the framework dirs into the
 * consumer project's `coldpress-os/` folder.
 */
export const frameworkFiles = [
  "coldpress.yaml",
  "LICENSE",
  "NOTICE.md",
  "README.md",
  "REGISTRY.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
] as const;
// NOTE: `CHANGELOG.md` is deliberately NOT copied into consumer projects
// (192 KB of framework release history per project — WS11 S6). It ships in the
// npm package + lives on GitHub.

/**
 * The framework docs worth shipping into each consumer project (WS11 S6). The
 * scaffold's CLAUDE.md/SYSTEM.md reference butler/decision-trees/flow-map/
 * need-info-protocol; the rest are consumer-useful references (governance, the
 * secure pattern, quick-start, troubleshooting, glossary, agent + subagent
 * customization). Everything else in `docs/` stays framework-internal (on GitHub).
 */
export const consumerDocs = [
  "butler.md",
  "decision-trees.md",
  "flow-map.md",
  "need-info-protocol.md",
  "governance.md",
  "secure-pattern.md",
  "quick-start.md",
  "troubleshooting.md",
  "glossary.md",
  "agent-schema.md",
  "subagent-customization.md",
  "phase-gate-protocol.md",
] as const;
