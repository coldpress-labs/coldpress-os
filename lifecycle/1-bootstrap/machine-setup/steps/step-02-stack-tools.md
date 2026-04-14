---
step_number: 2
step_name: "Stack Tools"
step_goal: "Verify stack-specific tools based on project configuration"
halts_for_input: true
next_step: "step-03-report.md"
---

## Goal

If the project has a `coldpress.yaml` with a `stack_pack` value, verify the stack-specific tools are installed. Also check common development tools.

## Instructions

### 1. Check for coldpress.yaml

- If `coldpress.yaml` exists, read `stack_pack` value
- If no coldpress.yaml or no stack_pack, skip to section 3

### 2. Stack-Specific Checks

**If stack_pack: "convex":**
```bash
npx convex --version
```
- **Required:** Convex CLI available
- If missing: "Run `npm install convex` in your project, or `npm install -g convex` globally"

**If stack_pack: "supabase":**
```bash
supabase --version
```
- If missing: "Install Supabase CLI — see https://supabase.com/docs/guides/cli"

**If stack_pack: "firebase":**
```bash
firebase --version
```
- If missing: "Run `npm install -g firebase-tools`"

### 3. Common Development Tools

Check these regardless of stack:

```bash
npx tsc --version     # TypeScript compiler
```
- **Recommended** but not required — most projects use TypeScript

```bash
npx playwright --version 2>/dev/null  # E2E testing (if test framework is set up)
```
- **Optional** — only needed when testing phase begins

### 4. Present Results

| Tool | Status | Version | Required By |
|------|--------|---------|-------------|
| {stack CLI} | ✓/✗ | {version} | stack_pack: {value} |
| TypeScript | ✓/✗ | {version} | recommended |

## Output

Stack tool check results recorded. `step_2_complete: true`

## Navigation

-> Proceed to [step-03-report.md](step-03-report.md)
