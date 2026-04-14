---
step_number: 1
step_name: "Gather Context"
step_goal: "Detect review intent and collect the code diff plus any relevant context"
halts_for_input: true
next_step: "step-02-review.md"
---

## Goal

Determine what the user wants reviewed, gather the diff, and collect any related spec or story context before running review layers.

## Instructions

1. **Detect review intent** from the user's invocation:
   - **Staged changes** — `git diff --cached`
   - **Uncommitted changes** — `git diff`
   - **Branch diff** — `git diff main...HEAD` (or appropriate base branch)
   - **Commit range** — `git diff {start}..{end}`
   - **Provided diff** — User pasted or attached diff content
   - If intent is ambiguous, ask the user which scope to review.

2. **Check for story/spec context.** If the user mentions a story number or spec:
   - Look for the corresponding story file in `_output/` or `docs/`
   - Extract acceptance criteria for the acceptance auditor layer
   - If no story file found, note that acceptance auditing will be skipped.

3. **Construct the diff.** Run the appropriate git command and capture output.

4. **Sanity check.** If the diff is empty, halt and inform the user there are no changes to review. If the diff exceeds ~5000 lines, warn the user and suggest scoping to specific files or directories.

5. **Confirm scope** with the user before proceeding.

## User Interaction

Present the detected scope:
- "I detected **{N} files changed** ({additions} additions, {deletions} deletions) on **{branch/scope}**."
- "Story context: {found/not found}"
- "Proceed with review? (Y/N)"

## Output

Update output document frontmatter with:
- `review_scope`, `diff_stats`, `story_context`, `step_1_complete: true`

## Navigation

→ On user confirmation, proceed to [step-02-review.md](step-02-review.md)
