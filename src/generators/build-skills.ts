/**
 * Build the spec-compliant plugin/ tree from source SKILL.md files.
 *
 * Usage:
 *   npm run build:skills
 *
 * Reads SKILL.md files from <repo>/skills and <repo>/lifecycle, transforms
 * to Agent Skills spec, writes to <repo>/plugin/skills/<name>/SKILL.md.
 */

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generatePluginSkills } from "./skill-md-generator.js";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = dirname(dirname(dirname(__filename))); // src/generators/build-skills.ts → repo/

const outputDir = join(repoRoot, "plugin", "skills");
const manifestPath = join(repoRoot, "plugin", "plugin.json");

console.log(`> Generating plugin/ from ${repoRoot}`);
console.log(`  output: ${outputDir}`);
console.log();

const result = await generatePluginSkills({
  packageRoot: repoRoot,
  outputDir,
  skipRouters: true,
});

// Group issues by severity for a clean report.
const errors = result.issues.filter((x) => x.issue.severity === "error");
const warnings = result.issues.filter((x) => x.issue.severity === "warning");

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} errors:`);
  for (const { source, issue } of errors) {
    console.error(`  [${issue.code}] ${source}: ${issue.message}`);
  }
}

if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} warnings:`);
  for (const { source, issue } of warnings) {
    console.log(`  [${issue.code}] ${source}: ${issue.message}`);
  }
}

if (result.skipped.length > 0) {
  console.log(`\n· ${result.skipped.length} skipped:`);
  const byReason = new Map<string, number>();
  for (const { reason } of result.skipped) {
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
  }
  for (const [reason, count] of byReason) {
    console.log(`  ${reason}: ${count}`);
  }
}

console.log(`\n✓ Emitted ${result.emitted.length} spec-compliant SKILL.md files`);

// Refresh plugin.json with the current skill count. We deliberately do NOT
// stamp a `generated_at` timestamp — the build output must be deterministic
// from the source corpus so CI's `git diff --exit-code plugin/` drift check
// stays meaningful. (If the count changes, diff catches it. If only a
// timestamp changes, diff catches nothing useful.)
const manifest = await readManifest(manifestPath);
delete manifest.generated_at;
manifest.skills_count = result.emitted.length;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`✓ Refreshed ${manifestPath}`);

if (errors.length > 0) {
  process.exit(1);
}

async function readManifest(path: string): Promise<Record<string, unknown>> {
  try {
    const { readFile } = await import("node:fs/promises");
    return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}
