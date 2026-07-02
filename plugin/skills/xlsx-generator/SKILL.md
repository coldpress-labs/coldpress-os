---
name: xlsx-generator
description: Emit Excel .xlsx workbooks from structured data (sprint-status, retrospective tables, dependency-audit results, story breakdowns). Uses `exceljs`. Multi-sheet support; formula support; conditional formatting for dashboards.
license: MIT
compatibility: Invoked by @butler in Phase 7
version: "1.0"
---

## Purpose

Emit a multi-sheet Excel workbook from coldpress-os structured data sources. Renders via [`exceljs`](https://github.com/exceljs/exceljs) (pure-JS; produces Office Open XML; no Excel dependency). Use cases: sprint-status spreadsheet for stakeholders; dependency-audit results matrix; retrospective metrics; story-breakdown tracking.

Multi-sheet by design: a sprint-status export gets one sheet per sprint + one summary sheet; a dep-audit gets one sheet per severity + one matrix sheet. Conditional formatting (red/amber/green) applied where severity/status fields exist.

## When to Use (Proactive Triggers)

1. User says "export sprint-status to Excel" / "give me the dep-audit spreadsheet" / "render retrospective metrics as XLSX"
2. Phase 7 sprint-planning artefact for stakeholder review
3. Phase 9 dep-audit / readiness-report for security review board
4. Phase 10 sprint-status weekly stakeholder update
5. Phase 11 retrospective metrics deliverable

## Output Artifacts

1. **XLSX workbook** at `_context/exports/<source-slug>-v{N}.xlsx` — multi-sheet, conditionally-formatted, no external links
2. **Sheet manifest** at `_context/exports/<source-slug>-v{N}.sheets.json` — list of sheets + their source data refs
3. **Conditional-formatting log** — which cells got red/amber/green per severity/status mapping

## Prerequisites

- Source structured data: YAML (`sprint-status.yaml`), JSON (dep-audit), CSV, or in-memory array
- `exceljs` package in dev-deps
- For CSV source: optional column-type hints

## Process

1. **Parse source** — YAML / JSON / CSV based on extension; normalise to array-of-objects per logical sheet
2. **Determine sheet split:**
   - sprint-status → one sheet per sprint + "Summary" sheet
   - dep-audit → one sheet per severity (Critical / High / Medium / Low) + "Matrix" sheet
   - retrospective → "Metrics" + "What Worked" + "What Didn't" + "Actions" sheets
   - generic CSV → single sheet (sheet name = file slug)
3. **Per sheet:**
   - Bold header row (`row.font = { bold: true }`)
   - Auto-width columns based on content
   - Conditional formatting on severity/status columns:
     ```js
     ws.addConditionalFormatting({
       ref: 'F2:F100',
       rules: [
         { type: 'cellIs', operator: 'equal', formulae: ['"Critical"'], style: { fill: { fgColor: '#FECACA' }}},
         { type: 'cellIs', operator: 'equal', formulae: ['"High"'], style: { fill: { fgColor: '#FED7AA' }}},
       ]
     });
     ```
   - Freeze top row + first column (`ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }]`)
4. **Add summary sheet** (if multi-sheet): aggregate counts + key metrics
5. **Write workbook**: `await workbook.xlsx.writeFile('_context/exports/<slug>-v{N}.xlsx')`
6. **Emit sheet manifest** + conditional-formatting log

## Activation-Gate Checklist

- [ ] Source data parsed; ≥1 sheet of content
- [ ] Header row bold + auto-width applied
- [ ] Conditional formatting applied where severity/status columns exist
- [ ] Frozen panes configured
- [ ] XLSX file emitted, non-zero size
- [ ] Open XML integrity verified (XLSX is structured ZIP)
- [ ] Sheet manifest written

## Output

XLSX workbook at `_context/exports/<slug>-v{N}.xlsx`. Stakeholder-friendly format for non-Claude consumers. Round-trip via `parse-document` (ingestion).

## Source Attribution

Pattern adapted from `anthropics/skills` (no license — REFERENCE ONLY) `xlsx` skill. Implementation original to coldpress-os; exceljs renderer + conditional-formatting integration with severity/status conventions used across phases.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U15d) | Initial xlsx-generator skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from anthropics/skills (reference only — no vendoring). |
