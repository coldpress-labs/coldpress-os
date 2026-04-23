---
name: migration-helper
description: Plan and execute Convex schema migrations safely
license: MIT
compatibility: Phase 6
version: "1.0"
---

## Purpose

Plans and executes Convex schema migrations safely — handling table additions, field changes, index modifications, and data backfills. Convex uses a schema-based approach (not file-based migrations), so this skill focuses on safe schema evolution patterns.

## When to Use

- "migrate Convex schema"
- "add field to Convex table"
- "Convex migration"
- When evolving the Convex schema with existing data
- When adding or removing fields from production tables

## Prerequisites

- Existing Convex schema (`convex/schema.ts`)
- Understanding of what data exists in production

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A migration plan with step-by-step instructions for safe schema evolution, plus any migration functions needed.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New stack-pack skill for Convex migrations |
