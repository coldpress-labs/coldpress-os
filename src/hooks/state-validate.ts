/**
 * `state-validate` — PostToolUse(Write|Edit) hook (VP2 O30).
 *
 * `.coldpress/state.yaml` is the routing source of truth, but it was validated
 * ONLY on read (`load-state` at SessionStart). So agent-authored drift — a
 * non-scalar gate-ledger value (an array), or a bespoke top-level key the strict
 * schema rejects — went uncaught until the NEXT session, where `load-state`
 * failed and **routing broke** a whole phase later. This validates state.yaml at
 * WRITE time, feeding the schema errors back in-loop so drift is fixed the moment
 * it's written (one edit) instead of surfacing as a next-session routing failure.
 *
 * Overridable via COLDPRESS_OVERRIDE="state-validate:<reason>".
 */

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { StateSchema } from "../../schemas/state.schema.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const EXPLAIN = `state-validate (PostToolUse: Write|Edit)
Validates .coldpress/state.yaml against the state schema after a write. State is
the routing source of truth; the strict top-level schema + scalar-only gate
ledger mean a stray array or bespoke top-level key is invalid. Catching it at
write time (in-loop) prevents the next session's load-state from failing and
breaking routing. Override (logged): COLDPRESS_OVERRIDE="state-validate:<reason>".`;

/** True when the write targets `.coldpress/state.yaml`. */
export function isStateFile(filePath: string): boolean {
  return filePath.replace(/\\/g, "/").endsWith(".coldpress/state.yaml");
}

export const stateValidateHandler: HookHandler = {
  name: "state-validate",
  event: "PostToolUse",
  overrideGate: "state-validate",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const filePath = typeof input.tool_input?.file_path === "string" ? input.tool_input.file_path : "";
    if (!filePath || !isStateFile(filePath)) return { kind: "none" };

    const cwd = input.cwd ?? process.cwd();
    const abs = isAbsolute(filePath) ? filePath : join(cwd, filePath);
    if (!existsSync(abs)) return { kind: "none" }; // vanished — fail-open

    let parsed: unknown;
    try {
      parsed = parseYaml(readFileSync(abs, "utf8"));
    } catch (e) {
      return {
        kind: "deny",
        reason:
          `.coldpress/state.yaml is not parseable YAML: ${e instanceof Error ? e.message : String(e)}. ` +
          `State is the routing source of truth — fix it before continuing.`,
      };
    }

    const result = StateSchema.safeParse(parsed);
    if (result.success) return { kind: "none" };

    const issues = result.error.issues
      .slice(0, 8)
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    return {
      kind: "deny",
      reason:
        `.coldpress/state.yaml failed schema validation:\n${issues}\n` +
        `State is strict: top-level keys are fixed, and gate-ledger values are scalar ` +
        `(boolean/number/string — no arrays; record completion as an \`exited\` ISO string). ` +
        `Fix it now — invalid state breaks the next session's routing. ` +
        `Override (logged): COLDPRESS_OVERRIDE="state-validate:<reason>".`,
    };
  },
};
