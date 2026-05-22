# Architecture Overview

GreasyFork Documentation Studio uses a layered frontend architecture designed for reliability-first iteration.

## Layers

1. UI Layer (`src/components`)
Renders editor, preview, dialogs, and toolbar controls.

2. Store Layer (`src/store/useEditorStore.ts`)
Owns document state, history, recovery status, and transaction-aware commits.

3. Engine Layer (`src/lib/engines`)
Contains parser, validator, transaction, reliability harness, regression gate, and recovery logic.

4. Utility Layer (`src/utils`)
Shared helpers for file IO, selection restore, and lightweight formatting.

## Reliability Principles

1. Parser and sanitizer must fail safe and return recoverable output.
2. Every document mutation is autosaved and mirrored to emergency snapshot.
3. History stack is bounded and persisted for crash recovery.
4. Harness reports are machine-readable and trend-aware.

## Future-safe Boundaries

1. Plugin and collaborative systems should integrate via engine interfaces, not direct store mutation.
2. Custom block systems should plug into parser engine and preview renderer contracts.
3. Multi-document workspace should compose multiple store slices instead of one monolithic store.
