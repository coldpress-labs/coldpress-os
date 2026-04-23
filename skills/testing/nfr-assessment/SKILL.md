---
name: "nfr-assessment"
description: "Assess non-functional requirements like performance, security, reliability, and scalability"
type: "workflow"
category: "testing"
agent: "qa"
phases: [6]
inputs:
  - "_context/planning/prd.md"
  - "_context/planning/architecture.md"
  - "project source code"
outputs:
  - artifact: "NFR Assessment Report"
    location: "_context/testing/nfr-assessment-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Systematically assesses non-functional requirements (NFRs) across performance, security, reliability, scalability, usability, and maintainability. Identifies gaps between stated NFRs and actual implementation, producing a gap analysis with remediation recommendations.

## When to Use

- "assess NFRs"
- "check non-functional requirements"
- "performance/security/reliability review"
- Before release to validate quality attributes
- When NFRs are defined in the PRD but not yet verified
- During architecture review

## Prerequisites

- PRD with NFR definitions
- Architecture document
- Project source code for implementation verification

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

An NFR assessment report with gap analysis, risk ratings, and prioritized remediation recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os testing suite |
