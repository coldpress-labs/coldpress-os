/**
 * Secure-manifest adapter — reads `secure/manifest.yaml` and emits
 * `CredentialName` nodes for every declared key.
 *
 * **Credential values are NEVER indexed.** This adapter reads the
 * manifest (which declares names by policy — see docs/secure-pattern.md)
 * and emits one node per name. It does not open `secure/.env*`, does
 * not open any file other than `manifest.yaml`, and does not touch
 * node attributes with any string that could plausibly be a secret value.
 *
 * Edges from `CodeModule` / `CodeSymbol` nodes to `CredentialName` nodes
 * (representing "code X reads env var Y") are deferred — emitting them
 * requires source-code scanning that Graphify does not do natively.
 * Planned for Block O2 (when the watch / incremental layer ships).
 */

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { GraphJson, Node } from "./types.js";

export interface SecureManifestKey {
  name: string;
  service?: string;
  required?: boolean;
  notes?: string;
}

export interface SecureManifest {
  version: number;
  keys: SecureManifestKey[];
}

/**
 * Read + parse `<projectDir>/secure/manifest.yaml`. Returns an empty
 * manifest (with keys: []) if the file is missing — a project without
 * declared credentials is a valid state, not an error.
 */
export async function readSecureManifest(projectDir: string): Promise<SecureManifest> {
  const path = resolve(projectDir, "secure", "manifest.yaml");
  try {
    const raw = await readFile(path, "utf8");
    const parsed = parseYaml(raw) as { version?: unknown; keys?: unknown };
    return normaliseManifest(parsed);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { version: 1, keys: [] };
    }
    throw err;
  }
}

function normaliseManifest(raw: { version?: unknown; keys?: unknown }): SecureManifest {
  const version = typeof raw.version === "number" ? raw.version : 1;
  const keys: SecureManifestKey[] = [];
  if (Array.isArray(raw.keys)) {
    for (const entry of raw.keys) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const name = typeof e.name === "string" ? e.name : undefined;
      if (!name) continue;
      const key: SecureManifestKey = { name };
      if (typeof e.service === "string") key.service = e.service;
      if (typeof e.required === "boolean") key.required = e.required;
      if (typeof e.notes === "string") key.notes = e.notes;
      keys.push(key);
    }
  }
  return { version, keys };
}

/**
 * Build CredentialName nodes from a parsed manifest. Node id format:
 * `secure__<normalized-key-name>` — colons stripped, lowercased. Labels
 * preserve the upper-case env-var convention for display.
 */
export function buildCredentialNodes(manifest: SecureManifest): Node[] {
  return manifest.keys.map((key): Node => ({
    id: `secure__${key.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`,
    label: key.name,
    file_type: "doc",
    source_file: "secure/manifest.yaml",
    coldpress: {
      node_type: "CredentialName",
      dir_role: "secure",
      env_tag: "neither",
    },
  }));
}

/**
 * Merge CredentialName nodes into a graph. De-dupes against existing node
 * ids (a prior rebuild may have emitted the same ids). Credential nodes
 * are additive — they never overwrite upstream Graphify nodes.
 */
export function mergeCredentialNodes(json: GraphJson, manifest: SecureManifest): GraphJson {
  const credentialNodes = buildCredentialNodes(manifest);
  if (credentialNodes.length === 0) return json;

  const existingIds = new Set(json.nodes.map((n) => n.id));
  const additions = credentialNodes.filter((n) => !existingIds.has(n.id));

  return {
    ...json,
    nodes: [...json.nodes, ...additions],
  };
}

/**
 * Entry-point helper used by `coldpress graph rebuild`.
 * Reads manifest + merges credential nodes in one call.
 */
export async function applySecureManifest(
  json: GraphJson,
  projectDir: string,
): Promise<GraphJson> {
  const manifest = await readSecureManifest(projectDir);
  return mergeCredentialNodes(json, manifest);
}

// The actual file path helper — exported for the command layer.
export function secureManifestPath(projectDir: string): string {
  return join(projectDir, "secure", "manifest.yaml");
}
