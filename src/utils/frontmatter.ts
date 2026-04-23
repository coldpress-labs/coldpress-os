/**
 * Minimal YAML frontmatter extractor for SKILL.md files.
 *
 * The coldpress-os skill corpus uses a small, well-formed subset of YAML
 * in frontmatter: scalar fields (`name`, `description`, `type`, `version`)
 * and simple arrays. This parser handles only the scalar fields it is
 * asked for; arrays and nested structures are ignored.
 *
 * For anything beyond this minimal extraction, use a real YAML parser.
 */

export type Frontmatter = Record<string, string>;

const FRONTMATTER_BLOCK = /^---\s*\n([\s\S]*?)\n---\s*(\n|$)/;
const SCALAR_LINE = /^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/;

export function extractFrontmatter(content: string): Frontmatter {
  const match = FRONTMATTER_BLOCK.exec(content);
  if (!match) return {};

  const block = match[1] ?? "";
  const fm: Frontmatter = {};

  for (const rawLine of block.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    // Skip list items and continuation lines — scalar-only extraction.
    if (line.startsWith(" ") || line.startsWith("\t") || line.startsWith("-")) {
      continue;
    }

    const m = SCALAR_LINE.exec(line);
    if (!m) continue;

    const key = m[1] ?? "";
    const rawValue = (m[2] ?? "").trim();
    if (!key || rawValue === "" || rawValue === "|" || rawValue === ">") continue;

    fm[key] = unquote(rawValue);
  }

  return fm;
}

function unquote(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}
