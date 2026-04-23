# Requests For Comments (RFCs)

Larger proposals live here as `NNNN-short-slug.md`.

Contrast with ADRs: an ADR records a decided direction; an RFC proposes one. Once an RFC is accepted, distill the outcome into a new ADR under `../adr/` and cross-link both ways.

## Starting a new RFC

Copy the template from coldpress-os:

```bash
cp coldpress-os/templates/governance/rfc-amendment.md docs/rfc/$(printf "%04d" <next-n>)-<slug>.md
```

Then edit: motivation, detailed design, drawbacks, alternatives, open questions.

## Template

See `coldpress-os/templates/governance/rfc-amendment.md` for the full structure.
