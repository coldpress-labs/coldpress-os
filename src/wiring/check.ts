/**
 * Wiring-manifest checker (WS10-G). Walks `data/wiring.yaml` and asserts the
 * cross-phase invariant: every consumed artifact has a producer, every
 * producer/consumer path resolves, and every referenced schema exists.
 *
 * Returns doctor-shaped CheckResult[] so it plugs into `coldpress doctor
 * --wiring` and a standalone `coldpress wiring check`.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { WiringManifestSchema } from "../../schemas/wiring.schema.js";
import { packageRoot } from "../utils/paths.js";
import type { CheckResult } from "../utils/doctor-checks.js";

/** Resolve a repo-relative path and test existence (globs match by their static prefix dir). */
function pathExists(rel: string): boolean {
  // A glob like `_context/.../ST-*.md` is an instance-path pattern, not a repo
  // path — only repo paths (schemas/producers/consumers) are existence-checked.
  const abs = resolve(packageRoot, rel);
  return existsSync(abs);
}

export function checkWiring(manifestPath = join(packageRoot, "data/wiring.yaml")): CheckResult[] {
  const results: CheckResult[] = [];

  let manifest;
  try {
    manifest = WiringManifestSchema.parse(parseYaml(readFileSync(manifestPath, "utf8")));
  } catch (e) {
    return [{ id: "wiring:manifest", label: "wiring.yaml parses + validates", severity: "error", detail: e instanceof Error ? e.message : String(e), remedy: "Fix data/wiring.yaml against schemas/wiring.schema.ts." }];
  }

  for (const a of manifest.artifacts) {
    const label = a.path;

    // 1. Producer — the flagship invariant. null = an explicit, tracked gap.
    if (a.producer === null) {
      results.push({ id: `wiring:producer:${a.path}`, label, severity: "warning", detail: "no producer (explicit known gap)", remedy: `Build a producer for ${a.path} and set it in data/wiring.yaml.` });
    } else if (!pathExists(a.producer)) {
      results.push({ id: `wiring:producer:${a.path}`, label, severity: "error", detail: `producer path does not exist: ${a.producer}`, remedy: `Fix the producer path in data/wiring.yaml, or create ${a.producer}.` });
    }

    // 2. Consumers must all resolve.
    for (const c of a.consumers) {
      if (!pathExists(c)) {
        results.push({ id: `wiring:consumer:${a.path}:${c}`, label, severity: "error", detail: `consumer path does not exist: ${c}`, remedy: `Fix the consumer path in data/wiring.yaml, or create ${c}.` });
      }
    }

    // 3. Declared schema must exist.
    if (a.schema && !pathExists(a.schema)) {
      results.push({ id: `wiring:schema:${a.path}`, label, severity: "error", detail: `schema does not exist: ${a.schema}`, remedy: `Fix the schema path in data/wiring.yaml, or create ${a.schema}.` });
    }
  }

  if (results.length === 0) {
    results.push({ id: "wiring", label: `wiring manifest — ${manifest.artifacts.length} cross-phase artifacts`, severity: "ok", detail: "every artifact has a producer; all producer/consumer/schema paths resolve" });
  }
  return results;
}
