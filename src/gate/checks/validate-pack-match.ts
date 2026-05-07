/**
 * Gate check: validate-pack-match
 *
 * Reads the latest shortlist and checks that `pack_match` is resolved:
 * - `matched_pack_name` is a non-null string (pack found), OR
 * - `matched_pack_name == null AND user_confirmed == true` (explicit no-match accepted).
 */

import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { resolve, join } from "node:path";
import { extractFrontmatter } from "../../governance/validate-schema.js";

export interface ValidatePackMatchResult {
  ok: boolean;
  message: string;
  matched_pack?: string | null;
  user_confirmed?: boolean;
}

export async function validatePackMatch(projectRoot: string): Promise<ValidatePackMatchResult> {
  const planningDir = resolve(projectRoot, "_context/planning");
  const shortlistFiles: string[] = [];
  try {
    for await (const f of glob(join(planningDir, "stack-shortlist-v*.md"))) shortlistFiles.push(f);
  } catch {
    return { ok: false, message: "No stack-shortlist-v*.md found in _context/planning/." };
  }

  if (shortlistFiles.length === 0) {
    return { ok: false, message: "No stack-shortlist-v*.md found in _context/planning/." };
  }

  shortlistFiles.sort();
  const latest = shortlistFiles[shortlistFiles.length - 1]!;
  const raw = await readFile(latest, "utf8");
  const fm = extractFrontmatter(raw);

  if (!fm) {
    return { ok: false, message: `Malformed frontmatter in ${latest}.` };
  }

  const packMatch = fm["pack_match"] as {
    matched_pack_name?: string | null;
    user_confirmed?: boolean;
  } | undefined;

  if (!packMatch) {
    return { ok: false, message: `pack_match section missing from ${latest}. Re-run stack-discovery-sync Step 3.` };
  }

  const { matched_pack_name, user_confirmed } = packMatch;

  if (matched_pack_name !== null && matched_pack_name !== undefined) {
    return {
      ok: true,
      message: `Pack match resolved: "${matched_pack_name}".`,
      matched_pack: matched_pack_name,
      user_confirmed,
    };
  }

  if (matched_pack_name === null && user_confirmed === true) {
    return {
      ok: true,
      message: "No pack match — user confirmed no-match accepted.",
      matched_pack: null,
      user_confirmed: true,
    };
  }

  return {
    ok: false,
    message: "pack_match not resolved: matched_pack_name is null but user_confirmed is not true. Confirm the no-match in stack-discovery-sync Step 3.",
    matched_pack: null,
    user_confirmed: false,
  };
}
