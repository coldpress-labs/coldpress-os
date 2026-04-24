/**
 * Prefect-style content-addressed task cache for skill invocations
 * (§6.5).
 *
 * Hash inputs (`skill_id` + canonical-JSON-stringified args + a
 * skill-curated `version_marker`); if a cached entry matches, skip
 * re-running and reuse the result. Lives at
 * `.coldpress/cache/skill-results/<hash>.json`.
 *
 * Pure-function `hashInputs(...)`. No singleton instance; caller
 * creates a `SkillResultCache` per project root.
 *
 * The cache is NEVER load-bearing — orchestrators MUST be able to
 * fall back to running the skill if the cache is empty / corrupted /
 * disabled. Treat this as an optimisation, not a contract.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  type SkillCacheEntry,
  SkillCacheEntrySchema,
} from "../../schemas/checkpoint.schema.js";

export interface HashInput {
  skillId: string;
  versionMarker: string;
  args: unknown;
}

/**
 * Deterministic SHA-256 hash of the input triple. Canonical JSON
 * key-sorting ensures `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` hash to
 * the same value.
 */
export function hashInputs(input: HashInput): string {
  const canonical = canonicalJson({
    s: input.skillId,
    v: input.versionMarker,
    a: input.args,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Canonical JSON: sorted object keys at every level, no whitespace.
 * Same value across `JSON.stringify({a,b})` orderings → same hash.
 */
function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        `cache: refusing to canonicalise non-finite number ${String(value)}`,
      );
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return (
      "{" +
      keys
        .map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k]))
        .join(",") +
      "}"
    );
  }
  throw new Error(`cache: unsupported value type ${typeof value}`);
}

export interface CacheLookupOptions {
  projectDir: string;
}

export class SkillResultCache {
  constructor(public readonly projectDir: string) {}

  private pathFor(hash: string): string {
    return join(
      resolve(this.projectDir),
      ".coldpress/cache/skill-results",
      `${hash}.json`,
    );
  }

  /**
   * Look up a cached entry by hash. Returns `null` when the entry is
   * absent OR when the on-disk JSON fails schema validation (treat
   * corrupted cache as a miss; never throw on a hot path).
   */
  async get(hash: string): Promise<SkillCacheEntry | null> {
    const path = this.pathFor(hash);
    try {
      const raw = await readFile(path, "utf8");
      const parsed = SkillCacheEntrySchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  /**
   * Store a cache entry. Atomic write (`tmp + rename`). Returns the
   * persisted entry. Throws on schema-invalid input — the cache must
   * never grow corrupt entries.
   */
  async put(input: {
    hash: string;
    skillId: string;
    versionMarker: string;
    inputs: unknown;
    result: SkillCacheEntry["result"];
    cachedAt?: Date;
  }): Promise<SkillCacheEntry> {
    const path = this.pathFor(input.hash);
    const entry: SkillCacheEntry = {
      schema_version: 1,
      hash: input.hash,
      skill_id: input.skillId,
      version_marker: input.versionMarker,
      cached_at: (input.cachedAt ?? new Date()).toISOString(),
      result: input.result,
      inputs: input.inputs,
    };
    const validated = SkillCacheEntrySchema.parse(entry);
    await mkdir(dirname(path), { recursive: true });
    const tmp = `${path}.tmp`;
    await writeFile(tmp, JSON.stringify(validated, null, 2), "utf8");
    await rename(tmp, path);
    return validated;
  }
}
