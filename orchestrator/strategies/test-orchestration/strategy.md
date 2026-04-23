# Test Orchestration Strategy

> Phase 6: Parallelizing test suites during implementation.

> **Status: reference-only.** This strategy is not auto-invoked by any skill. It is documented as a pattern for ad-hoc use by `parallelization-strategy` / `wave-orchestration` when the Phase-6 test DAG warrants it. If a future wave wires it in as a formal sub-strategy, this banner will be replaced with "wired in Wave N".

---

## When to Use

When multiple independent test suites (unit, integration, E2E, performance) can run simultaneously.

## Typical DAG

```yaml
dag:
  scope: "testing"
  tasks:
    - id: "unit-tests"
      name: "Unit Test Suite"
      depends_on: []
      estimated_duration: "5m"
      
    - id: "integration-tests"
      name: "Integration Tests"
      depends_on: []                       # Independent of unit tests
      estimated_duration: "10m"
      
    - id: "e2e-tests"
      name: "E2E Test Suite"
      depends_on: []                       # Independent
      estimated_duration: "15m"
      
    - id: "coverage-report"
      name: "Aggregate Coverage"
      depends_on: ["unit-tests", "integration-tests", "e2e-tests"]
      estimated_duration: "1m"
```

## Produces

```
Wave 1: [unit-tests, integration-tests, e2e-tests]  — all parallel
Wave 2: [coverage-report]
```

## Gate Criteria

- **Gate 1:** All test suites pass, coverage meets thresholds

## CI/CD Integration

This strategy maps directly to CI pipeline parallel jobs:
```yaml
# GitHub Actions
jobs:
  unit-tests:
    runs-on: ubuntu-latest
  integration-tests:
    runs-on: ubuntu-latest
  e2e-tests:
    runs-on: ubuntu-latest
  coverage:
    needs: [unit-tests, integration-tests, e2e-tests]
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial test orchestration strategy |
