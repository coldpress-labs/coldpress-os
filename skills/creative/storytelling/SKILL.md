---
name: "storytelling"
description: "Craft compelling narratives using 24 story types and narrative frameworks"
type: "workflow"
category: "creative"
status: "cross-cutting"
agent: "butler"
phases: [2, 5, 8, 11]
inputs:
  - "message, product, or concept to communicate"
  - "../../data/methods/story-types.csv"
outputs:
  - artifact: "Narrative Document"
    location: "_context/planning/creative/story-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Crafts compelling narratives for products, features, pitches, or communications using a library of 24 story types. Helps frame technical or complex ideas in human-resonant narrative structures.

## When to Use

- "craft a story for..."
- "help me tell the story of..."
- "narrative for this product"
- When writing product narratives or pitch decks
- When communicating complex ideas to non-technical audiences
- When building brand stories or marketing copy

## Prerequisites

- The message, product, or concept to communicate
- Target audience context
- Data asset: `../../data/methods/story-types.csv`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

A narrative document with story structure, key messages, and polished narrative text.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os creative suite |
