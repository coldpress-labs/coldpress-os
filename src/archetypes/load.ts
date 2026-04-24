/**
 * Project archetype loader (§6.3).
 *
 * Reads + Zod-validates an archetype manifest from
 * `install/archetypes/<name>.yaml`. Pure read; no override application —
 * that's an apply-time concern handled by `coldpress init --archetype`
 * (CLI wiring deferred until init.ts settles per Block FF scope notes).
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  type ArchetypeManifest,
  ArchetypeManifestSchema,
  SHIPPED_ARCHETYPES,
  type ShippedArchetype,
} from "../../schemas/archetype.schema.js";
import { packageRoot } from "../utils/paths.js";

export class ArchetypeNotFoundError extends Error {
  constructor(public readonly slug: string, public readonly path: string) {
    super(
      `Archetype "${slug}" not found at ${path}. Known: ${SHIPPED_ARCHETYPES.join(", ")}.`,
    );
    this.name = "ArchetypeNotFoundError";
  }
}

export class ArchetypeManifestError extends Error {
  constructor(
    public readonly slug: string,
    public readonly path: string,
    public readonly issues: { path: string; message: string }[],
  ) {
    super(
      `Archetype "${slug}" manifest at ${path} failed validation:\n` +
        issues.map((i) => `  - ${i.path || "(root)"}: ${i.message}`).join("\n"),
    );
    this.name = "ArchetypeManifestError";
  }
}

export interface LoadOptions {
  /**
   * Override the archetypes directory (defaults to
   * `<packageRoot>/install/archetypes`). Useful for tests + future
   * project-local archetype overrides.
   */
  archetypesDir?: string;
}

export async function loadArchetype(
  slug: string,
  options: LoadOptions = {},
): Promise<ArchetypeManifest> {
  const dir = options.archetypesDir ?? join(packageRoot, "install/archetypes");
  const path = join(dir, `${slug}.yaml`);

  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ArchetypeNotFoundError(slug, path);
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (err) {
    throw new ArchetypeManifestError(slug, path, [
      { path: "(root)", message: `YAML parse failed: ${(err as Error).message}` },
    ]);
  }

  const result = ArchetypeManifestSchema.safeParse(parsed);
  if (!result.success) {
    throw new ArchetypeManifestError(
      slug,
      path,
      result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    );
  }

  // Cross-check filename against declared id — catches rename slips.
  if (result.data.id !== slug) {
    throw new ArchetypeManifestError(slug, path, [
      {
        path: "id",
        message: `manifest id "${result.data.id}" does not match filename "${slug}.yaml"`,
      },
    ]);
  }

  return result.data;
}

/**
 * Load every shipped archetype + return the array. Used by tests and
 * by future smart-detection / dashboard integrations.
 */
export async function loadShippedArchetypes(
  options: LoadOptions = {},
): Promise<ArchetypeManifest[]> {
  const out: ArchetypeManifest[] = [];
  for (const slug of SHIPPED_ARCHETYPES) {
    out.push(await loadArchetype(slug, options));
  }
  return out;
}

export function isShippedArchetype(slug: string): slug is ShippedArchetype {
  return (SHIPPED_ARCHETYPES as readonly string[]).includes(slug);
}
