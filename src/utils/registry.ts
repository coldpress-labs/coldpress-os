/**
 * Local project registry — `~/.coldpress/registry.json`.
 *
 * A courtesy cache created on first `coldpress init` and appended to on
 * subsequent inits. Enables future `coldpress projects list` (v0.3) and
 * gives Butler a way to discover sibling projects from the machine level.
 *
 * Opt-out: set `COLDPRESS_NO_REGISTRY=1` in the environment to skip all
 * registry writes. Reads are always safe — the registry is append-only
 * and opt-out simply keeps an absent or stale file in place.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_REGISTRY_DIR = join(homedir(), ".coldpress");
export const DEFAULT_REGISTRY_PATH = join(DEFAULT_REGISTRY_DIR, "registry.json");
export const OPT_OUT_ENV = "COLDPRESS_NO_REGISTRY";

export interface RegistryEntry {
  /** kebab-case slug */
  slug: string;
  /** absolute path to the scaffolded project directory */
  path: string;
  /** ISO-8601 timestamp */
  created: string;
  /** `@coldpress/core` version at the time of `init` */
  version: string;
}

export interface Registry {
  version: 1;
  projects: RegistryEntry[];
}

const emptyRegistry = (): Registry => ({ version: 1, projects: [] });

export interface RegistryOptions {
  /** override path for tests / opt-outs. Defaults to `~/.coldpress/registry.json`. */
  registryPath?: string;
}

export async function readRegistry(options: RegistryOptions = {}): Promise<Registry> {
  const path = options.registryPath ?? DEFAULT_REGISTRY_PATH;
  try {
    const content = await readFile(path, "utf8");
    const parsed: unknown = JSON.parse(content);
    if (isValidRegistry(parsed)) return parsed;
    // Malformed but JSON-parseable — treat as empty rather than clobbering.
    return emptyRegistry();
  } catch {
    return emptyRegistry();
  }
}

export type RecordInitResult = "recorded" | "opted-out" | "failed";

export async function recordInit(
  entry: RegistryEntry,
  options: RegistryOptions = {},
): Promise<RecordInitResult> {
  if (process.env[OPT_OUT_ENV] === "1") return "opted-out";

  const path = options.registryPath ?? DEFAULT_REGISTRY_PATH;

  try {
    const registry = await readRegistry({ registryPath: path });
    // Dedup by absolute path. If someone re-inits over the same dir
    // (shouldn't happen given the collision check, but defensive),
    // replace the old entry with the newer one.
    registry.projects = registry.projects.filter((p) => p.path !== entry.path);
    registry.projects.push(entry);

    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
    return "recorded";
  } catch {
    // The registry is a courtesy; failures never block init.
    return "failed";
  }
}

export async function listProjects(options: RegistryOptions = {}): Promise<RegistryEntry[]> {
  const registry = await readRegistry(options);
  return registry.projects;
}

function isValidRegistry(value: unknown): value is Registry {
  if (!value || typeof value !== "object") return false;
  const v = value as { version?: unknown; projects?: unknown };
  if (v.version !== 1) return false;
  if (!Array.isArray(v.projects)) return false;
  return v.projects.every(isValidEntry);
}

function isValidEntry(value: unknown): value is RegistryEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.slug === "string" &&
    typeof e.path === "string" &&
    typeof e.created === "string" &&
    typeof e.version === "string"
  );
}
