# Testing Guide

## Unit and Integration

Run:
`npx vitest run`

Coverage areas:
1. Store transaction batching and undo/redo integrity.
2. Recovery engine checksum and corruption rejection.
3. Deterministic transaction scheduling behavior.
4. Reliability harness scoring and artifact generation.

## End-to-End

Run:
`npx playwright test --project=chromium`

Coverage areas:
1. Long typing session stability.
2. Shortcut and command palette reliability.
3. Autosave recovery with corrupted primary payload.
4. Fullscreen and split stress toggling.
