# Transaction Lifecycle

## Goals

1. Avoid history spam on rapid typing.
2. Keep undo/redo natural by grouping burst edits.
3. Preserve responsiveness under long writing sessions.

## Lifecycle

1. `queue(value)`
Typing updates are buffered with a generated `transactionId`.

2. Debounce window
Subsequent edits inside debounce interval keep same transaction.

3. `flush()`
Commit executes parser + validator pipelines and updates preview.

4. History snapshot policy
Snapshot is created when transaction changes or commit is forced.

5. Metrics capture
Transaction duration and memory footprint are recorded for harness scoring.
