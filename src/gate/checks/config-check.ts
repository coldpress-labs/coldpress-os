/**
 * Gate check: config-check
 *
 * Reads a key from `.coldpress/local-config.yaml` and verifies it matches
 * an expected value.
 *
 * Options:
 * - `allowEmptyString`: if true, an empty string `""` is treated as passing
 *   (used for stack_pack: "" meaning "no pack, generic path").
 * - `expected`: if provided, the key's value must equal this string.
 */

import { readLocalConfig } from "../../utils/local-config.js";

export interface ConfigCheckResult {
  ok: boolean;
  message: string;
  actual?: unknown;
}

export async function configCheck(
  projectRoot: string,
  key: string,
  opts: {
    expected?: string;
    allowEmptyString?: boolean;
  } = {},
): Promise<ConfigCheckResult> {
  const config = await readLocalConfig(projectRoot);
  const actual = config[key as keyof typeof config];

  if (actual === undefined || actual === null) {
    return {
      ok: false,
      message: `Key "${key}" not found or null in .coldpress/local-config.yaml.`,
      actual,
    };
  }

  if (opts.allowEmptyString && actual === "") {
    return {
      ok: true,
      message: `Key "${key}" is empty string (explicit empty-string allowed).`,
      actual,
    };
  }

  if (opts.expected !== undefined) {
    const matches = String(actual) === opts.expected;
    return {
      ok: matches,
      message: matches
        ? `Key "${key}" = "${actual}" (expected "${opts.expected}").`
        : `Key "${key}" = "${actual}" but expected "${opts.expected}".`,
      actual,
    };
  }

  // No expected — just presence check
  return {
    ok: true,
    message: `Key "${key}" is set (value: "${actual}").`,
    actual,
  };
}
