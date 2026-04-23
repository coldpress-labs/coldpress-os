import { access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { intro, outro, spinner } from "@clack/prompts";
import pc from "picocolors";
import { runInterop } from "../interop/index.js";

export async function runUpdate(): Promise<void> {
  intro(pc.bgCyan(pc.black(" coldpress update ")));

  const targetDir = resolve(process.cwd());

  // Sanity check — must look like a coldpress-os project.
  try {
    await access(join(targetDir, "coldpress.yaml"));
    await access(join(targetDir, ".claude", "agents"));
  } catch {
    outro(
      pc.red("✗ This directory does not look like a coldpress-os project ") +
        pc.dim(`(${targetDir})`) +
        pc.red(". Expected coldpress.yaml and .claude/agents/."),
    );
    process.exit(1);
  }

  const s = spinner();
  s.start("Regenerating interop outputs");
  try {
    const result = await runInterop({ targetDir, respectManagedMarker: true });
    s.stop(`${pc.green("✓")} Regenerated ${result.files.length} files`);

    for (const warning of result.warnings) {
      console.log(pc.yellow(`  ⚠ ${warning}`));
    }
    for (const { path, reason } of result.skipped) {
      console.log(pc.yellow(`  ⚠ Skipped ${path} — ${reason}`));
    }
  } catch (err) {
    s.stop(pc.red(`✗ Update failed: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }

  outro(pc.green("Done."));
}
