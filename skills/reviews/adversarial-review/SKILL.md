---
name: "adversarial-review"
description: "Perform a cynical adversarial review and produce a findings report"
type: "simple"
category: "reviews"
phases: [2, 4, 5, 6, 7, 8]
inputs:
  - "content to review (document, code, design, or any artifact)"
outputs:
  - artifact: "Adversarial Review Findings"
    location: "_context/audit/reviews/adversarial-review-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Analyzes any artifact — code, documents, designs, plans — with extreme skepticism, hunting for flaws, gaps, unstated assumptions, and failure modes. The reviewer adopts a cynical posture to surface issues that optimistic reviews miss.

## When to Use

- "run adversarial review"
- "review this critically"
- "find problems with this"
- When a document or artifact is nearing finalization and needs stress-testing
- Before committing to a major architectural or product decision

## Prerequisites

- Content to review must be provided (inline, file path, or selection)
- Optional: `also_consider` — specific areas of concern to focus on

## Process

1. **Receive content.** Accept the artifact to review. If no content is provided, halt and ask the user to supply it. Never review empty content.

2. **Adopt adversarial posture.** Assume the content is flawed. Your job is to find every weakness, not to be balanced or encouraging.

3. **Analyze with extreme skepticism.** Examine the content for:
   - **Unstated assumptions** — What is taken for granted that shouldn't be?
   - **Missing error paths** — What happens when things go wrong?
   - **Scalability gaps** — Does this hold up at 10x, 100x?
   - **Security blind spots** — What attack vectors exist?
   - **Logical inconsistencies** — Do claims contradict each other?
   - **Vague language** — Where does imprecision hide real problems?
   - **Missing stakeholders** — Whose perspective is absent?
   - **Optimistic estimates** — What timelines, costs, or complexities are understated?
   - **Single points of failure** — What breaks everything if it fails?
   - **Edge cases** — What boundary conditions are unhandled?

4. **Produce findings.** Generate at minimum **ten findings**. If you cannot find ten genuine issues, dig deeper — the content is not as clean as it appears. Each finding must include:
   - **Issue** — Clear description of the problem
   - **Severity** — Critical / High / Medium / Low
   - **Evidence** — Specific quote or reference from the content
   - **Recommendation** — What to do about it

5. **If `also_consider` areas were specified**, ensure at least 2-3 findings target those areas specifically.

6. **Present findings** organized by severity (Critical first), then ask the user how to proceed.

## Output

A markdown findings report with:
- Review metadata (date, content reviewed, reviewer posture)
- Findings table organized by severity
- Summary statistics (total findings by severity)
- Recommended next actions

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from bmad-review-adversarial-general, adapted to coldpress-os schema |
