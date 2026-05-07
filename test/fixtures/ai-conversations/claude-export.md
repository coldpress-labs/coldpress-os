# Conversation with Claude — 2026-04-23

### User

I have a Docling adapter and a markitdown adapter in my parse-document skill. Should I add a third adapter for AI conversation exports or keep them in their own skill?

### Assistant

Keep them as a third adapter in the same skill. Your parse-document skill is already the "convert any input format to markdown" surface, and AI conversation exports fit that contract. Splitting would just duplicate the routing logic.

### User

What's the output format convention for a conversation adapter?

### Assistant

Preserve turn structure with level-2 headings like `## Turn 1 — User` / `## Turn 1 — Assistant`. Code blocks for tool use, so the downstream Graphify pipeline sees distinct nodes per turn instead of one merged blob.
