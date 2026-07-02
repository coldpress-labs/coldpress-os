import { parse as parseYaml } from "yaml";

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  path: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  data: unknown;
}

/** When to validate — init-phase rejects Phase-3+ fields; runtime accepts them. */
export type ValidationPhase = "init" | "runtime";

export interface ValidateOptions {
  phase?: ValidationPhase;
}

export class ColdpressYamlValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(formatIssues(issues));
    this.name = "ColdpressYamlValidationError";
    this.issues = issues;
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CADENCE_VALUES = ["silent", "summary", "verbose"] as const;
const TEAM_SHAPE_VALUES = ["solo", "team", "client-project"] as const;

// Phase-3+ fields. Presence at init = hard error; at runtime = accepted.
const PHASE_3_PLUS_BRANCHES = [
  "project.type",
  "project.domain",
  "project.pattern",
  "stack_pack",
  "agents",
  "sacred_docs",
];

export function validateColdpressYaml(
  source: string,
  opts: ValidateOptions = {},
): ValidationResult {
  const phase: ValidationPhase = opts.phase ?? "runtime";
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  let data: unknown;
  try {
    data = parseYaml(source);
  } catch (err) {
    return {
      valid: false,
      errors: [
        {
          path: "(root)",
          message: `yaml parse failed: ${err instanceof Error ? err.message : String(err)}`,
          severity: "error",
        },
      ],
      warnings: [],
      data: undefined,
    };
  }

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: [
        { path: "(root)", message: "yaml root must be a mapping", severity: "error" },
      ],
      warnings: [],
      data,
    };
  }

  const root = data as Record<string, unknown>;

  // ─── project.* ────────────────────────────────────────────────────
  const project = pickObject(root, "project", errors);
  if (project) {
    requireNonEmptyString(project, "project.name", errors);
    const slug = requireNonEmptyString(project, "project.slug", errors);
    if (slug !== undefined && !SLUG_PATTERN.test(slug)) {
      errors.push({
        path: "project.slug",
        message: `must be kebab-case (letters, digits, hyphens), got ${JSON.stringify(slug)}`,
        severity: "error",
      });
    }
  }

  // ─── user.* ───────────────────────────────────────────────────────
  const user = pickObject(root, "user", errors);
  if (user) {
    requireNonEmptyString(user, "user.name", errors);
    optionalString(user, "user.communication_language", errors);
    optionalString(user, "user.document_output_language", errors);
    optionalEnum(user, "user.cadence", CADENCE_VALUES, errors);
    optionalEnum(user, "user.team_shape", TEAM_SHAPE_VALUES, errors);
    optionalStringArray(user, "user.preferred_ides", errors);
  }

  // ─── butler.* ─────────────────────────────────────────────────────
  const butler = optionalObject(root, "butler", errors);
  if (butler) {
    optionalString(butler, "butler.display_name", errors);
  }

  // ─── retrofit (Wave 2.2) ──────────────────────────────────────────
  if ("retrofit" in root && typeof root.retrofit !== "boolean") {
    errors.push({
      path: "retrofit",
      message: `must be boolean, got ${describeType(root.retrofit)}`,
      severity: "error",
    });
  }

  // ─── Phase-ownership constraint ───────────────────────────────────
  if (phase === "init") {
    for (const branch of PHASE_3_PLUS_BRANCHES) {
      if (hasValue(root, branch)) {
        errors.push({
          path: branch,
          message: `Phase-3+ field present at init — only Phase-1 fields may ship in the template. Remove from coldpress.yaml and let the owning phase write it back.`,
          severity: "error",
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data,
  };
}

/**
 * Throws {@link ColdpressYamlValidationError} if the yaml is invalid.
 * Returns the parsed data on success. Use at boundaries where a clean
 * yaml is required to proceed (init post-write, update pre-edit,
 * intake Step 3 sanity check).
 */
export function assertValidColdpressYaml(
  source: string,
  opts: ValidateOptions = {},
): unknown {
  const result = validateColdpressYaml(source, opts);
  if (!result.valid) {
    throw new ColdpressYamlValidationError(result.errors);
  }
  return result.data;
}

// ── helpers ──────────────────────────────────────────────────────────

function pickObject(
  obj: Record<string, unknown>,
  key: string,
  errors: ValidationIssue[],
): Record<string, unknown> | undefined {
  const value = obj[key];
  if (value === undefined) {
    errors.push({ path: key, message: `required section missing`, severity: "error" });
    return undefined;
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    errors.push({
      path: key,
      message: `must be a mapping, got ${describeType(value)}`,
      severity: "error",
    });
    return undefined;
  }
  return value as Record<string, unknown>;
}

function optionalObject(
  obj: Record<string, unknown>,
  key: string,
  errors: ValidationIssue[],
): Record<string, unknown> | undefined {
  if (!(key in obj)) return undefined;
  const value = obj[key];
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    errors.push({
      path: key,
      message: `must be a mapping when present, got ${describeType(value)}`,
      severity: "error",
    });
    return undefined;
  }
  return value as Record<string, unknown>;
}

function requireNonEmptyString(
  parent: Record<string, unknown>,
  dottedPath: string,
  errors: ValidationIssue[],
): string | undefined {
  const leaf = leafKey(dottedPath);
  const value = parent[leaf];
  if (value === undefined || value === null) {
    errors.push({ path: dottedPath, message: `required field missing`, severity: "error" });
    return undefined;
  }
  if (typeof value !== "string") {
    errors.push({
      path: dottedPath,
      message: `must be a string, got ${describeType(value)}`,
      severity: "error",
    });
    return undefined;
  }
  if (value.trim() === "") {
    errors.push({ path: dottedPath, message: `must be non-empty`, severity: "error" });
    return undefined;
  }
  return value;
}

function optionalString(
  parent: Record<string, unknown>,
  dottedPath: string,
  errors: ValidationIssue[],
): void {
  const leaf = leafKey(dottedPath);
  if (!(leaf in parent)) return;
  const value = parent[leaf];
  if (value === null) return;
  if (typeof value !== "string") {
    errors.push({
      path: dottedPath,
      message: `must be a string when present, got ${describeType(value)}`,
      severity: "error",
    });
  }
}

function optionalEnum<T extends readonly string[]>(
  parent: Record<string, unknown>,
  dottedPath: string,
  allowed: T,
  errors: ValidationIssue[],
): void {
  const leaf = leafKey(dottedPath);
  if (!(leaf in parent)) return;
  const value = parent[leaf];
  if (value === null) return;
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    errors.push({
      path: dottedPath,
      message: `must be one of ${allowed.join("|")}, got ${JSON.stringify(value)}`,
      severity: "error",
    });
  }
}

function optionalStringArray(
  parent: Record<string, unknown>,
  dottedPath: string,
  errors: ValidationIssue[],
): void {
  const leaf = leafKey(dottedPath);
  if (!(leaf in parent)) return;
  const value = parent[leaf];
  if (value === null) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push({
      path: dottedPath,
      message: `must be an array of strings when present`,
      severity: "error",
    });
  }
}

function hasValue(root: Record<string, unknown>, dottedPath: string): boolean {
  const segments = dottedPath.split(".");
  let current: unknown = root;
  for (const seg of segments) {
    if (current === null || typeof current !== "object" || Array.isArray(current)) return false;
    const obj = current as Record<string, unknown>;
    if (!(seg in obj)) return false;
    current = obj[seg];
  }
  return !isEmpty(current);
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value as object).length === 0) return true;
  return false;
}

function leafKey(dottedPath: string): string {
  const idx = dottedPath.lastIndexOf(".");
  return idx === -1 ? dottedPath : dottedPath.slice(idx + 1);
}

function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function formatIssues(issues: ValidationIssue[]): string {
  const lines = issues.map((i) => `  • ${i.path}: ${i.message}`);
  return `coldpress.yaml validation failed:\n${lines.join("\n")}`;
}
