import { readFile } from "node:fs/promises";

/**
 * The Projen-style marker written at the top of every generated output.
 * `coldpress update` treats files bearing this marker as safe to regenerate
 * and refuses to clobber files missing it (which indicates a user edit).
 */
export const MANAGED_MARKER = "@coldpress-os:managed";

/** Comment prefix + marker for markdown-ish files. */
export const MANAGED_HEADER_MD = `# ${MANAGED_MARKER}`;

/** Comment prefix + marker for YAML / config files (also starts with `#`). */
export const MANAGED_HEADER_YAML = `# ${MANAGED_MARKER}`;

/**
 * Check whether an existing file on disk is safe to overwrite. A file is
 * safe if:
 *  - it does not exist (first generation), or
 *  - its first ~10 lines contain the managed marker.
 *
 * Returns `{ safe: true, reason: "new" | "managed" }` or `{ safe: false, reason: "user-owned" }`.
 */
export async function checkManaged(
  path: string,
): Promise<{ safe: true; reason: "new" | "managed" } | { safe: false; reason: "user-owned" }> {
  let content: string;
  try {
    content = await readFile(path, "utf8");
  } catch {
    return { safe: true, reason: "new" };
  }

  const head = content.split("\n", 12).join("\n");
  if (head.includes(MANAGED_MARKER)) return { safe: true, reason: "managed" };
  return { safe: false, reason: "user-owned" };
}
