package sacred_doc

# PRDs must reference at least one ADR under `adr_references[]`.
# Forces planning documents to anchor to a decision record — no
# orphaned requirements.

deny[msg] {
    input.workflowType == "prd"
    count(input.adr_references) == 0
    msg := "PRD has no adr_references[] entries — link at least one ADR (pattern ADR-NNNN)."
}

deny[msg] {
    input.workflowType == "prd"
    some ref in input.adr_references
    not regex.match(`^ADR-\d{4}$`, ref)
    msg := sprintf("adr_references[] entry %q does not match ADR-NNNN format", [ref])
}
