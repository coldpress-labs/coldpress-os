/**
 * `sacred-guard` — PreToolUse(Edit|Write) hook (action plan §4.4).
 *
 * Closes the plan's central gap: sacred-doc protection was "100% instructional
 * prose an agent may or may not follow." This hook makes it mechanical — a write
 * under `_context/sacred/*` is BLOCKED unless an approved change record targeting
 * that document exists at `_context/audit/sacred-changes/*.yaml` (schema
 * `sacred-change.schema.ts`, produced by the WS1-G `sacred-change` skill).
 *
 * Overridable via COLDPRESS_OVERRIDE="sacred-guard:<reason>" (G11, loudly logged).
 * WS2: on an approved change, also call `trace impact` to attach blast radius and
 * flip impacted stories to re-verify (§4.4) — deferred until `coldpress trace`.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { SacredChangeSchema } from "../../schemas/sacred-change.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const SACRED_SEGMENT = "_context/sacred/";
const CHANGE_DIR = "_context/audit/sacred-changes";

const EXPLAIN = `sacred-guard (PreToolUse: Edit|Write)
Blocks any write under _context/sacred/* unless an APPROVED change record targeting
that document exists at _context/audit/sacred-changes/*.yaml (status: approved,
target: the doc path). This converts sacred-doc governance from prose into
enforcement — nothing edits a locked sacred doc without going through the change
workflow. Produce a record with the \`sacred-change\` skill.
Override (use sparingly, logged): COLDPRESS_OVERRIDE="sacred-guard:<reason>".`;

/** Normalize both paths to forward slashes for a tolerant suffix match. */
function normalize(p: string): string {
  return p.replace(/\\/g, "/");
}

/** True when `filePath` (abs or rel) targets a doc under _context/sacred/. */
export function isSacredPath(filePath: string): boolean {
  return normalize(filePath).includes(SACRED_SEGMENT);
}

/**
 * Does an approved change record targeting `filePath` exist under `cwd`?
 * Matches on the record's `target` being a suffix of the edited path (tolerant
 * of absolute vs project-relative). Malformed records are skipped, not trusted.
 */
export function hasApprovedChange(cwd: string, filePath: string): boolean {
  const dir = join(cwd, CHANGE_DIR);
  if (!existsSync(dir)) return false;
  const edited = normalize(filePath);
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  } catch {
    return false;
  }
  for (const f of files) {
    let parsed: unknown;
    try {
      parsed = parseYaml(readFileSync(join(dir, f), "utf8"));
    } catch {
      continue;
    }
    const result = SacredChangeSchema.safeParse(parsed);
    if (!result.success) continue;
    const rec = result.data;
    if (rec.status !== "approved") continue;
    const target = normalize(rec.target);
    if (edited === target || edited.endsWith(target) || edited.endsWith(`/${target}`)) {
      return true;
    }
  }
  return false;
}

export const sacredGuardHandler: HookHandler = {
  name: "sacred-guard",
  event: "PreToolUse",
  overrideGate: "sacred-guard",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const filePath = typeof input.tool_input?.file_path === "string" ? input.tool_input.file_path : "";
    if (!filePath || !isSacredPath(filePath)) {
      return { kind: "none" }; // not a sacred write — no opinion
    }
    const cwd = input.cwd ?? process.cwd();
    if (hasApprovedChange(cwd, filePath)) {
      return { kind: "none" }; // authorized by an approved change record
    }
    return {
      kind: "deny",
      reason:
        `Blocked: ${filePath} is a sacred document (_context/sacred/*). Sacred docs ` +
        `change only through the sacred-change workflow. Create an APPROVED change record ` +
        `at ${CHANGE_DIR}/ (run the \`sacred-change\` skill), then retry. ` +
        `To bypass once (logged): COLDPRESS_OVERRIDE="sacred-guard:<reason>".`,
    };
  },
};
