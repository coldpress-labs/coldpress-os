package sacred_doc

# Architecture docs must carry at least one named approver.
# Prevents silent architecture drift — every material architecture
# change lands with an accountable approver in the frontmatter.

deny[msg] {
    input.workflowType == "architecture"
    count(input.approvers) == 0
    msg := "architecture.md has no approvers[] entries — add at least one named approver before merging."
}

deny[msg] {
    input.workflowType == "architecture"
    some approver in input.approvers
    not is_string(approver)
    msg := sprintf("approvers[] entry is not a string: %v", [approver])
}
