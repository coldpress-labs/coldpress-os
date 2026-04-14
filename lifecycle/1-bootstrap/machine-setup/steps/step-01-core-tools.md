---
step_number: 1
step_name: "Core Tools"
step_goal: "Verify all required development tools are installed and at correct versions"
halts_for_input: true
next_step: "step-02-stack-tools.md"
---

## Goal

Check that every tool required by coldpress-os and general development is installed and meets minimum version requirements.

## Instructions

Run each check and record the result:

### 1. Node.js

```bash
node --version
```
- **Required:** v18.0.0+
- **Recommended:** v20 LTS or latest LTS
- If missing: "Install Node.js from https://nodejs.org/ (LTS version recommended)"

### 2. Package Manager

Check which is available (in preference order):
```bash
pnpm --version    # Preferred for coldpress-os projects
bun --version     # Fast alternative
yarn --version    # Common alternative
npm --version     # Always available with Node.js
```
- **Required:** At least one must be present
- **Recommended:** pnpm or bun for speed
- Record which one is primary

### 3. Git

```bash
git --version
```
- **Required:** v2.30+
- Check configuration:
  ```bash
  git config user.name
  git config user.email
  ```
- If name/email missing: "Run `git config --global user.name 'Your Name'` and `git config --global user.email 'you@example.com'`"

### 4. Claude Code

```bash
claude --version
```
- **Required:** Must be available
- If missing: "Install Claude Code — see https://claude.ai/code"

### 5. Present Results

Show a status table:

| Tool | Status | Version | Required |
|------|--------|---------|----------|
| Node.js | ✓/✗ | {version} | v18+ |
| {Package manager} | ✓/✗ | {version} | any |
| Git | ✓/✗ | {version} | v2.30+ |
| Git user.name | ✓/✗ | {value} | configured |
| Git user.email | ✓/✗ | {value} | configured |
| Claude Code | ✓/✗ | {version} | present |

If any FAIL: "These tools need to be installed before proceeding. Install them and re-run this check."
If all PASS: "Core tools are ready."

## Output

Core tool check results recorded. `step_1_complete: true`

## Navigation

-> On all core tools passing (or user acknowledging gaps), proceed to [step-02-stack-tools.md](step-02-stack-tools.md)
