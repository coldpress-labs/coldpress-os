#!/usr/bin/env node
/**
 * parse.mjs — Node entry for the parse-document skill.
 *
 * Routes an input file to the right Python-backed adapter (markitdown
 * for text-native formats, Docling for scanned / image content),
 * invokes the adapter as a subprocess, and writes the resulting
 * markdown to `_input/.parsed/<name>.md`.
 *
 * Usage:
 *   node parse.mjs <input> [--backend <markitdown|docling>]
 *                          [--output <path>] [--force]
 *
 * Exit codes:
 *   0 — success, output written
 *   1 — any failure (details on stderr)
 *
 * The routing function is exported for unit tests; the executable
 * entry is guarded by `import.meta.url === ...` so tests can import
 * safely without triggering a run.
 *
 * @fileoverview
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
  ".html",
  ".htm",
  ".png",
  ".jpg",
  ".jpeg",
  ".tiff",
  ".bmp",
  ".md",
  ".markdown",
  ".txt",
]);

export const MARKITDOWN_EXTENSIONS = new Set([
  ".docx",
  ".pptx",
  ".xlsx",
  ".html",
  ".htm",
]);

export const DOCLING_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".bmp"]);

export const PASSTHROUGH_EXTENSIONS = new Set([".md", ".markdown", ".txt"]);

/**
 * Decide the routing outcome for a given file path — pure function.
 *
 * Returns one of:
 *   { backend: "markitdown" }            — try markitdown; caller may retry with docling.
 *   { backend: "markitdown", fallbackOk: true } — PDF specifically; fallback to docling if output is too short.
 *   { backend: "docling" }               — images, must use docling for OCR.
 *   { backend: "passthrough" }           — .md / .txt, no parsing needed.
 *   { backend: "unsupported", extension: ".xyz" } — unknown extension.
 *
 * @param {string} path
 * @returns {{ backend: string; fallbackOk?: boolean; extension?: string }}
 */
export function routeFile(path) {
  const ext = extname(path).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return { backend: "unsupported", extension: ext };
  }

  if (PASSTHROUGH_EXTENSIONS.has(ext)) {
    return { backend: "passthrough" };
  }

  if (DOCLING_EXTENSIONS.has(ext)) {
    return { backend: "docling" };
  }

  if (ext === ".pdf") {
    // PDFs: try markitdown fast-path, fall back to docling on short/empty output.
    return { backend: "markitdown", fallbackOk: true };
  }

  if (MARKITDOWN_EXTENSIONS.has(ext)) {
    return { backend: "markitdown" };
  }

  // Belt-and-suspenders — shouldn't reach here given SUPPORTED_EXTENSIONS.
  return { backend: "unsupported", extension: ext };
}

/**
 * Resolve the default output path for an input given the project root.
 * Preserves subpath structure under `_input/`:
 *   _input/raw/briefs/q2.pdf → _input/.parsed/raw/briefs/q2.md
 *
 * Inputs outside `_input/` land at `_input/.parsed/<basename>.md`.
 *
 * @param {string} inputPath
 * @param {string} projectRoot
 * @returns {string}
 */
export function defaultOutputPath(inputPath, projectRoot) {
  const abs = resolve(projectRoot, inputPath);
  const inputDir = resolve(projectRoot, "_input");
  const parsedDir = resolve(projectRoot, "_input", ".parsed");

  let relFromInput;
  try {
    relFromInput = relative(inputDir, abs);
  } catch {
    relFromInput = basename(abs);
  }

  if (relFromInput.startsWith("..")) {
    // Input not under _input/; flatten to basename.
    const base = basename(abs, extname(abs));
    return join(parsedDir, `${base}.md`);
  }

  const relDir = dirname(relFromInput);
  const stem = basename(relFromInput, extname(relFromInput));
  return join(parsedDir, relDir === "." ? "" : relDir, `${stem}.md`);
}

/**
 * Parse command-line args. Minimal, dependency-free — we don't pull
 * commander into the consumer skill because this file runs directly
 * via `node` without the npm package surface.
 *
 * @param {string[]} argv
 * @returns {{ input?: string; backend?: string; output?: string; force: boolean; help: boolean }}
 */
export function parseArgs(argv) {
  const result = { input: undefined, backend: undefined, output: undefined, force: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--backend") {
      result.backend = argv[++i];
    } else if (arg === "--output") {
      result.output = argv[++i];
    } else if (arg === "--force") {
      result.force = true;
    } else if (!arg.startsWith("--") && !result.input) {
      result.input = arg;
    }
  }
  return result;
}

const HELP = `Usage: parse.mjs <input> [options]

Options:
  --backend <markitdown|docling>   Force a specific adapter (skip heuristic).
  --output <path>                  Override output path.
  --force                          Overwrite an existing output file.
  -h, --help                       Show this help.

See ${fileURLToPath(new URL("../SKILL.md", import.meta.url))} for details.
`;

/**
 * Probe Python availability + the requested adapter's importability.
 *
 * @param {string} backend
 * @returns {{ ok: true; python: string } | { ok: false; reason: string }}
 */
export function probePython(backend) {
  for (const bin of ["python3", "python"]) {
    const version = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (version.status !== 0) continue;
    const match = /Python (\d+)\.(\d+)/.exec(version.stdout.trim() || version.stderr.trim());
    if (!match) continue;
    const major = parseInt(match[1] ?? "0", 10);
    const minor = parseInt(match[2] ?? "0", 10);
    if (major < 3 || (major === 3 && minor < 10)) {
      return {
        ok: false,
        reason: `Found ${version.stdout.trim() || version.stderr.trim()} but parse-document requires Python ≥ 3.10.`,
      };
    }
    const moduleCheck = spawnSync(
      bin,
      ["-c", `import ${backend === "docling" ? "docling" : "markitdown"}`],
      { encoding: "utf8" },
    );
    if (moduleCheck.status !== 0) {
      return {
        ok: false,
        reason: `Python ${major}.${minor} found but \`${backend}\` is not installed. Run:\n    pip install ${backend === "docling" ? "docling" : "markitdown"}`,
      };
    }
    return { ok: true, python: bin };
  }
  return { ok: false, reason: "Python ≥ 3.10 not found on PATH." };
}

function invokeAdapter(backend, pythonBin, inputAbs) {
  const scriptsDir = dirname(fileURLToPath(import.meta.url));
  const adapter = join(scriptsDir, `${backend}_adapter.py`);
  const result = spawnSync(pythonBin, [adapter, inputAbs], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
  return result;
}

/**
 * @param {string} markdown
 * @returns {boolean}
 */
function suspiciouslyShort(markdown) {
  return markdown.trim().length < 200;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    process.stdout.write(HELP);
    process.exit(args.help ? 0 : 1);
  }

  const projectRoot = process.cwd();
  const inputAbs = resolve(projectRoot, args.input);

  if (!existsSync(inputAbs)) {
    process.stderr.write(`✗ input not found: ${inputAbs}\n`);
    process.exit(1);
  }

  const route = args.backend
    ? { backend: args.backend }
    : routeFile(inputAbs);

  if (route.backend === "unsupported") {
    process.stderr.write(
      `✗ unsupported extension ${route.extension ?? ""}. Supported: ${[...SUPPORTED_EXTENSIONS].join(", ")}\n`,
    );
    process.exit(1);
  }

  const outputAbs = resolve(projectRoot, args.output ?? defaultOutputPath(args.input, projectRoot));

  if (existsSync(outputAbs) && !args.force) {
    process.stderr.write(
      `✗ output already exists at ${outputAbs} — pass --force to overwrite\n`,
    );
    process.exit(1);
  }

  mkdirSync(dirname(outputAbs), { recursive: true });

  // Passthrough — copy the file directly, no Python needed.
  if (route.backend === "passthrough") {
    copyFileSync(inputAbs, outputAbs);
    const size = statSync(outputAbs).size;
    process.stdout.write(`▸ backend: passthrough\n`);
    process.stdout.write(`▸ input:   ${args.input}\n`);
    process.stdout.write(`▸ output:  ${relative(projectRoot, outputAbs)} (${size} bytes)\n`);
    process.exit(0);
  }

  let backendUsed = route.backend;
  let probe = probePython(backendUsed);
  if (!probe.ok) {
    process.stderr.write(`✗ ${probe.reason}\n`);
    process.exit(1);
  }

  let adapterResult = invokeAdapter(backendUsed, probe.python, inputAbs);
  let markdown = adapterResult.stdout ?? "";

  // PDF fast-path fallback: if markitdown produced something suspiciously
  // short, retry with docling (assuming the PDF was scanned).
  if (
    backendUsed === "markitdown" &&
    route.fallbackOk === true &&
    (adapterResult.status !== 0 || suspiciouslyShort(markdown))
  ) {
    process.stderr.write(
      `⚠ markitdown produced ${adapterResult.status !== 0 ? "an error" : "a suspiciously short result"}; falling back to docling\n`,
    );
    backendUsed = "docling";
    probe = probePython(backendUsed);
    if (!probe.ok) {
      process.stderr.write(`✗ markitdown fell back but docling is unavailable: ${probe.reason}\n`);
      process.exit(1);
    }
    adapterResult = invokeAdapter(backendUsed, probe.python, inputAbs);
    markdown = adapterResult.stdout ?? "";
  }

  if (adapterResult.status !== 0) {
    process.stderr.write(
      `✗ ${backendUsed} adapter exited ${adapterResult.status}\n${adapterResult.stderr ?? ""}`,
    );
    process.exit(1);
  }

  writeFileSync(outputAbs, markdown, "utf8");
  const size = statSync(outputAbs).size;

  process.stdout.write(`▸ backend: ${backendUsed}\n`);
  process.stdout.write(`▸ input:   ${args.input} (${statSync(inputAbs).size} bytes)\n`);
  process.stdout.write(`▸ output:  ${relative(projectRoot, outputAbs)} (${size} bytes)\n`);
  process.stdout.write(`▸ run \`coldpress graph rebuild\` to index.\n`);
  process.exit(0);
}

// Guard so that importing this file from tests does NOT trigger main().
const isEntryPoint = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  main().catch((err) => {
    process.stderr.write(`✗ unexpected error: ${err?.message ?? err}\n`);
    process.exit(1);
  });
}
