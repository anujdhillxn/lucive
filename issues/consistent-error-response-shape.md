# Consistent Error Response Shape

## Problem

Error responses across the Django views use ad-hoc `{'error': '...'}` dicts with no enforced structure. The key name, HTTP status codes, and response shape vary by view. This makes client-side error handling fragile — the RN layer has to guess at the shape of each error.

Examples of current inconsistency:
- `{'error': 'User is not part of a confirmed duo'}` → 403
- `{'error': 'Rule not modified'}` → 400
- `{"error": "App is required."}` → 400 (note: trailing period in some, not others)
- `{'error': 'A modification request already exists for this rule'}` → 400

## Proposed Shape

```json
{
  "error": {
    "code": "RULE_NOT_MODIFIED",
    "message": "Rule not modified"
  }
}
```

Or a simpler flat version if machine-readable codes aren't needed yet:

```json
{
  "detail": "Rule not modified"
}
```

Note: DRF already uses `"detail"` as its error key for built-in errors (e.g. 401 Unauthorised, 403 Forbidden). Adopting `"detail"` across all views would make the client only need to handle one key.

## Options

### 1. Adopt DRF's `"detail"` key everywhere
Replace all `{'error': '...'}` with `{'detail': '...'}`. Minimal change, consistent with DRF's own error responses.

### 2. Custom exception handler
Register a custom `EXCEPTION_HANDLER` in `REST_FRAMEWORK` settings that normalises all error responses to a consistent shape. Errors raised anywhere (including DRF built-ins) go through one place.

### 3. Leave as-is, document the variance
If the only client is the mobile app and error messages are never displayed directly to users (only used to branch logic), the inconsistency may not matter in practice.

## Client Impact

Currently the RN layer does not appear to parse error response bodies in most cases — failed requests are caught and logged (`console.log(e)`) without inspecting the error detail. If that remains true, this is low priority.
