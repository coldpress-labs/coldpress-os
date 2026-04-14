# Project Context: {{PROJECT_NAME}}

> **Generated:** {{DATE}}  
> **Tech Stack:** Vibe Coder Stack (Convex-centric)  
> **Status:** Ready for Planning

---

## Quick Reference

| Field | Value |
|-------|-------|
| **One-liner** | {{ONE_LINER}} |
| **Role** | {{YOUR_ROLE}} |
| **Timeline** | {{TIMELINE}} |
| **Risk Profile** | {{RISK_PROFILE}} |
| **Primary Platform** | {{PRIMARY_PLATFORM}} |

---

## Product Vision

### Target User
{{TARGET_USER_DESCRIPTION}}

**Concrete Example:** {{TARGET_USER_EXAMPLE}}

### Problem Statement
{{PROBLEM_STATEMENT}}

### Core Value Proposition
{{ONE_THING_MUST_DO_WELL}}

### Revenue Model
{{REVENUE_MODEL}}

**Who pays:** {{WHO_PAYS}}

### Competitive Landscape
{{WHAT_EXISTS_TODAY}}

**Competitor strengths:** {{COMPETITOR_STRENGTHS}}

**Competitor weaknesses:** {{COMPETITOR_WEAKNESSES}}

---

## Technical Scope

### Platforms
| Platform | Status |
|----------|--------|
| Web (desktop) | {{WEB_DESKTOP}} |
| Web (mobile) | {{WEB_MOBILE}} |
| PWA | {{PWA}} |
| Native iOS | {{IOS}} |
| Native Android | {{ANDROID}} |

**Primary platform:** {{PRIMARY_PLATFORM}}

### Offline Requirements
{{OFFLINE_REQUIREMENTS}}

{{#if OFFLINE_FEATURES}}
**Offline-required features:** {{OFFLINE_FEATURES}}
{{/if}}

### Multi-Tenancy
{{MULTI_TENANCY_MODEL}}

### Scale Expectations
- **Users (12-month target):** {{SCALE_USERS}}
- **Data volume per user:** {{SCALE_DATA}}

### Integrations
{{#each INTEGRATIONS}}
- {{this}}
{{/each}}

### Data Residency
{{DATA_RESIDENCY}}

---

## User Model

### User Types
| Role | Description | Key Permissions |
|------|-------------|-----------------|
{{#each USER_ROLES}}
| {{this.role}} | {{this.description}} | {{this.permissions}} |
{{/each}}

### Organization Structure
{{ORG_STRUCTURE}}

### Onboarding Method
{{ONBOARDING_METHOD}}

### Permissions Model
{{PERMISSIONS_MODEL}}

### Auth Requirements
{{#each AUTH_REQUIREMENTS}}
- {{this}}
{{/each}}

---

## Data Model Seed

### Core Entities
| Entity | Description |
|--------|-------------|
{{#each ENTITIES}}
| {{this.name}} | {{this.description}} |
{{/each}}

### Key Relationships
{{#each RELATIONSHIPS}}
- {{this}}
{{/each}}

### Entity States
{{#each ENTITY_STATES}}
**{{this.entity}}:** {{this.states}}
{{/each}}

### Core Events/Actions
{{#each CORE_EVENTS}}
- {{this}}
{{/each}}

### History Requirements
{{#each HISTORY_REQUIREMENTS}}
- {{this}}
{{/each}}

### Cardinality Hints
{{#each CARDINALITY}}
- {{this}}
{{/each}}

---

## AI Specification

### Planned Features
| Feature | Input | Output | Context Needed |
|---------|-------|--------|----------------|
{{#each AI_FEATURES}}
| {{this.feature}} | {{this.input}} | {{this.output}} | {{this.context}} |
{{/each}}

### Model Configuration
- **Primary model:** {{PRIMARY_MODEL}}
- **Fallback strategy:** {{FALLBACK_STRATEGY}}

### Latency Requirements
{{LATENCY_REQUIREMENTS}}

### Failure Handling
{{AI_FAILURE_HANDLING}}

### Cost Limits
- **Per user/month:** {{COST_PER_USER}}
- **Per request:** {{COST_PER_REQUEST}}
- **Confirmation required:** {{COST_CONFIRMATION}}

---

## MVP Boundaries

### In Scope (Must-Have)
{{#each IN_SCOPE}}
- {{this}}
{{/each}}

### Out of Scope (Explicitly Deferred)
| Feature | Reason | When |
|---------|--------|------|
{{#each OUT_OF_SCOPE}}
| {{this.feature}} | {{this.reason}} | {{this.when}} |
{{/each}}

### Launch Criteria
{{#each LAUNCH_CRITERIA}}
- [ ] {{this}}
{{/each}}

### Success Metrics
| Metric | Target | PostHog Event |
|--------|--------|---------------|
{{#each SUCCESS_METRICS}}
| {{this.metric}} | {{this.target}} | {{this.event}} |
{{/each}}

### Known Future Features (Post-MVP)
{{#each FUTURE_FEATURES}}
- {{this}}
{{/each}}

---

## Domain Knowledge

### Glossary
See: `/docs/references/glossary.md`

### Regulatory Constraints
{{#if REGULATIONS}}
{{#each REGULATIONS}}
- **{{this.name}}:** {{this.requirements}}
{{/each}}
{{else}}
None identified.
{{/if}}

### Data Classification
| Classification | Data Types |
|----------------|------------|
{{#each DATA_CLASSIFICATION}}
| {{this.level}} | {{this.types}} |
{{/each}}

---

## Reference Files

| Topic | Location |
|-------|----------|
| Domain Glossary | `/docs/references/glossary.md` |
| AI Features Detail | `/docs/references/ai-features.md` |
{{#if HAS_WORKFLOWS}}
| Existing Workflows | `/docs/references/workflows.md` |
{{/if}}
{{#if HAS_COMPETITORS}}
| Competitor Analysis | `/docs/references/competitors.md` |
{{/if}}
{{#if HAS_SAMPLE_DATA}}
| Sample Data | `/docs/references/sample-data.json` |
{{/if}}

---

## External Links

{{#each EXTERNAL_LINKS}}
- [{{this.name}}]({{this.url}})
{{/each}}

---

## Instructions for Claude

When working on this project:

1. **Respect MVP boundaries** — Do not suggest out-of-scope features without flagging them
2. **Use the glossary** — Check `/docs/references/glossary.md` before using domain terms
3. **Follow the data model** — Use the entity list and relationships as your starting point
4. **Honor cost limits** — AI features must respect the specified cost constraints
5. **Track success metrics** — Ensure PostHog events are implemented for each metric
6. **Check launch criteria** — Before suggesting "ready to launch," verify all criteria

---

*This file is the single source of truth for project context. Update it as decisions change.*
