# CI Hardening Plan

## Regression Gate

1. Run automated harness in CI profile (`VITE_RUNTIME_ENV=ci`).
2. Fail build immediately on critical scenario failures.
3. Store machine-readable reports as CI artifacts.

## Recommended Pipeline Stages

1. Build
2. Unit reliability tests
3. E2E stability tests
4. Reliability harness export
5. Release readiness gate

## Artifact Outputs

1. JSON report
2. Markdown summary
3. Snapshot JSON
4. Benchmark history JSON
