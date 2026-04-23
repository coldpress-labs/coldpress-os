import { join } from "node:path";
import pc from "picocolors";
import { parseAgentsDir } from "./agents.js";
import { writeAgentsMd } from "./agents-md.js";
import { writeCline } from "./cline.js";
import { writeCursor } from "./cursor.js";
import { checkManaged } from "./managed.js";
import { writeOpenhands } from "./openhands.js";
import { writeRoomodes } from "./roomodes.js";
import { unmappedClaudeTools } from "./tool-map.js";

export interface InteropResult {
  files: string[];
  warnings: string[];
  skipped: { path: string; reason: string }[];
}

export interface InteropOptions {
  targetDir: string;
  /** If true, refuse to overwrite user-owned files (those missing the managed marker). Default: true. */
  respectManagedMarker?: boolean;
}

/**
 * Generate all interop outputs for a consumer project. Reads
 * `<target>/.claude/agents/*.md` as the source of truth and emits:
 *  - AGENTS.md
 *  - .cursor/rules/<slug>.mdc + legacy .cursorrules
 *  - .roomodes
 *  - .openhands/microagents/<slug>.md
 *  - .clinerules/00-project-context.md + 10-sacred-docs.md
 */
export async function runInterop({
  targetDir,
  respectManagedMarker = true,
}: InteropOptions): Promise<InteropResult> {
  const agentsDir = join(targetDir, ".claude", "agents");
  const agents = await parseAgentsDir(agentsDir);

  const files: string[] = [];
  const warnings: string[] = [];
  const skipped: { path: string; reason: string }[] = [];

  if (agents.length === 0) {
    warnings.push(`No agents found under ${agentsDir} — no interop outputs generated.`);
    return { files, warnings, skipped };
  }

  // Surface tool-mapping gaps so users know coverage isn't perfect.
  for (const agent of agents) {
    const unmapped = unmappedClaudeTools(agent.tools);
    if (unmapped.length > 0) {
      warnings.push(
        `Agent ${pc.cyan(agent.name)}: no Roo group mapping for ${unmapped.join(", ")} — dropped from .roomodes.`,
      );
    }
  }

  const primaryPaths = [
    join(targetDir, "AGENTS.md"),
    join(targetDir, ".roomodes"),
    join(targetDir, ".cursorrules"),
  ];
  if (respectManagedMarker) {
    for (const path of primaryPaths) {
      const status = await checkManaged(path);
      if (!status.safe) {
        skipped.push({ path, reason: "user-owned (missing @coldpress-os:managed marker)" });
      }
    }
  }

  // Run writers, skipping anything flagged as user-owned.
  const skippedSet = new Set(skipped.map((s) => s.path));

  if (!skippedSet.has(join(targetDir, "AGENTS.md"))) {
    files.push(await writeAgentsMd({ targetDir, agents }));
  }
  if (!skippedSet.has(join(targetDir, ".roomodes"))) {
    files.push(await writeRoomodes({ targetDir, agents }));
  }
  // .cursor/rules and .openhands/microagents and .clinerules are per-file
  // dirs — user-edit protection for those subtrees is too aggressive for
  // v1 (would skip a whole dir on one edit). Overwrite wholesale for now;
  // revisit per-file checks if demand surfaces.
  files.push(...(await writeCursor({ targetDir, agents })));
  files.push(...(await writeOpenhands({ targetDir, agents })));
  files.push(...(await writeCline({ targetDir })));

  return { files, warnings, skipped };
}
