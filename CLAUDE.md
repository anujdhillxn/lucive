# Lucive — Root

## What This Project Is

Lucive is an Android app that enforces self-imposed screen time rules via a social accountability system. Users pair with a "duo" partner. Tightening a rule takes effect immediately; relaxing one requires the partner's approval.

## Repository Structure

```
lucive/
├── client/          # React Native (Expo) app + Android native layer
│   ├── src/         # TypeScript/React Native source
│   └── android/     # Java/Kotlin native code
└── server/          # Django REST API
```

Each layer has its own CLAUDE.md with detailed conventions:
- [client/CLAUDE.md](client/CLAUDE.md) — React Native / TypeScript layer
- [client/android/CLAUDE.md](client/android/CLAUDE.md) — Android native Java layer
- [server/CLAUDE.md](server/CLAUDE.md) — Django REST API layer

## Environments

| Build | API URL | Ads |
|---|---|---|
| `debug` | `http://localhost:8000/api/` | Test AdMob ID |
| `staging` | `https://api-lucive-uat.onrender.com/api/` | Test AdMob ID |
| `release` | `https://api-lucive.onrender.com/api/` | Production AdMob ID |

The API URL is injected at build time via `BuildConfig.API_URL` and read by the RN layer through `BuildConfigModule`.

## Core Domain Concepts

### Rules
A `Rule` constrains a specific Android app for a specific user. Constraints:
- **Daily max seconds** — usage cap since the daily reset time
- **Hourly max seconds** — usage cap within the current clock hour
- **Session max seconds** — contiguous foreground time cap
- **Startup delay** — forced countdown before the app becomes usable
- **Intervention type** — `FULL` (hard block overlay) or `PARTIAL`

Rules are **versioned**: changes create a new version row rather than mutating the existing one. The latest non-expired version is the active rule.

### Rule Modification Flow
1. User submits a rule change via the app.
2. **Tightening** (stricter limits) → applied immediately as a new version.
3. **Relaxing** (looser limits) → creates a `RuleModificationRequest`, sends FCM push to the partner.
4. Partner approves (optionally marking it temporary with a `validTill`) or the requester cancels it.

### Duo
Two users linked together. Rules are visible to both members of the duo. A user without a duo can only view their own profile and wait.

### Scoring
- The background service saves a **heartbeat** every 60 s while the screen is on.
- Every 12 hours it computes daily scores for the past 7 days from heartbeat + device-status data.
- `uninterruptedTracking = true` only if the service had a heartbeat for every minute the screen was on (prevents killing the service to cheat).

## Cross-Layer Data Flow

```
Django API  <-->  ApiRequestManager (Java)  -->  LocalStorageManager (SQLite)
                                                          |
                                                   RulesManager / EventManager
                                                          |
                                              UsageTrackerService (foreground)
                                                          |
                                               FloatingWindowService (overlay)

Django API  <-->  useRemote (RN fetch)  -->  AppContext (React state)
                                                  |
                                           React Native UI
```

Native SQLite is the single source of truth for the background service. The RN layer syncs from the server and writes to native storage via `LocalStorageModule`.

## Auth

- Token authentication (DRF `TokenAuthentication`).
- Google OAuth2 via `social-auth-app-django` on the server; `@react-native-google-signin/google-signin` on the client.
- The token is stored in native SharedPreferences so the background service can make authenticated API calls without RN being alive.
- FCM token is stored on the `User` model for push notifications.
