/**
 * `condition-reader` — read conditional flags once at skill-dispatch time
 * and pass them to skills as inputs. Keeps skills stateless w.r.t. config
 * (Butler reads; skills receive).
 *
 * Central to Phase II Part 2 Wave 3.9 — unifies `team_shape` / `project_shape`
 * / `cadence` branching that previously would have been duplicated inside
 * each skill as ad-hoc config reads.
 *
 * Reads from three sources:
 *  - `coldpress.yaml`            → user.* fields (team_shape, cadence, preferred_ides)
 *  - `.coldpress/local-config.yaml` → project_shape (set by Phase 1 intake)
 *  - `_input/` subfolders        → content flags (has_raw, has_legacy, ...)
 *
 * What it deliberately does NOT do:
 *  - Infer `product_type_hint` from context.md text. Text inference is
 *    fragile; deferred. Field exposed as `null` for now.
 *  - Mutate config. Read-only.
 *  - Validate config beyond parse. Validation lives in
 *    `src/utils/yaml-validator.ts` and `local-config-validator.ts`.
 */

import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export type TeamShape = "solo" | "team" | "client-project";
export type ProjectShape = "greenfield" | "brownfield" | "ambiguous";
export type Cadence = "silent" | "summary" | "verbose";

export interface InputFlags {
  has_raw: boolean;
  has_legacy: boolean;
  has_reference: boolean;
  has_assets: boolean;
  has_vendor: boolean;
}

export interface Conditions {
  team_shape: TeamShape | null;
  project_shape: ProjectShape | null;
  cadence: Cadence | null;
  preferred_ides: string[];
  /**
   * Set by stack-discovery-sync Step 2 (written to local-config.yaml).
   * Null before Phase 3 classification runs.
   */
  product_type: string | null;
  /**
   * Set by stack-discovery-sync Step 2 (written to local-config.yaml).
   * Null before Phase 3 classification runs.
   */
  domain_complexity: string | null;
  /** @deprecated Use product_type. Null in v1 — text inference deferred. */
  product_type_hint: string | null;
  input_flags: InputFlags;
}

export interface ReadConditionsOptions {
  projectRoot: string;
  /** Override the coldpress.yaml path relative to projectRoot. */
  coldpressYamlPath?: string;
  /** Override the local-config path relative to projectRoot. */
  localConfigPath?: string;
  /** Override the _input/ path relative to projectRoot. */
  inputPath?: string;
}

const DEFAULT_COLDPRESS_YAML = "coldpress.yaml";
const DEFAULT_LOCAL_CONFIG = join(".coldpress", "local-config.yaml");
const DEFAULT_INPUT_PATH = "_input";

const TEAM_SHAPES: ReadonlySet<TeamShape> = new Set<TeamShape>([
  "solo",
  "team",
  "client-project",
]);
const PROJECT_SHAPES: ReadonlySet<ProjectShape> = new Set<ProjectShape>([
  "greenfield",
  "brownfield",
  "ambiguous",
]);
const CADENCES: ReadonlySet<Cadence> = new Set<Cadence>([
  "silent",
  "summary",
  "verbose",
]);

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readYamlSafely(path: string): Promise<unknown> {
  if (!(await pathExists(path))) {
    return null;
  }
  try {
    const source = await readFile(path, "utf8");
    return parseYaml(source);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function pickEnum<T extends string>(value: unknown, allowed: ReadonlySet<T>): T | null {
  const str = pickString(value);
  if (str === null) return null;
  // ReadonlySet<T>.has expects T; at runtime `has` accepts any string.
  // Two-step cast via `unknown` per TS strict-mode conversion rules.
  return (allowed as unknown as ReadonlySet<string>).has(str) ? (str as T) : null;
}

function pickStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

/**
 * Check whether an _input/ subfolder has user-loaded content. Ignores the
 * framework-shipped `README.md` so a freshly-scaffolded project doesn't
 * look like it has content.
 */
async function subfolderHasContent(folder: string): Promise<boolean> {
  if (!(await pathExists(folder))) return false;
  let entries;
  try {
    entries = await readdir(folder, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "README.md") continue;
    if (entry.isFile()) return true;
    if (entry.isDirectory()) {
      if (await subfolderHasContent(join(folder, entry.name))) return true;
    }
  }
  return false;
}

async function readInputFlags(inputRoot: string): Promise<InputFlags> {
  const [has_raw, has_legacy, has_reference, has_assets, has_vendor] = await Promise.all([
    subfolderHasContent(join(inputRoot, "raw")),
    subfolderHasContent(join(inputRoot, "legacy")),
    subfolderHasContent(join(inputRoot, "reference")),
    subfolderHasContent(join(inputRoot, "assets")),
    subfolderHasContent(join(inputRoot, "vendor")),
  ]);
  return { has_raw, has_legacy, has_reference, has_assets, has_vendor };
}

/**
 * Read the branching conditions at skill-dispatch time. Safe on partial
 * projects (missing yaml / missing local-config / missing _input/) — any
 * unresolved field returns `null` rather than throwing.
 */
export async function readConditions(
  opts: ReadConditionsOptions,
): Promise<Conditions> {
  const coldpressYamlPath = join(
    opts.projectRoot,
    opts.coldpressYamlPath ?? DEFAULT_COLDPRESS_YAML,
  );
  const localConfigPath = join(
    opts.projectRoot,
    opts.localConfigPath ?? DEFAULT_LOCAL_CONFIG,
  );
  const inputPath = join(opts.projectRoot, opts.inputPath ?? DEFAULT_INPUT_PATH);

  const [coldpressYaml, localConfig, input_flags] = await Promise.all([
    readYamlSafely(coldpressYamlPath),
    readYamlSafely(localConfigPath),
    readInputFlags(inputPath),
  ]);

  const coldpressRoot = asRecord(coldpressYaml);
  const userBlock = asRecord(coldpressRoot?.user);
  const localConfigRoot = asRecord(localConfig);

  return {
    team_shape: pickEnum(userBlock?.team_shape, TEAM_SHAPES),
    project_shape: pickEnum(localConfigRoot?.project_shape, PROJECT_SHAPES),
    cadence: pickEnum(userBlock?.cadence, CADENCES),
    preferred_ides: pickStringArray(userBlock?.preferred_ides),
    product_type: pickString(localConfigRoot?.product_type),
    domain_complexity: pickString(localConfigRoot?.domain_complexity),
    product_type_hint: null,
    input_flags,
  };
}
