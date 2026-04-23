---
name: performance-audit
description: Audit Convex application performance including queries, indexes, and function efficiency
license: MIT
compatibility: Phase 8
version: "1.0"
---

## Purpose

Audits a Convex application for performance issues — inefficient queries, missing indexes, large document sizes, unnecessary function calls, and suboptimal real-time subscription patterns.

## When to Use

- "audit Convex performance"
- "optimize Convex queries"
- "Convex performance review"
- When the application feels slow
- Before scaling to production traffic
- As part of periodic optimization review

## Prerequisites

- Convex project with schema and functions
- `convex/schema.ts` for index analysis

## Process

1. **Schema analysis:**
   - Check all query patterns have supporting indexes
   - Identify tables missing indexes for common queries
   - Flag over-indexed tables (too many indexes)
   - Check for excessively large document schemas

2. **Query efficiency:**
   - Find queries that scan full tables (missing index usage)
   - Identify N+1 query patterns (query inside a loop)
   - Check for queries returning more data than needed
   - Find unused queries (defined but never called from frontend)

3. **Mutation analysis:**
   - Check for mutations doing excessive writes
   - Identify mutations that could be batched
   - Look for missing optimistic update opportunities

4. **Subscription analysis:**
   - Identify over-broad subscriptions (subscribing to more data than displayed)
   - Check for subscription churn (frequently changing query parameters)
   - Find components with unnecessary real-time subscriptions

5. **Function complexity:**
   - Identify overly complex functions that should be split
   - Check for functions that mix queries and mutations inappropriately
   - Find actions that could be queries or mutations

6. **Generate report** with:
   - Performance score (A-F)
   - Findings by category and severity
   - Specific fix recommendations with code examples
   - Priority order for optimization

## Output

A performance audit report with categorized findings and specific optimization recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New stack-pack skill for Convex performance auditing |
