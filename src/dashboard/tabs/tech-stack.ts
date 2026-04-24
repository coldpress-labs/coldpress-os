/**
 * Tech-stack tab — render `_context/sacred/tech-stack.md` frontmatter
 * as a card view. Body content is intentionally NOT rendered (large
 * markdown belongs in an editor, not the dashboard).
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { TechStackData } from "../types.js";

export async function assembleTechStack(
  projectDir: string,
): Promise<TechStackData> {
  const path = join(projectDir, "_context/sacred/tech-stack.md");
  try {
    const raw = await readFile(path, "utf8");
    const fm = extractFrontmatter(raw);
    return {
      present: true,
      path,
      frontmatter: fm,
    };
  } catch {
    return {
      present: false,
      path,
      frontmatter: null,
    };
  }
}

function extractFrontmatter(raw: string): Record<string, unknown> | null {
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return null;
  try {
    const parsed = parseYaml(raw.slice(3, end).trim());
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}
