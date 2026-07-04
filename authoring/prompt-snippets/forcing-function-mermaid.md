<!--
Pattern 3 — Forcing-function Mermaid block (§6.7).

Copy-paste into a skill's Process section where a diagram is the
load-bearing artefact. The skipped-analysis hole is visible: a
missing Mermaid block in the output is a reviewable gap.

Snippet lives at templates/prompt-snippets/forcing-function-mermaid.md;
see docs/prompt-patterns.md §Pattern 3 for rationale.
-->

### {N}. {Section title — e.g. "Component Interaction Diagram"}

```mermaid
{diagram-type — `graph LR` for left-to-right, `graph TD` for top-down}
  {Node1} --> {Node2}
  {Node2} --> {Node3}
  {Node1} --> {Node4}
```

*The diagram is mandatory. A text-only description of {whatever-this-diagram-captures} is an incomplete {architecture|analysis|plan} — skip the diagram and the review will flag this section as fail.*

{Optional one-paragraph rationale below the diagram — explain why these particular edges matter, what a reader should take away.}
