/**
 * Validate a handoff sidecar against the schema declared in the registry.
 *
 * WS11 S4 decision (wire-or-archive): **kept as the typed programmatic API.**
 * It validates a handoff packet against `HANDOFF_SCHEMAS` *by handoff id*; the
 * `schema-validate` hook already covers *path-based* doc/data validation via
 * `validateDocSchema`, so a separate `coldpress validate-handoff` CLI verb would
 * be redundant. Handoff-authoring skills import this directly.
 * Public API:
 *
 *   validateHandoff("prd-to-architecture", sidecar) → ValidationResult
 *
 * ValidationResult carries either the parsed, typed payload or a list of
 * issues suitable for printing at a phase-transition gate.
 */

import { ZodError, type z } from "zod";
import { HANDOFF_SCHEMAS, type HandoffId } from "../../schemas/handoffs/index.js";

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: ValidationIssue[] };

/**
 * Validate a raw sidecar payload against the handoff's schema.
 *
 * Returns `{ ok: true, data }` when the payload conforms, or
 * `{ ok: false, issues }` with a flat list of violations. Never throws on
 * validation failure — the caller decides how to surface the error (CLI
 * message, gate failure, etc).
 */
export function validateHandoff<Id extends HandoffId>(
  id: Id,
  payload: unknown,
): ValidationResult<z.infer<(typeof HANDOFF_SCHEMAS)[Id]>> {
  const schema = HANDOFF_SCHEMAS[id];
  const result = schema.safeParse(payload);

  if (result.success) {
    return { ok: true, data: result.data as z.infer<(typeof HANDOFF_SCHEMAS)[Id]> };
  }

  return { ok: false, issues: flattenZodIssues(result.error) };
}

/**
 * Turn a ZodError into a flat list of `{ path, message }` suitable for
 * rendering at a gate. Includes bracket-accessed array indices so the
 * reader can find the offending element.
 */
function flattenZodIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issueToPath(issue.path),
    message: issue.message,
  }));
}

function issueToPath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return "<root>";
  return path
    .map((segment, i) => {
      if (typeof segment === "number") return `[${segment}]`;
      if (typeof segment === "symbol") return `[symbol]`;
      return i === 0 ? segment : `.${segment}`;
    })
    .join("");
}
