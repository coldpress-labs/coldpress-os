<!--
Pattern 5 — Closing Output Contract (§6.7).

Copy-paste as the LAST section of a skill body, immediately before
the Version Control table. Restates the output format spec at the
point where the agent is about to generate — the repetition is
load-bearing.

Snippet lives at templates/prompt-snippets/output-contract.md;
see docs/prompt-patterns.md §Pattern 5 for rationale.
-->

## Output Contract

You must emit exactly one {artefact-kind — "Markdown document" / "JSON file" / "YAML manifest"} with this structure:

1. {First structural constraint — e.g. "`# <Title>` as the first line"}
2. {Second — e.g. "Frontmatter block (YAML) with fields: `sacred: true`, `version`, `governance`, `workflowType`"}
3. {Third — e.g. "Sections 1-N in order, each starting with `## <N>. <Section name>`"}
4. {Fourth — e.g. "Each section opens with the italicised meta-description as the first line"}
5. {Fifth — a hard NOT — e.g. "No additional sections. No trailing 'Closing Thoughts' or 'Summary' unless explicitly specified above."}

Save the artefact to `{canonical-output-path — e.g. _context/sacred/prd.md}`. Confirm the save in the chat with the file path and size.

Do NOT produce prose commentary around the artefact. The artefact is the output.
