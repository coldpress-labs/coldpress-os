---
step_number: 2
step_name: "Classify Project"
step_goal: "Determine product type and domain complexity from evidence + classification CSVs"
halts_for_input: true
next_step: "step-02b-pack-match.md"
---

## Goal

Map the project onto a `product_type` + `domain_complexity` pair using the classification CSVs and evidence from Step 1. These values drive pack-match scoring (Step 2b), rubric weighting in stack-evaluation, and product-type-aware category requirements in stack-locking.

## Tier 1 Core Methods

Apply these two methods to the classification decision:
- **First Principles Thinking (T0):** Strip away assumed product-type labels; derive from evidence what the product *actually does* at its core.
- **Jobs to be Done (T0):** What job is the user hiring this product to do? Maps directly to `product_type`.

*(Source: `docs/method-catalog-meta.md`)*

## Instructions

### 1. Read classification sources

- `data/classification/project-types.csv` — `product_type` column lists all recognized types
- `data/classification/domain-complexity.csv` — `complexity` column: `low` / `medium` / `high`

### 2. Derive product type

From the evidence package (product-brief value prop + persona jobs-to-be-done + constraints envelope), identify the best-fit `product_type` from the CSV. Present reasoning in one sentence.

If ambiguous between two product types: ask ONE clarifying question. User's answer resolves it. If the answer is vague or hedged → invoke `advanced-elicitation` with trigger: `stack-discovery-sync > step-02-classification`.

### 3. Derive domain complexity

Score against the CSV criteria:
- **Low:** Solo or small team; limited integrations; well-understood domain; standard web patterns
- **Medium:** Multiple integrations; moderate data volume; some domain-specific logic; team of 2-5
- **High:** Complex business rules; high data volume; distributed architecture; compliance requirements; team >5

Apply constraint-signals (compliance requirements push complexity up) and persona-signals (accessibility/locale requirements may push up).

If borderline: choose the higher tier conservatively.

### 4. Write classification to local-config

Write to `.coldpress/local-config.yaml`:
```yaml
product_type: "{classified type}"
domain_complexity: "{low|medium|high}"
```

### 5. Present and confirm

> Based on your product-brief and research, I'm classifying this as:
> - **Product type:** {product_type} — {one-line justification}
> - **Domain complexity:** {complexity} — {one-line justification}
>
> These drive which starter pack fits best and what technology categories are required. Does this look right?

Halt for confirmation. If user disagrees: accept correction; update values; write to local-config.

## Output

`product_type` and `domain_complexity` classified and confirmed. `step_2_complete: true`

## Navigation

→ Proceed to [step-02b-pack-match.md](step-02b-pack-match.md)
