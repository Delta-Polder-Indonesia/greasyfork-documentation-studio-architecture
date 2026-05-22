# Validator Pipeline

## Pipeline Steps

1. Input capture from editor or parser.
2. Whitelist cleanup removes blocked tags and attributes.
3. URL checks enforce GreasyFork-safe protocols and embed sources.
4. DOMPurify pass applies final safety hardening.
5. Warning list is classified and displayed to user and harness.

## Fail-safe Strategy

1. Validator engine catches runtime sanitizer failures.
2. On failure, sanitized output is empty and warning is emitted.
3. Recovery notice is shown when corruption or fallback is detected.

## Severity Classification

1. Critical scenarios influence build health heavily.
2. Non-critical issues emit warning state without hard fail.
