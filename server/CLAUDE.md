# Lucive Server — Django REST API

## Stack

- **Framework**: Django 5.1 + Django REST Framework
- **Auth**: DRF `TokenAuthentication` + `social-auth-app-django` (Google OAuth2)
- **Database**: SQLite (dev) / PostgreSQL via `dj_database_url` (production)
- **Push notifications**: Firebase Admin SDK (FCM)
- **Config**: `python-decouple` for env vars

## Project Layout

```
server/
├── lucive/          # Django project package (settings, root urls, wsgi, push_notifications)
├── users/           # Custom user model, auth endpoints
├── duos/            # Duo pairing
├── rules/           # Rule CRUD + modification request flow
├── scores/          # Daily score storage
└── content/         # Admin-managed words/content for overlay
```

## Running Locally

```bash
cd server

# Create .env with required vars (see Environment Variables below)
python manage.py migrate
python manage.py runserver
```

## Environment Variables (via `.env` / decouple)

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `ENV` | `development` enables `DEBUG=True`; anything else is production |
| `DATABASE_URL` | PostgreSQL URL (used when `ENV != development`) |
| `SOCIAL_AUTH_GOOGLE_OAUTH2_KEY` | Google OAuth2 client ID |
| `SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET` | Google OAuth2 client secret |
| `FIREBASE_SERVICE_ACCOUNT` | Full Firebase service account JSON as a string |

## URL Routes

```
/admin/
/api/users/     → users.urls
/api/duos/      → duos.urls
/api/rules/     → rules.urls
/api/content/   → content.urls
/api/scores/    → scores.urls
```

## Apps

### `users`

Custom `User` model extending `AbstractUser`:
- `invitation_token` — UUID, unique; used for duo invite links
- `fcm_token` — FCM device token for push notifications; updated by the client on login

Auth endpoints support both Google OAuth2 (via `social_django`) and standard username/password.

### `duos`

**Model: `Duo`**
- `user1`, `user2` — FKs to `User`
- `created_at`

One duo per pair. Views handle: create duo from invitation token, get current duo, leave duo.

### `rules`

**Models:**

`RuleConstraint` (abstract base):
- `app`, `user`, `is_active`, `intervention_type` (`FULL` | `PARTIAL`)
- `daily_max_seconds`, `is_daily_max_seconds_enforced`, `daily_reset` (time of day)
- `hourly_max_seconds`, `is_hourly_max_seconds_enforced`
- `session_max_seconds`, `is_session_max_seconds_enforced`
- `is_startup_delay_enabled`

`Rule(RuleConstraint)`:
- `app_display_name`, `created_at`, `valid_till`, `version`, `is_temporary`
- Unique together: `(app, user, version)`

`RuleModificationRequest(RuleConstraint)`:
- Unique together: `(app, user)`
- Represents a pending relaxation awaiting partner approval

**Views:**

| View | Method | Behaviour |
|---|---|---|
| `UserRulesView` | `GET /api/rules/` | Returns latest active rules for both duo members, each annotated with any pending `modificationData` |
| `UpdateRuleView` | `POST /api/rules/update/` | Tightening → new `Rule` version; relaxing → `RuleModificationRequest` + FCM to partner |
| `DeleteRuleView` | `DELETE /api/rules/delete/` | Deletes all versions of a rule for the requesting user |
| `ApproveRuleModificationRequestView` | `POST /api/rules/approve/` | Partner approves: creates new `Rule` version from the request, deletes the request, sends FCM to requester |
| `DeleteRuleModificationRequestView` | `DELETE /api/rules/modification-request/` | Requester cancels their own pending request |

**`rules/utils.py`** — relaxation detection logic:
- `is_rule_relaxed(new_data, current_rule)` — returns `True` if any of: startup delay disabled, daily reset changed, intervention weakened (`FULL → PARTIAL`), rule disabled, limit seconds increased, limit removed (enforcement toggled off).
- `is_rule_modified(new_data, current_rule)` — gates all updates; returns `False` if nothing actually changed.

**Field name mapping** (`rules/utils.py`):
- Model fields: `snake_case` (`daily_max_seconds`)
- Serialized fields: `camelCase` (`dailyMaxSeconds`)
- Constants `FIELD_*` and `SERIAL_*` in `utils.py` are the canonical references — always use them instead of string literals.

### `scores`

**Model: `Score`**
- `user`, `date`, `value` (float), `uninterrupted_tracking` (bool)

The client's `ApiRequestManager` POSTs computed daily scores. The server stores them; the RN app reads them back for the Scores screen (streaks, calendar heatmap).

### `content`

Admin-managed content (words/phrases) displayed in the overlay modal on the device. The RN layer fetches these on login and stores them natively via `LocalStorageModule.setWords()`.

## Serialization Conventions

- All serializers output `camelCase` field names to match TypeScript types on the client.
- `RuleSerializer` adds a computed `isMyRule` boolean: `True` if `rule.user == request.user`.
- `modificationData` is attached to rule responses in the view layer (not in the serializer itself), so it can be `null` when no modification request exists.

## Push Notifications

`lucive/push_notifications.py` wraps the Firebase Admin SDK.

```python
send_push_notification(fcm_token, title, body)
```

Called in two places:
1. `UpdateRuleView` — notifies the partner when a relaxation request is submitted.
2. `ApproveRuleModificationRequestView` — notifies the requester when their request is approved.

## Auth Flow

1. Client authenticates via Google Sign-In (ID token).
2. ID token is sent to `/api/users/google/` (or equivalent social auth endpoint).
3. Server validates via `social_core.backends.google.GoogleOAuth2`, creates/gets the user, returns a DRF `Token`.
4. Client stores the token in native SharedPreferences; all subsequent requests use `Authorization: Token <token>`.
5. On logout, client clears the token from native storage.

## Key Design Decisions

- **Rule versioning**: Never mutate a rule — always insert a new version. Allows the service to detect staleness by comparing versions.
- **Relaxation requires partner approval**: `is_rule_relaxed()` in `utils.py` defines the exact set of changes that require approval. Only those changes go through the `RuleModificationRequest` path.
- **One pending modification per (app, user)**: The `unique_together` on `RuleModificationRequest` prevents stacking multiple requests.
- **Temporary rules**: The `valid_till` + `is_temporary` fields let the partner approve a relaxation for a fixed time window. The service checks expiry and re-fetches rules when `valid_till` is passed.
