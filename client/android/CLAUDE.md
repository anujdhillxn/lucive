# Lucive Android — Native Java Layer

## Overview

The native layer is responsible for everything the React Native JS runtime cannot do: running as a persistent foreground service, reading `UsageStatsManager`, rendering an overlay window, and persisting data to SQLite independently of the RN process.

## Package: `com.lucive`

```
java/com/lucive/
├── managers/        # Singleton service classes
├── models/          # Plain data models (no Android framework deps)
├── modules/         # React Native bridge modules
├── services/        # Android foreground services
└── utils/           # Static utility helpers
```

## Services

### `UsageTrackerService` (foreground, `START_STICKY`)

The core service. Runs persistently even when the app is closed.

**Three periodic runnables on the main looper:**

| Runnable | Interval | What it does |
|---|---|---|
| `trackingRunnable` | 500 ms | Queries `UsageStatsManager`, processes events, checks limits |
| `heartbeatRunnable` | ~50 s (saves at 60 s boundaries) | Saves a heartbeat to SQLite if screen is on |
| `scoreSaverRunnable` | 12 hours | Calculates daily scores for last 7 days, POSTs to API |

**Limit enforcement in `handleModal()`:**
Evaluated in priority order for each currently-foreground app:
1. Hourly limit exceeded → show overlay
2. Daily limit exceeded → show overlay
3. Session limit exceeded → show overlay
4. Startup delay active (first 10 s of session) → show countdown overlay
5. None triggered → hide overlay

Communicates with `FloatingWindowService` via `Intent` extras (`EXTRA_SHOW_MODAL`, `EXTRA_MODAL_MESSAGE`).

**Score calculation:**
- Iterates over 1-minute intervals for a given date.
- A minute is `deviceRunning` if: the interval is in the past, the screen was on (from device status events), the user had joined, and no screen state change occurred mid-minute.
- A minute is `serviceRunning` if a heartbeat was recorded in that interval.
- `uninterruptedTracking` is `false` if any `deviceRunning` minute had `serviceRunning = false`.

### `FloatingWindowService`

Renders an `OVERLAY` type window (`WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`) using `modal_layout.xml`. Shows or hides based on the `EXTRA_SHOW_MODAL` boolean intent extra.

## Managers (Singletons)

### `EventManager`
Tracks raw `UsageEvents` per app in memory.
- `processEvent(packageName, timestamp, eventType, className)` — maintains a list of `Event` objects per package, computing cumulated screentime.
- `getCurrentlyOpenedApps()` — returns apps currently in the foreground.
- `getEvents(packageName)` — returns the event list for a package.
- `isScreenOn()` — derived from screen interactive/non-interactive events.

### `RulesManager`
Holds the active rule set in memory (loaded from `LocalStorageManager`).
- `getRule(packageName)` → `Rule | null`
- `calculateHeartbeatPoints()` — returns the score points for the current heartbeat interval based on active rule compliance.

### `LocalStorageManager`
SQLite wrapper (via `DatabaseHelper`). Single source of truth for the background service.
- Stores: `User`, `requestToken`, `Rule[]`, `UsageTrackerHeartbeat[]`, `DeviceStatus[]`, `Word[]`
- `saveHeartbeat(heartbeat)`, `getHeartbeats(date)` → `List<UsageTrackerHeartbeat>`
- `getDeviceStatuses(date)` → `List<DeviceStatus>`
- `getUser()` / `saveUser()` / `clearUser()`
- `getRules()` / `saveRules()` / `clearRules()`

### `ApiRequestManager`
Handles HTTP requests from the background service (no RN bridge available).
- `getRules()` — fetches latest rules and updates `LocalStorageManager`
- `updateScores(List<UsageTrackerDailyScore>)` — POSTs computed scores to `api/scores/`
- Uses `requestToken` from `LocalStorageManager` for auth header.

### `ContentManager`
Manages `Word[]` used for overlay content (motivational words/phrases displayed in the modal).

## React Native Bridge Modules

All modules are registered in `LucivePackage` and exposed via `NativeModules` in RN.

### `LocalStorageModule`
Bridges between RN and `LocalStorageManager`.
Methods: `getRequestToken`, `setRequestToken`, `clearRequestToken`, `getUser`, `setUser`, `clearUser`, `getRules`, `setRules`, `setWords`.

### `UsageTrackerModule`
Methods: `startService`, `stopService`, `isServiceRunning`.
Uses `Context.startForegroundService` / `stopService`.

### `InstalledAppsModule`
`getInstalledApps()` — returns a promise resolving to an array of `{ packageName, appName, icon? }` objects using `PackageManager`.

### `PermissionsModule`
`hasUsageStatsPermission()`, `hasOverlayPermission()` — return promises with boolean results.
`requestUsageStatsPermission()`, `requestOverlayPermission()` — launch system settings intents.

### `BuildConfigModule`
`getApiUrl(callback)` — exposes `BuildConfig.API_URL` (set per build variant in `build.gradle`) to RN via a callback.

## Models

| Class | Fields |
|---|---|
| `Rule` | `app`, `appDisplayName`, `isActive`, `interventionType`, `dailyReset`, `dailyMaxSeconds`, `isDailyMaxSecondsEnforced`, `hourlyMaxSeconds`, `isHourlyMaxSecondsEnforced`, `sessionMaxSeconds`, `isSessionMaxSecondsEnforced`, `isStartupDelayEnabled`, `isTemporary`, `validTill`, `version` |
| `Event` | `packageName`, `timestamp`, `eventType`, `cumulatedScreentime` |
| `UsageTrackerHeartbeat` | `timestamp` (epoch seconds), `points` |
| `DeviceStatus` | `timestamp` (epoch seconds), `isScreenOn` |
| `UsageTrackerDailyScore` | `date` (YYYY-MM-DD), `points`, `uninterruptedTracking` |
| `UsageTrackerIntervalScore` | `minuteOfDay`, `deviceRunning`, `serviceRunning`, `points` |
| `User` | `username`, `email`, `invitationToken`, `dateJoinedSeconds` |
| `Word` | `text` |

## Build Variants

Defined in `app/build.gradle`:

| Variant | API URL | Ad Unit |
|---|---|---|
| `debug` | `http://localhost:8000/api/` | Test AdMob |
| `staging` | `https://api-lucive-uat.onrender.com/api/` | Test AdMob |
| `release` | `https://api-lucive.onrender.com/api/` | Production AdMob |

`staging` inherits from `release` (`initWith release`) but overrides the two `buildConfigField` values.

## Required Android Permissions

- `PACKAGE_USAGE_STATS` — must be granted via system settings (not a runtime permission)
- `SYSTEM_ALERT_WINDOW` — for the overlay; must be granted via system settings
- `FOREGROUND_SERVICE`
- `POST_NOTIFICATIONS` (Android 13+)
- `INTERNET`

## Key Constants (`UsageTrackerService`)

| Constant | Purpose |
|---|---|
| `TRACKING_INTERVAL` | How often `UsageStatsManager` is polled for new events |
| `HEARTBEAT_INTERVAL` | Boundary used to deduplicate heartbeats (one per interval) |
| `HEARTBEAT_RUNNABLE_INTERVAL` | How often `saveHeartbeat()` is invoked |
| `SCORE_SAVE_INTERVAL` | How often scores are computed and synced to the server |
| `STARTUP_DELAY` | Countdown duration shown when an app opens under the startup delay rule |

## Important Behaviours

- **`pastEventsProcessed` flag**: `saveScores()` skips until the service has processed at least one batch of events from `UsageStatsManager`. This prevents computing scores on stale/empty state at startup.
- **Score lookback from yesterday**: `lastTimestamp` initialises to start-of-yesterday, so the first `checkScreenUsages()` call picks up any events from the previous 24 h that the service might have missed while it was stopped.
- **Rule expiry check**: If a temporary rule's `validTill` has passed, `handleModal()` calls `apiRequestManager.getRules()` to refresh — the server will return the new active version.
