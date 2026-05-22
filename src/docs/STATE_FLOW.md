# State Flow

## Primary State Units

1. `doc`
Current editable content (`html`, `markdown`, `lastEdited`).

2. `history` + `future`
Undo/redo bounded stacks with recovery persistence.

3. `previewHtml`
Sanitized and render-ready HTML detached from editing source.

4. `selections` + `scrollPositions`
Cursor and viewport continuity for markdown, html, visual, and preview panes.

5. Recovery state
`recoveryNotice`, `safeMode`, and cached autosave/history payloads.

## Mutation Flow

1. Editor input queues into transaction engine.
2. Debounced transaction commits into store.
3. Parser engine converts source and produces preview payload.
4. Validator engine sanitizes and emits warnings.
5. Store snapshots history (transaction-aware), autosave, and emergency backup.
