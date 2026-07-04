<!--
Pattern 3 — Forcing-function table block (§6.7).

Copy-paste for analyses whose output is tabular (failure modes, risk
register, NFR matrix, epic→story matrix). Empty cells become visible
gaps the reviewer can flag.

Snippet lives at templates/prompt-snippets/forcing-function-table.md;
see docs/prompt-patterns.md §Pattern 3 for rationale.
-->

### {N}. {Section title — e.g. "Failure Mode Enumeration"}

| {Col1 — e.g. Scenario} | {Col2 — e.g. Probability} | {Col3 — e.g. Impact} | {Col4 — e.g. Mitigation} |
|---|---|---|---|
| {row1-c1} | {row1-c2} | {row1-c3} | {row1-c4} |
| {row2-c1} | {row2-c2} | {row2-c3} | {row2-c4} |

*Every row must have all {N} columns filled. An empty cell is a fail, not a warn — if you don't have data for a cell, call it out explicitly ("unknown — follow-up in sprint N") rather than leaving blank.*

{Optional: the threshold for "how many rows is enough" — e.g. "at least 5 scenarios covering the top-3 NFR axes (availability / security / data integrity)".}
