import { parse as parseYaml } from "yaml";

export type ValidationSeverity = "error" | "warning";

export interface LocalConfigIssue {
  path: string;
  message: string;
  severity: ValidationSeverity;
}

export interface LocalConfigValidationResult {
  valid: boolean;
  errors: LocalConfigIssue[];
  warnings: LocalConfigIssue[];
  data: unknown;
}

const PROJECT_SHAPES = ["greenfield", "brownfield", "ambiguous"] as const;

const STACK_LOCK_CHECKPOINTS = [
  "schema-valid",
  "sacred-written",
  "yaml-written",
] as const;

export class LocalConfigValidationError extends Error {
  readonly issues: LocalConfigIssue[];
  constructor(issues: LocalConfigIssue[]) {
    super(formatIssues(issues));
    this.name = "LocalConfigValidationError";
    this.issues = issues;
  }
}

/**
 * Validate the shape of `.coldpress/local-config.yaml`. The schema carries
 * Phase-1 state (resume semantics, graph-rebuild flags) extended in Phase II
 * Part 2 Wave 3 with Phase-3 classification fields (product_type,
 * domain_complexity) and sub_state for granular interrupt/resume.
 */
export function validateLocalConfig(source: string): LocalConfigValidationResult {
  const errors: LocalConfigIssue[] = [];
  const warnings: LocalConfigIssue[] = [];

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

  // Empty file (new project) is valid — caller defaults.
  if (data === null || data === undefined) {
    return { valid: true, errors: [], warnings: [], data: {} };
  }

  if (typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: [
        { path: "(root)", message: "local-config.yaml root must be a mapping", severity: "error" },
      ],
      warnings: [],
      data,
    };
  }

  const root = data as Record<string, unknown>;

  checkBoolean(root, "phase_1_completed", errors);
  checkIsoString(root, "phase_1_completed_at", errors);
  checkBoolean(root, "phase_3_completed", errors);
  checkIsoString(root, "phase_3_completed_at", errors);
  checkIsoString(root, "phase_3_started_at", errors);
  checkBoolean(root, "orient_skipped", errors);
  checkEnum(root, "project_shape", PROJECT_SHAPES, errors);
  checkPartialCompletion(root, errors);
  checkBoolean(root, "post_phase_3_update_ran", errors);
  checkIsoString(root, "post_phase_3_update_ran_at", errors);

  // Phase 3 classification fields (written by stack-discovery-sync Step 2)
  checkString(root, "product_type", errors);
  checkString(root, "domain_complexity", errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: root,
  };
}

export function assertValidLocalConfig(source: string): unknown {
  const result = validateLocalConfig(source);
  if (!result.valid) throw new LocalConfigValidationError(result.errors);
  return result.data;
}

// ── field checkers ───────────────────────────────────────────────────

function checkBoolean(
  root: Record<string, unknown>,
  key: string,
  errors: LocalConfigIssue[],
): void {
  if (!(key in root)) return;
  const value = root[key];
  if (value === null) return;
  if (typeof value !== "boolean") {
    errors.push({
      path: key,
      message: `must be boolean when present, got ${describeType(value)}`,
      severity: "error",
    });
  }
}

function checkString(
  root: Record<string, unknown>,
  key: string,
  errors: LocalConfigIssue[],
): void {
  if (!(key in root)) return;
  const value = root[key];
  if (value === null) return;
  if (typeof value !== "string") {
    errors.push({
      path: key,
      message: `must be a string when present, got ${describeType(value)}`,
      severity: "error",
    });
  }
}

function checkIsoString(
  root: Record<string, unknown>,
  key: string,
  errors: LocalConfigIssue[],
): void {
  if (!(key in root)) return;
  const value = root[key];
  if (value === null) return;
  if (typeof value !== "string") {
    errors.push({
      path: key,
      message: `must be an ISO-8601 timestamp string, got ${describeType(value)}`,
      severity: "error",
    });
    return;
  }
  // Permissive: accept anything Date.parse can handle. Full RFC 3339 check
  // would reject valid YAML dates serialised without 'T' — more pain than
  // signal at v1.
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    errors.push({
      path: key,
      message: `not parseable as a timestamp: ${JSON.stringify(value)}`,
      severity: "error",
    });
  }
}

function checkEnum<T extends readonly string[]>(
  root: Record<string, unknown>,
  key: string,
  allowed: T,
  errors: LocalConfigIssue[],
): void {
  if (!(key in root)) return;
  const value = root[key];
  if (value === null) return;
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    errors.push({
      path: key,
      message: `must be one of ${allowed.join("|")}, got ${JSON.stringify(value)}`,
      severity: "error",
    });
  }
}

/**
 * Validate `partial_completion` including optional `phase` and `sub_state`.
 *
 * sub_state variants (Phase 3 — R3-7, R4-8, R4-9):
 *   decision_area: string        — stack-evaluation loop position
 *   category_index: number       — baselines-confirmation loop position
 *   env_provision_category: string — env-provision baselines-activation loop position
 *   stack_lock_checkpoint: enum  — sacred-lock sub-step checkpoint
 *
 * At most one sub_state key should be present at a time; validation warns if
 * more than one is set (ambiguous resume hint).
 */
function checkPartialCompletion(
  root: Record<string, unknown>,
  errors: LocalConfigIssue[],
): void {
  if (!("partial_completion" in root)) return;
  const value = root.partial_completion;
  if (value === null) return;

  if (typeof value !== "object" || Array.isArray(value)) {
    errors.push({
      path: "partial_completion",
      message: `must be a mapping or null, got ${describeType(value)}`,
      severity: "error",
    });
    return;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.step_id !== "string" || obj.step_id.trim() === "") {
    errors.push({
      path: "partial_completion.step_id",
      message: "required non-empty string",
      severity: "error",
    });
  }
  if (typeof obj.at !== "string" || Number.isNaN(Date.parse(obj.at as string))) {
    errors.push({
      path: "partial_completion.at",
      message: "required ISO-8601 timestamp",
      severity: "error",
    });
  }

  // Optional `phase` field — must be a positive integer if present
  if ("phase" in obj && obj.phase !== null) {
    if (typeof obj.phase !== "number" || !Number.isInteger(obj.phase) || obj.phase < 1) {
      errors.push({
        path: "partial_completion.phase",
        message: "must be a positive integer when present",
        severity: "error",
      });
    }
  }

  // Optional `sub_state` — one of 4 mutually-exclusive variants
  if ("sub_state" in obj && obj.sub_state !== null) {
    const ss = obj.sub_state;
    if (typeof ss !== "object" || Array.isArray(ss)) {
      errors.push({
        path: "partial_completion.sub_state",
        message: `must be a mapping or null, got ${describeType(ss)}`,
        severity: "error",
      });
      return;
    }

    const sub = ss as Record<string, unknown>;
    const setKeys = (
      ["decision_area", "category_index", "env_provision_category", "stack_lock_checkpoint"] as const
    ).filter((k) => k in sub && sub[k] !== null && sub[k] !== undefined);

    if (setKeys.length > 1) {
      errors.push({
        path: "partial_completion.sub_state",
        message: `ambiguous: more than one sub_state key set (${setKeys.join(", ")}) — only one expected`,
        severity: "error",
      });
    }

    if ("decision_area" in sub && sub.decision_area !== null) {
      if (typeof sub.decision_area !== "string" || (sub.decision_area as string).trim() === "") {
        errors.push({
          path: "partial_completion.sub_state.decision_area",
          message: "must be a non-empty string",
          severity: "error",
        });
      }
    }

    if ("category_index" in sub && sub.category_index !== null) {
      const ci = sub.category_index;
      if (typeof ci !== "number" || !Number.isInteger(ci) || (ci as number) < 0) {
        errors.push({
          path: "partial_completion.sub_state.category_index",
          message: "must be a non-negative integer",
          severity: "error",
        });
      }
    }

    if ("env_provision_category" in sub && sub.env_provision_category !== null) {
      if (
        typeof sub.env_provision_category !== "string" ||
        (sub.env_provision_category as string).trim() === ""
      ) {
        errors.push({
          path: "partial_completion.sub_state.env_provision_category",
          message: "must be a non-empty string",
          severity: "error",
        });
      }
    }

    if ("stack_lock_checkpoint" in sub && sub.stack_lock_checkpoint !== null) {
      const allowed = STACK_LOCK_CHECKPOINTS as readonly string[];
      if (
        typeof sub.stack_lock_checkpoint !== "string" ||
        !allowed.includes(sub.stack_lock_checkpoint as string)
      ) {
        errors.push({
          path: "partial_completion.sub_state.stack_lock_checkpoint",
          message: `must be one of ${STACK_LOCK_CHECKPOINTS.join("|")}, got ${JSON.stringify(sub.stack_lock_checkpoint)}`,
          severity: "error",
        });
      }
    }
  }
}

function describeType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function formatIssues(issues: LocalConfigIssue[]): string {
  const lines = issues.map((i) => `  • ${i.path}: ${i.message}`);
  return `local-config.yaml validation failed:\n${lines.join("\n")}`;
}
