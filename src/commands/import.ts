/**
 * `coldpress import bmad <src-module-dir>` — the BMAD-import bridge
 * CLI entry (§5.3). Thin wrapper around `importBmadModule` in
 * `src/imports/bmad.ts`.
 */

import { resolve } from "node:path";
import pc from "picocolors";
import { importBmadModule } from "../imports/bmad.js";

export const IMPORT_EXIT_OK = 0;
export const IMPORT_EXIT_ERROR = 1;

export interface ImportBmadOptions {
  sourceDir: string;
  projectDir?: string;
  moduleSlug?: string;
  overwrite?: boolean;
}

export async function runImportBmad(
  options: ImportBmadOptions,
): Promise<number> {
  const sourceDir = resolve(options.sourceDir);
  const targetDir = resolve(options.projectDir ?? process.cwd());

  try {
    const report = await importBmadModule({
      sourceDir,
      targetDir,
      moduleSlug: options.moduleSlug,
      overwrite: options.overwrite,
    });

    console.log(pc.bgMagenta(pc.black(" bmad import ")), pc.dim(`module: ${report.moduleSlug}`));
    if (report.moduleName) console.log(`  name:    ${report.moduleName}`);
    if (report.moduleVersion) console.log(`  version: ${report.moduleVersion}`);
    console.log();
    console.log(pc.green(`  ✓ agents imported:    ${report.agents.length}`));
    console.log(pc.green(`  ✓ workflows imported: ${report.skills.length}`));
    console.log(pc.green(`  ✓ templates imported: ${report.templates.length}`));
    if (report.dropped.length > 0) {
      console.log(pc.yellow(`  ! dropped:            ${report.dropped.length}`));
      for (const d of report.dropped.slice(0, 10)) {
        console.log(pc.yellow(`    - ${d.path} (${d.reason})`));
      }
      if (report.dropped.length > 10) {
        console.log(pc.dim(`    … ${report.dropped.length - 10} more (see ATTRIBUTION.md)`));
      }
    }
    console.log();
    console.log(pc.dim(`  attribution: ${report.attributionPath}`));
    console.log();
    console.log(
      pc.yellow(
        "  This is a lossy translation. Review the ATTRIBUTION.md checklist before relying on imports.",
      ),
    );

    return IMPORT_EXIT_OK;
  } catch (err) {
    console.error(
      pc.red(
        `bmad import failed: ${err instanceof Error ? err.message : String(err)}`,
      ),
    );
    return IMPORT_EXIT_ERROR;
  }
}
