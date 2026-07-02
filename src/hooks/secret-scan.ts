/**
 * `secret-scan` — PostToolUse(Write|Edit) hook (action plan §4.4).
 *
 * Catches common secret patterns at edit time (not just at commit). Reuses the
 * pattern catalogue from `template/scripts/check-secrets.sh` (the existing
 * pre-commit guard) so the two stay conceptually aligned. Scans the freshly
 * written content (Write `content` / Edit `new_string`); on a hit it feeds the
 * finding back to the model (PostToolUse block) naming the pattern — never the
 * matched value — so the secret is not echoed into the transcript.
 *
 * Overridable via COLDPRESS_OVERRIDE="secret-scan:<reason>" for false positives
 * (loudly logged). Non-blocking by nature (the write already happened) — this is
 * corrective feedback prompting the model to remove the secret + rotate it.
 */

import type { HookDecision, HookHandler, HookInput } from "./types.js";

/** Secret patterns, ported from template/scripts/check-secrets.sh. */
const SECRET_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "AWS access key id", re: /AKIA[0-9A-Z]{16}/ },
  { name: "AWS secret access key", re: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/ },
  { name: "Google API key", re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "GitHub personal access token", re: /ghp_[A-Za-z0-9]{36}/ },
  { name: "GitHub OAuth token", re: /gho_[A-Za-z0-9]{36}/ },
  { name: "GitHub fine-grained token", re: /github_pat_[A-Za-z0-9_]{82}/ },
  { name: "Slack token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
  { name: "Stripe/OpenAI secret key", re: /sk-[A-Za-z0-9]{32,}/ },
  { name: "Stripe live secret", re: /sk_live_[A-Za-z0-9]{24,}/ },
  { name: "Stripe live restricted key", re: /rk_live_[A-Za-z0-9]{24,}/ },
  { name: "Private key block", re: /-----BEGIN ((RSA|EC|DSA|OPENSSH|PGP) )?PRIVATE KEY/ },
  {
    name: "hardcoded credential assignment",
    re: /(api[_-]?key|auth[_-]?token|password|passwd|secret)\s*[:=]\s*["'][^"'\s$]{12,}["']/i,
  },
];

const EXPLAIN = `secret-scan (PostToolUse: Write|Edit)
Scans freshly written content for common secret patterns (AWS/GCP/GitHub/Slack/
Stripe/OpenAI keys, private-key blocks, hardcoded credential assignments — the
same catalogue as the pre-commit check-secrets guard). On a match it feeds the
finding back to the model (naming the pattern, never the value) so the secret is
removed and rotated. Corrective feedback, not a hard block (the write already ran).
Override (false positives, logged): COLDPRESS_OVERRIDE="secret-scan:<reason>".`;

/** Extract the text that was just written by the tool call, if available. */
export function writtenContent(input: HookInput): string {
  const ti = input.tool_input ?? {};
  const parts: string[] = [];
  if (typeof ti.content === "string") parts.push(ti.content); // Write
  if (typeof ti.new_string === "string") parts.push(ti.new_string); // Edit
  return parts.join("\n");
}

/** Returns the first matching pattern name, or null. */
export function scanForSecret(text: string): string | null {
  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(text)) return name;
  }
  return null;
}

export const secretScanHandler: HookHandler = {
  name: "secret-scan",
  event: "PostToolUse",
  overrideGate: "secret-scan",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const text = writtenContent(input);
    if (!text) return { kind: "none" };
    const hit = scanForSecret(text);
    if (!hit) return { kind: "none" };
    const filePath = typeof input.tool_input?.file_path === "string" ? input.tool_input.file_path : "the edited file";
    return {
      kind: "deny",
      reason:
        `Possible secret detected in ${filePath} — pattern: ${hit}. ` +
        `Remove the hardcoded secret, move it to an env var / secure/manifest, and rotate it if it was real. ` +
        `If this is a false positive: COLDPRESS_OVERRIDE="secret-scan:<reason>".`,
    };
  },
};
