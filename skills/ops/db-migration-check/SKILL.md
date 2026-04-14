---
name: "db-migration-check"
description: "Validate database migrations for safety and detect destructive changes"
type: "simple"
category: "ops"
phases: [7]
inputs:
  - "database schema files or migration files"
  - "_output/planning/architecture.md"
outputs:
  - artifact: "Migration Check Report"
    location: "_output/ops/db-migration-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Validates pending or recent database migrations for safety, detects destructive changes, verifies schema consistency, checks migration ordering, and generates rollback guidance. Read-only analysis — never executes or generates migrations.

## When to Use

- "check migrations"
- "validate db changes"
- "run migration check"
- Before running pending migrations in staging or production
- After generating new migrations
- When reviewing schema changes

## Prerequisites

- Project must use a database with a schema or migration system
- Schema/migration files must be accessible

## Process

1. **Detect database layer.** Identify the ORM or database tool:
   - Prisma, Drizzle, Convex, Knex, TypeORM, Supabase, raw SQL

2. **Identify pending or recent changes.**
   - Schema-based ORMs (Prisma, Convex): Compare current schema to last known state
   - Migration-based ORMs (Knex, TypeORM): List unapplied migration files

3. **Destructive change detection.** Flag these as blockers:
   - `DROP TABLE` or `DROP COLUMN`
   - Type narrowing (e.g., `TEXT` → `VARCHAR(50)`)
   - Adding `NOT NULL` without default value on existing column
   - `RENAME TABLE` or `RENAME COLUMN` (breaks existing queries)
   - Index removal on frequently queried columns

4. **Schema consistency check.** Validate:
   - Foreign key references point to valid tables/columns
   - Indexes exist for foreign keys and common query patterns
   - Naming conventions are consistent (snake_case, singular/plural)
   - Primary keys exist on all tables
   - Timestamp columns (created_at, updated_at) present where expected

5. **Migration ordering and dependency check.**
   - Sequential numbering is correct (no gaps, no duplicates)
   - Dependencies between migrations are respected
   - No conflicting migrations from parallel branches
   - Rollback/down migrations exist and are correct

6. **Seed data validation** (if applicable):
   - Seed data matches current schema
   - No constraint violations in seed data
   - No ID conflicts between seed files

7. **Generate report** with findings categorized by severity.

8. **Present findings with rollback guidance** for any destructive changes.

**Critical rule:** Read-only analysis only. Never execute migrations, never generate migration files.

## Output

A migration check report with destructive change warnings, consistency findings, ordering issues, and rollback guidance.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from db-migration-check, adapted to coldpress-os schema |
