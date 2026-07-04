<!--
Pattern 2 — ATTENTION preamble (§6.7).

Copy-paste at the top of a skill whose output is parsed downstream.
Fill the 3-6 imperatives with the NON-NEGOTIABLE formatting rules
for this skill's output. Imperatives resist paraphrase; prose advice
doesn't.

Snippet lives at templates/prompt-snippets/attention-preamble.md;
see docs/prompt-patterns.md §Pattern 2 for rationale.
-->

## ATTENTION

1. {First non-negotiable — state the EXACT format constraint. "Emit the output as a Markdown table with columns X, Y, Z — in this order."}
2. {Second — what not to do. "Do NOT add a summary paragraph before the table."}
3. {Third — a schema-level rule if applicable. "Every row must have all N columns filled. Empty cells are a fail, not a warn."}
4. {Fourth — identifier convention if applicable. "Use kebab-case slugs for ids (e.g., `epic-auth-login`) — not Title Case or `Epic 1`."}
5. {Fifth — extension rule. "Do NOT add columns or sections beyond those specified."}
