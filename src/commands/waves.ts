/**
 * `coldpress waves` (§4.7) — validate the story graph and emit the derived wave
 * plan. Reads `_context/implementation/story-graph.yaml`; on a validation error
 * (cycle / missing contract story / ownership overlap) it prints the errors and
 * exits 1 WITHOUT emitting. On success it writes `docs/generated/waves.yaml`,
 * `schedule.yaml`, and a mermaid render — the plan is a build output, never hand-authored.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { StoryGraphSchema } from "../../schemas/story-graph.schema.js";
import { analyzeWaves, expectedDuration } from "../waves/compute.js";

export interface RunWavesOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export function runWaves(opts: RunWavesOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  const sgPath = join(cwd, "_context/implementation/story-graph.yaml");
  if (!existsSync(sgPath)) {
    warn(`coldpress waves: no story graph at ${sgPath}. Run the story-slice/story-graph skills (Phase 7) first.\n`);
    return 1;
  }
  const parsed = StoryGraphSchema.safeParse(parseYaml(readFileSync(sgPath, "utf8")));
  if (!parsed.success) {
    warn(`coldpress waves: story-graph.yaml failed schema validation:\n`);
    for (const i of parsed.error.issues.slice(0, 10)) warn(`  ${i.path.join(".")}: ${i.message}\n`);
    return 1;
  }
  const sg = parsed.data;
  const analysis = analyzeWaves(sg);

  if (analysis.errors.length > 0) {
    warn(`coldpress waves: ${analysis.errors.length} validation error(s) — not emitting:\n`);
    for (const e of analysis.errors) warn(`  ✗ ${e}\n`);
    return 1;
  }

  const waves = analysis.waves ?? [];
  const durById = new Map(sg.stories.map((s) => [s.id, Number(expectedDuration(s.estimate).toFixed(2))]));

  const wavesDoc = {
    generated_by: "coldpress waves",
    waves: waves.map((stories, i) => ({
      wave: i + 1,
      stories,
      integration_story: `IN-${i + 1}`,
      team_mode: analysis.teamModeWaves?.includes(i + 1) ?? false,
    })),
    critical_path: analysis.criticalPath,
  };

  const scheduleDoc = {
    generated_by: "coldpress waves",
    critical_path_duration: analysis.criticalPath?.duration ?? 0,
    critical_path: analysis.criticalPath?.ids ?? [],
    story_durations: Object.fromEntries(durById),
  };

  const outDir = join(cwd, "docs/generated");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "waves.yaml"), stringifyYaml(wavesDoc), "utf8");
  writeFileSync(join(outDir, "schedule.yaml"), stringifyYaml(scheduleDoc), "utf8");
  writeFileSync(join(outDir, "story-graph.mmd"), renderMermaid(sg, waves), "utf8");

  write(
    `coldpress waves OK — ${waves.length} wave(s), ${sg.stories.length} stories. ` +
      `Critical path: ${analysis.criticalPath?.ids.join(" → ")} (${analysis.criticalPath?.duration.toFixed(2)}). ` +
      `Team-mode waves: ${analysis.teamModeWaves?.join(", ") || "none"}.\n` +
      `Wrote docs/generated/{waves.yaml, schedule.yaml, story-graph.mmd}.\n`,
  );
  return 0;
}

function renderMermaid(sg: Parameters<typeof analyzeWaves>[0], waves: string[][]): string {
  const lines = ["flowchart TD"];
  waves.forEach((wave, i) => {
    lines.push(`  subgraph wave${i + 1}[Wave ${i + 1}]`);
    for (const id of wave) lines.push(`    ${id.replace(/[^A-Za-z0-9_]/g, "_")}["${id}"]`);
    lines.push("  end");
  });
  const arrow: Record<string, string> = { blocks: "-->", interface: "-. iface .->", informs: "-. informs .->" };
  for (const e of sg.edges) {
    lines.push(`  ${e.from.replace(/[^A-Za-z0-9_]/g, "_")} ${arrow[e.type] ?? "-->"} ${e.to.replace(/[^A-Za-z0-9_]/g, "_")}`);
  }
  return lines.join("\n") + "\n";
}
