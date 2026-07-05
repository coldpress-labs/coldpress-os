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
  "data",
  "authoring",
  "docs",
  "plugin",
] as const;

/**
 * Top-level framework files that accompany the framework dirs into the
 * consumer project's `coldpress-os/` folder.
 */
export const frameworkFiles = [
  "coldpress.yaml",
  "LICENSE",
  "NOTICE.md",
  "README.md",
  "CHANGELOG.md",
  "REGISTRY.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
] as const;
