# Foreground Service Reliability

## Problem

`UsageTrackerService` runs as a foreground `START_STICKY` service. While `START_STICKY` causes Android to restart the service after it is killed by the system, modern OEM battery optimisation layers (MIUI, OneUI, ColorOS, OxygenOS) kill services independently of this flag. When the service dies silently:

- Heartbeats stop being recorded.
- The scoring system detects the gap (`serviceRunning = false` for affected intervals) and penalises the score.
- The user has no visibility into why their score dropped.
- Trust in the app erodes.

The gap detection already exists in `getIntervalScores()` — the `serviceRunning` flag per interval is computed correctly. The problem is that nothing is done with this information from a UX standpoint, and nothing proactively prevents or recovers from the gap.

## Possible Solutions

### 1. Battery Optimisation Exemption (highest impact)

Request `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` via a system dialog. This whitelists the app from Android's own Doze mode and app standby. It does not override OEM-layer kills, but it handles stock Android reliably.

**Where to add it:** The app already has a `PermissionsScreen` that gates access behind Usage Stats and Overlay permissions. Battery optimisation exemption is a natural third step in that same flow.

**Considerations:** Google Play allows this permission but may flag it during review if the use case is not justified. Screen time tracking is a valid justification.

---

### 2. WorkManager Watchdog

Register a `PeriodicWorkRequest` (minimum 15-minute interval, enforced by Android) that checks whether the service is running and restarts it if not.

WorkManager uses `JobScheduler` internally, which is significantly harder for OEMs to suppress than raw services.

```java
// WatchdogWorker.doWork()
if (!isServiceRunning(context, UsageTrackerService.class)) {
    context.startForegroundService(new Intent(context, UsageTrackerService.class));
}
```

**Considerations:** The 15-minute minimum means a worst-case gap of ~15 minutes between service death and restart. This is acceptable for a minute-resolution scoring system. WorkManager jobs must be re-registered on device reboot (`BOOT_COMPLETED` receiver or WorkManager's built-in persistence handles this).

---

### 3. Surface Gaps to the User

The data to show this already exists. When the user opens the app, compute whether there were any `serviceRunning = false` / `deviceRunning = true` intervals in recent days and show a contextual warning with actionable steps.

Example: *"Your tracker was paused for 2 hours yesterday. To prevent this, go to Settings > Battery > Lucive and disable restrictions."*

This is transparent — users understand why their score dropped and have a path to fix it — rather than the current behaviour where the score silently degrades with no explanation.

---

### 4. OEM Autostart Deep Links

MIUI, ColorOS, and Samsung OneUI each have a separate "Autostart" or "App launch management" settings page that must be enabled per-app. These are distinct from the standard battery optimisation exemption. Apps can deep-link directly to these settings pages.

Libraries like [AutoStarter](https://github.com/judemanutd/AutoStarter) detect the OEM and fire the correct intent.

**Considerations:** OEMs change these settings paths between OS versions, so this requires ongoing maintenance. Lower priority than options 1–3 but meaningful for the target demographic (budget Android devices skew toward MIUI/ColorOS).

---

## Recommended Order

1. Battery optimisation exemption — add to `PermissionsScreen`, low effort, meaningful on stock Android.
2. WorkManager watchdog — medium effort, covers most OEM scenarios.
3. Gap surfacing in UI — the data is already computed, just needs a UI component.
4. OEM autostart deep links — when the above three are in place.
