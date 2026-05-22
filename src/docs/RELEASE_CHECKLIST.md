# Release Preparation Checklist

## Reliability Gate

1. Run automated reliability harness and confirm PASS.
2. Export JSON report and store snapshot for trend comparison.
3. Confirm no critical regression warnings.

## Testing

1. Run unit tests (Vitest).
2. Run e2e tests (Playwright) for long-session and recovery scenarios.
3. Verify keyboard shortcuts and command palette command flow.

## Performance

1. Confirm typing latency remains under p95 threshold.
2. Confirm preview render p95 and transaction p95 are within baseline.
3. Verify history memory footprint remains bounded.

## Recovery

1. Validate autosave primary and backup recovery paths.
2. Validate emergency snapshot restore path.
3. Validate safe-mode restore action.

## Build

1. Build production bundle.
2. Verify version metadata and debug panel diagnostics.
3. Archive machine-readable and human-readable reliability reports.
