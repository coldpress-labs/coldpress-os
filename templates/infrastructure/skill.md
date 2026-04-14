# Skill Template — coldpress-os

> Copy this directory structure and fill in SKILL.md. Add workflow.md and steps/ if type is `workflow`.

---

## SKILL.md Template

```yaml
---
name: "{skill-name}"
description: "{One-line trigger phrase}"
type: "{simple|workflow|reference}"
category: "{category}"
agent: "{agent-slug}"
phases: []
inputs:
  - "coldpress.yaml"
outputs:
  - artifact: "{Name}"
    location: "{path}"
    format: "markdown"
version: "1.0"
---
```

## Purpose

{What this skill does, in 2-3 sentences.}

## When to Use

{Conditions and trigger phrases.}

## Prerequisites

{What must exist before this skill can run.}

## Process

{For simple skills: inline instructions. For workflow skills: pointer to workflow.md.}

## Output

{What this skill produces and where it goes.}
