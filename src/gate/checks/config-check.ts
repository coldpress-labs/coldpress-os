/**
 * Gate check: config-check
 *
 * Reads a top-level key from a project config file and verifies it is set
 * (optionally equal to an expected value).
 *
 * Which file:
 * - default → `.coldpress/local-config.yaml` (runtime state: phase flags,
 *   `post_phase_*_update_ran`, etc.).
 * - `--file coldpress.yaml` → the project config `coldpress.yaml` (where
 *   phase-owned fields like `stack_pack` / `deploy_pack` / `security_tier`
 *   live). The two config files are distinct; a check must read the one that
 *   actually holds the key, or it reports "not found" on a correctly-set value.
 *   (VP1 O8: the P3 `stack-pack-written-to-yaml` gate declared
 *   `path_pattern: coldpress.yaml` but read local-config.yaml, so it could never
 *   pass. `--file coldpress.yaml` repoints it at the real home of the key.)
 *
 * Options:
 * - `file`: `"coldpress.yaml"` reads the project config; anything else (or unset)
 *   reads `.coldpress/local-config.yaml`.
 * - `allowEmptyString`: if true, an empty string `""` is treated as passing
 *   (used for stack_pack: "" meaning "no pack, generic path").
 * - `expected`: if provided, the key's value must equal this string.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { readLocalConfig } from "../../utils/local-config.js";

export interface ConfigCheckResult {
  ok: boolean;
  message: string;
  actual?: unknown;
}

/** Read a top-level key from `coldpress.yaml`; undefined if missing/unreadable. */
async function readColdpressYamlKey(projectRoot: string, key: string): Promise<unknown> {
  try {
    const source = await readFile(join(projectRoot, "coldpress.yaml"), "utf8");
    const parsed = parseYaml(source) as Record<string, unknown> | null;
    return parsed?.[key];
  } catch {
    return undefined;
  }
}

export async function configCheck(
  projectRoot: string,
  key: string,
  opts: {
    file?: string;
    expected?: string;
    allowEmptyString?: boolean;
  } = {},
): Promise<ConfigCheckResult> {
  const fromColdpressYaml = opts.file === "coldpress.yaml";
  const fileLabel = fromColdpressYaml ? "coldpress.yaml" : ".coldpress/local-config.yaml";
  const actual = fromColdpressYaml
    ? await readColdpressYamlKey(projectRoot, key)
    : (await readLocalConfig(projectRoot))[key as keyof Awaited<ReturnType<typeof readLocalConfig>>];

  if (actual === undefined || actual === null) {
    return {
      ok: false,
      message: `Key "${key}" not found or null in ${fileLabel}.`,
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
