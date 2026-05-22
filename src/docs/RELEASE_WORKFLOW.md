# Release Workflow

## Pre-release Gate

1. Build success.
2. Vitest success.
3. Playwright reliability scenarios success.
4. Reliability strict gate pass.
5. Release validation scripts pass.

## Release Artifact Checklist

1. Report JSON in `reports/`.
2. Markdown summary in `reports/`.
3. Snapshot JSON in `snapshots/`.
4. Benchmark history in `benchmarks/`.
5. Release check file in `release-checks/`.

## Post-release Mode

After strict gate release:
1. Stop major feature expansion.
2. Focus on bugfix and maintenance cycle.
3. Prioritize real-world usage feedback.
