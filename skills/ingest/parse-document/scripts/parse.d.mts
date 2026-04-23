/**
 * Ambient type declarations for parse.mjs — used by the vitest test
 * suite to typecheck the routing imports. Runtime behaviour lives in
 * parse.mjs; this file only describes its public surface.
 */

export const SUPPORTED_EXTENSIONS: Set<string>;
export const MARKITDOWN_EXTENSIONS: Set<string>;
export const DOCLING_EXTENSIONS: Set<string>;
export const PASSTHROUGH_EXTENSIONS: Set<string>;

export interface RouteResult {
  backend: "markitdown" | "docling" | "passthrough" | "unsupported";
  /** Only set on PDF routing — signals that markitdown output below 200 chars should re-try docling. */
  fallbackOk?: boolean;
  /** Only set on unsupported — echoes back the offending extension. */
  extension?: string;
}

export function routeFile(path: string): RouteResult;

export function defaultOutputPath(inputPath: string, projectRoot: string): string;

export interface ParsedArgs {
  input?: string;
  backend?: string;
  output?: string;
  force: boolean;
  help: boolean;
}

export function parseArgs(argv: string[]): ParsedArgs;

export function probePython(
  backend: string,
): { ok: true; python: string } | { ok: false; reason: string };
