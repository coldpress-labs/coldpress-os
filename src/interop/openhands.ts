import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Agent } from "./agents.js";
import { MANAGED_HEADER_MD } from "./managed.js";

export interface OpenhandsInput {
  targetDir: string;
  agents: Agent[];
}

/**
 * Emit `.openhands/microagents/<slug>.md` per subagent. OpenHands
 * microagent format: frontmatter with `name`, `type: repo`, and
 * `agent: CodeActAgent`; body is the system prompt.
 */
export async function writeOpenhands({ targetDir, agents }: OpenhandsInput): Promise<string[]> {
  const dir = join(targetDir, ".openhands", "microagents");
  await mkdir(dir, { recursive: true });

  const written: string[] = [];
  for (const agent of agents) {
    const path = join(dir, `${agent.name}.md`);
    await writeFile(path, buildMicroagent(agent), "utf8");
    written.push(path);
  }
  return written;
}

function buildMicroagent(agent: Agent): string {
  const frontmatter = [
    "---",
    `name: ${agent.name}`,
    "type: repo",
    "agent: CodeActAgent",
    "---",
    "",
  ].join("\n");

  const body = [MANAGED_HEADER_MD, "", agent.systemPrompt, ""].join("\n");
  return frontmatter + body;
}
