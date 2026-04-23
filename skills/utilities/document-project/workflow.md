---
workflow_version: "1.0"
output_file: "_context/audit/docs/"
total_steps: 6
resume_from: "frontmatter"
---

## Overview

Scans and documents an existing codebase through progressive analysis: project detection and classification, tech stack analysis, directory scanning, architecture documentation, development guide creation, and index generation. Supports three scan levels (quick, deep, exhaustive) and is resumable.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-project-detection.md](steps/step-01-project-detection.md) | Classify project type and select scan level |
| 2 | [step-02-tech-stack.md](steps/step-02-tech-stack.md) | Analyze and document the technology stack |
| 3 | [step-03-directory-scan.md](steps/step-03-directory-scan.md) | Scan and document directory structure |
| 4 | [step-04-architecture.md](steps/step-04-architecture.md) | Document architecture, components, and APIs |
| 5 | [step-05-dev-guide.md](steps/step-05-dev-guide.md) | Generate development guide and patterns |
| 6 | [step-06-index.md](steps/step-06-index.md) | Generate master documentation index |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options (A/P/C), wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.
8. **Write as you go.** Each step writes its output immediately. Do not accumulate content in memory.

## Completion Criteria

- Project classified and scan level selected
- Tech stack fully documented
- Directory structure mapped
- Architecture and components documented
- Development guide generated
- Master index created linking all documentation
