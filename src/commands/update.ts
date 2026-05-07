import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { updateLocalConfig } from "../utils/local-config.js";
import { intro, outro, spinner } from "@clack/prompts";
import pc from "picocolors";
import { runInterop } from "../interop/index.js";
import { generateStackPackWrappers } from "../utils/wrappers.js";
import {
  ColdpressYamlValidationError,
  assertValidColdpressYaml,
} from "../utils/yaml-validator.js";
import { runDoctor } from "./doctor.js";

export interface UpdateOptions {
  /**
   * Post-Phase-3 mode: after stack-lock, regenerate stack-pack-specific
   * skill wrappers and run `doctor --stack` to verify stack tools.
   */
  postPhase3?: boolean;
  /**
   * Post-Phase-4 mode: after PRD lock, re-prime the graph so Phase 5/6
   * skills start with fresh context. Writes `post_phase_4_update_ran: true`
   * to local-config.yaml.
   */
  postPhase4?: boolean;
}

export async function runUpdate(opts: UpdateOptions = {}): Promise<void> {
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

  // Pre-edit validation — refuse to regenerate from a malformed yaml.
  let yamlSource: string;
  try {
    yamlSource = await readFile(join(targetDir, "coldpress.yaml"), "utf8");
    assertValidColdpressYaml(yamlSource, { phase: "runtime" });
  } catch (err) {
    if (err instanceof ColdpressYamlValidationError) {
      outro(pc.red(err.message));
      process.exit(1);
    }
    throw err;
  }

  if (opts.postPhase3) {
    await runPostPhase3({ targetDir, yamlSource });
    return;
  }

  if (opts.postPhase4) {
    await runPostPhase4({ targetDir, yamlSource });
    return;
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

async function runPostPhase3({
  targetDir,
  yamlSource,
}: {
  targetDir: string;
  yamlSource: string;
}): Promise<void> {
  const stackPack = readStackPackFromYaml(yamlSource);
  if (!stackPack) {
    outro(
      pc.red(
        "✗ --post-phase-3 requires `stack_pack` to be set in coldpress.yaml (Phase 3 stack-lock writes it).",
      ),
    );
    process.exit(1);
  }

  console.log(pc.dim(`  ↳ stack_pack: ${stackPack}`));

  const s = spinner();
  s.start(`Generating skill wrappers for stack pack "${stackPack}"`);
  try {
    const count = await generateStackPackWrappers(targetDir, stackPack);
    if (count === 0) {
      s.stop(
        pc.yellow(
          `⚠ No skills found under coldpress-os/skills/stack-packs/${stackPack}/`,
        ),
      );
    } else {
      s.stop(`${pc.green("✓")} Generated ${count} stack-pack wrapper(s)`);
    }
  } catch (err) {
    s.stop(
      pc.red(`✗ Wrapper regen failed: ${err instanceof Error ? err.message : String(err)}`),
    );
    process.exit(1);
  }

  // Run doctor --stack so the user knows whether stack tools are installed.
  console.log(pc.dim(""));
  const doctor = await runDoctor({ stack: true, projectRoot: targetDir });
  if (doctor.exitCode === 1) {
    outro(
      pc.red(
        "✗ Stack tools missing — resolve the errors above and re-run `coldpress update --post-phase-3`.",
      ),
    );
    process.exit(1);
  }

  // Write flag so Butler can detect completion on next turn.
  await updateLocalConfig(targetDir, {
    post_phase_3_update_ran: true,
    post_phase_3_update_ran_at: new Date().toISOString(),
  });

  outro(pc.green("Post-Phase-3 update complete."));
}

async function runPostPhase4({
  targetDir,
  yamlSource,
}: {
  targetDir: string;
  yamlSource: string;
}): Promise<void> {
  // Verify Phase 4 is marked complete.
  const phase4Complete = /^\s*phase_4_completed\s*:\s*true/m.test(yamlSource);
  if (!phase4Complete) {
    outro(
      pc.red(
        "✗ --post-phase-4 requires `phase_4_completed: true` in coldpress.yaml. Complete Phase 4 PRD lock first.",
      ),
    );
    process.exit(1);
  }

  const s = spinner();
  s.start("Re-priming graph after Phase 4 PRD lock");
  try {
    // Re-run interop to rebuild graph with new PRD artefacts included.
    const result = await runInterop({ targetDir, respectManagedMarker: true });
    s.stop(`${pc.green("✓")} Graph re-primed — ${result.files.length} files regenerated`);

    for (const warning of result.warnings) {
      console.log(pc.yellow(`  ⚠ ${warning}`));
    }
  } catch (err) {
    s.stop(
      pc.red(`✗ Graph re-prime failed: ${err instanceof Error ? err.message : String(err)}`),
    );
    process.exit(1);
  }

  // Write flag so Butler can detect completion on next turn.
  await updateLocalConfig(targetDir, {
    post_phase_4_update_ran: true,
    post_phase_4_update_ran_at: new Date().toISOString(),
  });

  outro(pc.green("Post-Phase-4 update complete. Graph is primed for Phase 5 Design."));
}

function readStackPackFromYaml(yamlSource: string): string | undefined {
  const match = /^\s*stack_pack\s*:\s*["']?([\w-]+)["']?/m.exec(yamlSource);
  if (!match || !match[1] || match[1] === "") return undefined;
  return match[1];
}
