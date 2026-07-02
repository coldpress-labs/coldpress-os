/**
 * Minimal glob matcher for hook boundary checks (no dependency). Supports `*`
 * (within a path segment) and `**` (across segments). Matches an absolute OR
 * project-relative path against a project-relative glob by anchoring the glob to
 * the tail of the path — so `_context/sacred/*` matches
 * `/abs/proj/_context/sacred/prd.md`.
 */

function globToRegExpBody(glob: string): string {
  let body = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!;
    if (c === "*") {
      if (glob[i + 1] === "*") {
        body += ".*"; // ** — across segments
        i++;
        if (glob[i + 1] === "/") i++;
      } else {
        body += "[^/]*"; // * — within a segment
      }
    } else if ("\\^$.|?+()[]{}".includes(c)) {
      body += `\\${c}`;
    } else {
      body += c;
    }
  }
  return body;
}

export function pathMatchesGlob(path: string, glob: string): boolean {
  const p = path.replace(/\\/g, "/");
  const g = glob.replace(/\\/g, "/").replace(/^\.?\//, "");
  const re = new RegExp(`(^|/)${globToRegExpBody(g)}$`);
  return re.test(p);
}

/** True when the path matches ANY of the globs. */
export function pathMatchesAny(path: string, globs: string[]): boolean {
  return globs.some((g) => pathMatchesGlob(path, g));
}
