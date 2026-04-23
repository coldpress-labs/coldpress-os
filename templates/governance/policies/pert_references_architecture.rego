package sacred_doc

# The PERT chart must list architecture.md under inputDocuments[].
# Upstream-reference integrity: if the architecture shifts, the PERT
# chart is clearly downstream and must acknowledge that dependency.

has_architecture_ref {
    some doc in input.inputDocuments
    regex.match(`(^|/)architecture\.md$`, doc)
}

deny[msg] {
    input.workflowType == "pert-chart"
    not has_architecture_ref
    msg := "pert-chart.md inputDocuments[] must include architecture.md (the upstream sacred doc the PERT is derived from)."
}
