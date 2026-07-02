/**
 * `test-integrity` — PostToolUse(Edit) hook (action plan §4.4).
 *
 * Flags edits that weaken the test suite — removing assertions, deleting tests,
 * or adding skip/only markers — so gaming the gates (make the test pass by
 * gutting it) surfaces as feedback rather than sliding through. Heuristic, not a
 * hard block: it compares the Edit's old_string vs new_string. Only runs on test
 * files. Overridable via COLDPRESS_OVERRIDE="test-integrity:<reason>".
 *
 * WS4 pairs this with regression pinning (every verifier-caught bug adds a
 * pinning test before its fix merges); this hook is the "don't quietly delete a
 * test" half.
 */

import type { HookDecision, HookHandler, HookInput } from "./types.js";

const EXPLAIN = `test-integrity (PostToolUse: Edit)
Flags test-file edits that weaken coverage: fewer assertions, fewer test cases,
or newly added skip/only markers (it.skip, xit, .only, test.skip). Compares the
edit's old vs new text; feeds a warning back so intentional weakening is explicit,
not silent. Heuristic (test files only). Override (logged):
COLDPRESS_OVERRIDE="test-integrity:<reason>".`;

const TEST_FILE = /(\.(test|spec)\.[cm]?[jt]sx?$)|(^|\/)__tests__\//;

/** True when the path looks like a test file. */
export function isTestFile(filePath: string): boolean {
  return TEST_FILE.test(filePath.replace(/\\/g, "/"));
}

const countOf = (s: string, re: RegExp): number => (s.match(re) ?? []).length;

const ASSERTION_RE = /\b(expect|assert|should)\s*\(/g;
const CASE_RE = /\b(it|test)\s*\(/g;
const SKIP_RE = /\b(it|test|describe)\.(skip|only)\b|\bxit\s*\(|\bxdescribe\s*\(/g;

export interface IntegrityFinding {
  weakened: boolean;
  reasons: string[];
}

/** Compare old vs new edit text for weakening signals. Pure — for testing. */
export function assessEdit(oldText: string, newText: string): IntegrityFinding {
  const reasons: string[] = [];
  const assertOld = countOf(oldText, ASSERTION_RE);
  const assertNew = countOf(newText, ASSERTION_RE);
  if (assertNew < assertOld) reasons.push(`assertions dropped ${assertOld}→${assertNew}`);

  const caseOld = countOf(oldText, CASE_RE);
  const caseNew = countOf(newText, CASE_RE);
  if (caseNew < caseOld) reasons.push(`test cases dropped ${caseOld}→${caseNew}`);

  const skipOld = countOf(oldText, SKIP_RE);
  const skipNew = countOf(newText, SKIP_RE);
  if (skipNew > skipOld) reasons.push(`skip/only markers added ${skipOld}→${skipNew}`);

  return { weakened: reasons.length > 0, reasons };
}

export const testIntegrityHandler: HookHandler = {
  name: "test-integrity",
  event: "PostToolUse",
  overrideGate: "test-integrity",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const ti = input.tool_input ?? {};
    const filePath = typeof ti.file_path === "string" ? ti.file_path : "";
    if (!filePath || !isTestFile(filePath)) return { kind: "none" };
    const oldText = typeof ti.old_string === "string" ? ti.old_string : "";
    const newText = typeof ti.new_string === "string" ? ti.new_string : "";
    if (!oldText && !newText) return { kind: "none" };
    const finding = assessEdit(oldText, newText);
    if (!finding.weakened) return { kind: "none" };
    return {
      kind: "deny",
      reason:
        `Test edit to ${filePath} appears to weaken coverage: ${finding.reasons.join("; ")}. ` +
        `If this is intentional (e.g. a genuinely obsolete test), confirm it — do not weaken tests to pass a gate. ` +
        `Override (logged): COLDPRESS_OVERRIDE="test-integrity:<reason>".`,
    };
  },
};
