/**
 * Quick links tab — sandbox URL, live URL, repo URL, recent audit
 * reports, CHANGELOG. URL sources are coldpress.yaml `deployment:`
 * + `repo:` blocks (declared by user; nothing inferred).
 */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { QuickLink, QuickLinksData } from "../types.js";

const RECENT_AUDIT_LIMIT = 8;

interface ColdpressYaml {
  deployment?: {
    sandbox?: string;
    live?: string;
    [k: string]: unknown;
  };
  repo?: {
    url?: string;
    [k: string]: unknown;
  };
}

export async function assembleQuickLinks(
  projectDir: string,
): Promise<QuickLinksData> {
  const links: QuickLink[] = [];
  const yaml = await loadYaml(projectDir);

  if (yaml?.deployment?.sandbox) {
    links.push({
      label: "Sandbox",
      href: yaml.deployment.sandbox,
      category: "deploy",
    });
  }
  if (yaml?.deployment?.live) {
    links.push({
      label: "Live",
      href: yaml.deployment.live,
      category: "deploy",
    });
  }
  if (yaml?.repo?.url) {
    links.push({ label: "Repo", href: yaml.repo.url, category: "repo" });
  }

  for (const entry of await collectRecentAudit(projectDir)) {
    links.push(entry);
  }

  links.push({
    label: "CHANGELOG",
    href: "/file/CHANGELOG.md",
    category: "doc",
  });
  return { links };
}

async function loadYaml(projectDir: string): Promise<ColdpressYaml | null> {
  try {
    const raw = await readFile(join(projectDir, "coldpress.yaml"), "utf8");
    const parsed = parseYaml(raw);
    return parsed as ColdpressYaml | null;
  } catch {
    return null;
  }
}

async function collectRecentAudit(projectDir: string): Promise<QuickLink[]> {
  const root = join(projectDir, "_context/audit");
  try {
    const tops = await readdir(root, { withFileTypes: true });
    const files: { name: string; path: string }[] = [];
    for (const top of tops) {
      if (top.isFile() && top.name.endsWith(".json")) {
        files.push({ name: top.name, path: `_context/audit/${top.name}` });
      }
    }
    files.sort((a, b) => (a.name < b.name ? 1 : -1));
    return files.slice(0, RECENT_AUDIT_LIMIT).map((f) => ({
      label: f.name,
      href: `/file/${f.path}`,
      category: "audit",
    }));
  } catch {
    return [];
  }
}
