/**
 * `coldpress verdict record <file>` (P8, WS10-A4/A5).
 *
 * Reads a verifier verdict record (`_context/audit/verdicts/{story}-verdict.yaml`),
 * validates it against VerifierVerdictSchema, and appends a `verdict` EventStream
 * event carrying the verdict's `taxonomy_tags`. This is the step that turns
 * `coldpress evolve`'s failure leaderboard live — before it, nothing wrote
 * taxonomy tags to events.jsonl, so the leaderboard was always empty.
 */

import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { VerifierVerdictSchema } from "../../schemas/operations/verifier-verdict.schema.js";
import { EventStreamWriter } from "../event-stream/writer.js";
import { readState } from "../hooks/state-io.js";

export interface RecordVerdictOptions {
  projectDir?: string;
  runId?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export async function recordVerdict(file: string, opts: RecordVerdictOptions = {}): Promise<number> {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch (e) {
    warn(`verdict record: cannot read ${file} — ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }

  const parsed = VerifierVerdictSchema.safeParse(parseYaml(raw));
  if (!parsed.success) {
    warn(`verdict record: invalid verdict record —\n${JSON.stringify(parsed.error.issues, null, 2)}\n`);
    return 1;
  }
  const v = parsed.data;

  // Tags = the verdict's declared tags ∪ the per-finding tags.
  const tags = [...new Set([...v.taxonomy_tags, ...v.findings.map((f) => f.taxonomy_tag).filter((t): t is string => !!t)])];

  try {
    const state = readState(cwd);
    const writer = await EventStreamWriter.open(cwd, opts.runId ? { runId: opts.runId } : {});
    await writer.append({
      kind: "verdict",
      story_id: v.story_id,
      verdict: v.verdict,
      model: v.model,
      ...(tags.length ? { taxonomy_tags: tags } : {}),
      ...(state && typeof state.phase === "number" ? { phase: state.phase } : {}),
    });
    await writer.close();
  } catch (e) {
    warn(`verdict record: failed to append the EventStream event — ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }

  write(
    `verdict recorded: ${v.story_id} → ${v.verdict.toUpperCase()} [${v.model}]` +
      (tags.length ? ` (tags: ${tags.join(", ")} — counted by \`coldpress evolve\`)` : "") +
      "\n",
  );
  return 0;
}
