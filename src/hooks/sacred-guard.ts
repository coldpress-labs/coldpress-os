/**
 * `sacred-guard` — PreToolUse(Edit|Write) hook (action plan §4.4).
 *
 * Closes the plan's central gap: sacred-doc protection was "100% instructional
 * prose an agent may or may not follow." This hook makes it mechanical — a write
 * under `_context/sacred/*` is BLOCKED unless an approved change record targeting
 * that document exists at `_context/audit/sacred-changes/*.yaml` (schema
 * `sacred-change.schema.ts`, produced by the WS1-G `sacred-change` skill).
 *
 * Pre-lock exemption (VP2 O1): the guard protects a doc only once it is *locked*.
 * A write is allowed when the target does not yet exist (first creation — what
 * `intake` step-07 and every sacred-doc-authoring skill must do) or when the
 * on-disk `governance` frontmatter is still `draft`/unset (the doc is being
 * authored, not yet signed off). Protection engages once the on-disk
 * `governance` is `locked` or `requires-review` — set at signoff (intake
 * step-11). Before this fix the guard blocked the *designed* first write of
 * every sacred doc, forcing an override on session one and training consumers to
 * reflexively bypass the one hook that matters most. Note: the guard sees
 * Edit|Write, not deletions — a locked doc `rm`'d then recreated re-enters as a
 * fresh draft; the normal edit path (the threat this hook addresses) is covered.
 *
 * Overridable via COLDPRESS_OVERRIDE="sacred-guard:<reason>" (G11, loudly logged).
 * WS2: on an approved change, also call `trace impact` to attach blast radius and
 * flip impacted stories to re-verify (§4.4) — deferred until `coldpress trace`.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { SacredChangeSchema } from "../../schemas/sacred-change.schema.js";
import { extractFrontmatter } from "../utils/frontmatter.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const SACRED_SEGMENT = "_context/sacred/";
const CHANGE_DIR = "_context/audit/sacred-changes";

/** Governance states that mean "signed off — protected". `draft`/unset = still authoring. */
const LOCKED_GOVERNANCE = new Set(["locked", "requires-review"]);

const EXPLAIN = `sacred-guard (PreToolUse: Edit|Write)
Blocks a write under _context/sacred/* once the doc is LOCKED (on-disk governance
= locked | requires-review) unless an APPROVED change record targets it at
_context/audit/sacred-changes/*.yaml. First creation (file absent) and still-draft
authoring (governance: draft/unset) pass through — that is the designed authoring
path (intake step-07 creates the seed; step-11 signoff sets governance: locked).
This converts sacred-doc governance from prose into enforcement. Produce a change
record with the \`sacred-change\` skill.
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

/**
 * Is the sacred doc at `filePath` LOCKED on disk? Locked = it exists AND its
 * `governance` frontmatter is `locked`/`requires-review`. A non-existent file
 * (first creation) or a `draft`/unset doc is NOT locked — pre-lock authoring is
 * allowed. Unreadable/malformed files are treated as not-locked (fail open for
 * the authoring path; a genuinely locked doc is well-formed by construction).
 */
export function isLockedOnDisk(cwd: string, filePath: string): boolean {
  const abs = isAbsolute(filePath) ? filePath : join(cwd, filePath);
  if (!existsSync(abs)) return false; // creation — nothing to protect yet
  let content: string;
  try {
    content = readFileSync(abs, "utf8");
  } catch {
    return false;
  }
  const governance = extractFrontmatter(content).governance?.trim() ?? "";
  return LOCKED_GOVERNANCE.has(governance);
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
    if (!isLockedOnDisk(cwd, filePath)) {
      return { kind: "none" }; // first creation or still-draft — pre-lock authoring is allowed
    }
    return {
      kind: "deny",
      reason:
        `Blocked: ${filePath} is a LOCKED sacred document (_context/sacred/*). Sacred docs ` +
        `change only through the sacred-change workflow. Create an APPROVED change record ` +
        `at ${CHANGE_DIR}/ (run the \`sacred-change\` skill), then retry. ` +
        `To bypass once (logged): COLDPRESS_OVERRIDE="sacred-guard:<reason>".`,
    };
  },
};
