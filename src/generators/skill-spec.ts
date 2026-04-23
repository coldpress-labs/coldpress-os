/**
 * Agent Skills spec frontmatter (Anthropic, September 2025,
 * https://agentskills.io/specification).
 *
 * Required: name, description.
 * Recommended: license, compatibility, allowed-tools, version.
 *
 * Field constraints (per plan §2.10):
 *   - name: lowercase + hyphens only, 64-char max, matches parent dir
 *   - description: 1024-char max, "WHAT + WHEN" format
 *   - allowed-tools: space-separated (experimental per spec status)
 */

export interface SpecFrontmatter {
  name: string;
  description: string;
  license: string;
  compatibility?: string;
  "allowed-tools"?: string;
  version?: string;
}

export const SKILL_NAME_RE = /^[a-z][a-z0-9-]*$/;
export const MAX_NAME_LEN = 64;
export const MAX_DESCRIPTION_LEN = 1024;
export const MAX_BODY_LINES = 500;

export interface RichFrontmatter {
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  phase?: number | string;
  phases?: (number | string)[];
  agent?: string;
  version?: string;
  tools?: string[];
}

export interface ValidationIssue {
  /** fatal for emission */
  severity: "error" | "warning";
  code: string;
  message: string;
}

export function validateName(name: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!name) {
    issues.push({ severity: "error", code: "name-empty", message: "name is required" });
    return issues;
  }
  if (name.length > MAX_NAME_LEN) {
    issues.push({
      severity: "error",
      code: "name-too-long",
      message: `name exceeds ${MAX_NAME_LEN} characters (got ${name.length})`,
    });
  }
  if (!SKILL_NAME_RE.test(name)) {
    issues.push({
      severity: "error",
      code: "name-format",
      message: `name must match /${SKILL_NAME_RE.source}/ (lowercase + hyphens only)`,
    });
  }
  return issues;
}

export function validateDescription(description: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!description) {
    issues.push({ severity: "error", code: "description-empty", message: "description is required" });
    return issues;
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    issues.push({
      severity: "error",
      code: "description-too-long",
      message: `description exceeds ${MAX_DESCRIPTION_LEN} characters (got ${description.length})`,
    });
  }
  return issues;
}

export function validateBody(body: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lineCount = body.split("\n").length;
  if (lineCount > MAX_BODY_LINES) {
    issues.push({
      severity: "warning",
      code: "body-too-long",
      message: `body is ${lineCount} lines (>${MAX_BODY_LINES}) — consider moving detail to references/`,
    });
  }
  return issues;
}

/**
 * Build the compatibility prose line from the rich frontmatter's
 * `agent` + `phase`/`phases` fields. Returns an empty string when
 * the rich frontmatter has no phase/agent context (non-lifecycle skill).
 */
export function buildCompatibility(rich: RichFrontmatter): string {
  const agent = rich.agent ? `@${rich.agent}` : undefined;
  const phase = rich.phase ?? rich.phases?.[0];

  if (agent && phase !== undefined) {
    return `Invoked by ${agent} in Phase ${phase}`;
  }
  if (agent) return `Invoked by ${agent}`;
  if (phase !== undefined) return `Phase ${phase}`;
  return "Reusable across phases";
}

/**
 * Transform our rich internal frontmatter into the Agent Skills spec shape.
 * Does not perform I/O — pure conversion.
 */
export function toSpecFrontmatter(rich: RichFrontmatter): SpecFrontmatter {
  const spec: SpecFrontmatter = {
    name: rich.name ?? "",
    description: rich.description ?? "",
    license: "MIT",
    compatibility: buildCompatibility(rich),
  };
  if (rich.tools && rich.tools.length) {
    spec["allowed-tools"] = rich.tools.join(" ");
  }
  if (rich.version) spec.version = rich.version;
  return spec;
}

/**
 * Emit spec frontmatter as a YAML block `---\n<key: value>\n---\n`.
 * Deterministic field order matches the spec examples.
 */
export function renderSpecFrontmatter(spec: SpecFrontmatter): string {
  const lines: string[] = ["---"];
  lines.push(`name: ${spec.name}`);
  lines.push(`description: ${quoteIfNeeded(spec.description)}`);
  lines.push(`license: ${spec.license}`);
  if (spec.compatibility) {
    lines.push(`compatibility: ${quoteIfNeeded(spec.compatibility)}`);
  }
  if (spec["allowed-tools"]) {
    lines.push(`allowed-tools: "${spec["allowed-tools"]}"`);
  }
  if (spec.version) {
    lines.push(`version: "${spec.version}"`);
  }
  lines.push("---");
  return lines.join("\n");
}

function quoteIfNeeded(value: string): string {
  // Minimal YAML-safe quoting: if value contains quotes, colons, or
  // leading/trailing whitespace, wrap in double quotes with escaping.
  if (/[":\n]/.test(value) || /^\s|\s$/.test(value)) {
    return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  return value;
}
