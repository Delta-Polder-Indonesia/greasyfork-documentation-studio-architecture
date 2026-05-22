# State Flow Diagram

```text
User Input
  -> Transaction Engine Queue
    -> Debounced Commit
      -> Parser Engine
        -> Validator Engine
          -> Store Update (doc + previewHtml + warnings)
            -> History Snapshot + Autosave + Emergency Snapshot
              -> UI Render (Editor + Preview)
                -> Runtime Metrics + Reliability Harness
```
