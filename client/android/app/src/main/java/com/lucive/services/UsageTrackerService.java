package com.lucive.services;

import static com.lucive.utils.AppUtils.SCALING_FACTOR;

import android.app.AppOpsManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.core.app.NotificationCompat;
import android.util.Log;
import android.util.Pair;

import com.google.android.gms.ads.MobileAds;
import com.lucive.managers.EventManager;
import com.lucive.managers.LocalStorageManager;
import com.lucive.managers.RulesManager;
import com.lucive.models.DeviceStatus;
import com.lucive.models.Event;
import com.lucive.models.Rule;
import com.lucive.models.UsageTrackerHeartbeat;
import com.lucive.models.UsageTrackerIntervalScore;
import com.lucive.utils.AppUtils;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

public class UsageTrackerService extends Service {
    private UsageStatsManager usageStatsManager;
    private final String TAG = "UsageTrackerService";
    private final IBinder binder = new LocalBinder();
    private Handler handler;
    private Runnable trackingRunnable;
    private Runnable heartBeatRunnable;
    private static final long TRACKING_INTERVAL = 200;
    private static final long HEARTBEAT_INTERVAL = 90 * 1000;
    private static final long STARTUP_DELAY = 10 * 1000;
    private static final String CHANNEL_ID = "AppUsageTrackingChannel";
    private long lastTimestamp = AppUtils.getDayStartNDaysBefore(1);
    private EventManager eventManager;
    private RulesManager rulesManager;
    private final AtomicBoolean pastEventsProcessed = new AtomicBoolean(false);

    public class LocalBinder extends Binder {
        public UsageTrackerService getService() {
            return UsageTrackerService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        Log.i(TAG, "Service bound");
        return binder;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        MobileAds.initialize(this, initializationStatus -> Log.d("AdMob", "AdMob Initialized " + initializationStatus));
        usageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        eventManager = EventManager.getInstance(this);
        rulesManager = RulesManager.getInstance(this);
        Log.i(TAG, "Service created");
        startForeground(1, createNotification());
        startTracking();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "Service started");
        return START_STICKY;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        Log.i(TAG, "Service unbound");
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(trackingRunnable);
        handler.removeCallbacks(heartBeatRunnable);
        Log.i(TAG, "Service destroyed");
        super.onDestroy();
    }

    private Notification createNotification() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "App Usage Tracking", NotificationManager.IMPORTANCE_MIN
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Tracking App Usage")
                .setContentText("Running app usage tracking in the background")
                .build();
    }

    private void startTracking() {
        handler = new Handler(Looper.getMainLooper());
        trackingRunnable = new Runnable() {
            @Override
            public void run() {
                checkScreenUsages();
                handler.postDelayed(this, TRACKING_INTERVAL);
            }
        };
        heartBeatRunnable = new Runnable() {
            @Override
            public void run() {
                saveHeartbeat();
                handler.postDelayed(this, HEARTBEAT_INTERVAL);
            }
        };
        handler.post(trackingRunnable);
        handler.post(heartBeatRunnable);
    }

    private void saveHeartbeat() {
        final LocalStorageManager localStorageManager = LocalStorageManager.getInstance(this);
        localStorageManager.saveHeartbeat(new UsageTrackerHeartbeat(System.currentTimeMillis() / 1000, rulesManager.calculateHeartbeatPoints()));
    }

    private void checkScreenUsages() {
        // if usage stats permission is not granted, return
        AppOpsManager appOps = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), getPackageName());
        if (mode != AppOpsManager.MODE_ALLOWED) {
            return;
        }
        final long endTime = System.currentTimeMillis();
        long startTime = lastTimestamp + 1;
        long totalDuration = endTime - startTime;
        if (totalDuration < TRACKING_INTERVAL) {
            return;
        }
        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        UsageEvents.Event usageEvent = new UsageEvents.Event();
        List<Event> allEvents = new ArrayList<>();
        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(usageEvent);
            if (usageEvent.getEventType() == UsageEvents.Event.ACTIVITY_RESUMED
                    || usageEvent.getEventType() == UsageEvents.Event.ACTIVITY_PAUSED
                    || usageEvent.getEventType() == UsageEvents.Event.ACTIVITY_STOPPED
                    || usageEvent.getEventType() == UsageEvents.Event.SCREEN_NON_INTERACTIVE
                    || usageEvent.getEventType() == UsageEvents.Event.SCREEN_INTERACTIVE) {
                allEvents.add(new Event(usageEvent.getPackageName(), usageEvent.getEventType(), usageEvent.getTimeStamp(), usageEvent.getClassName()));
                lastTimestamp = usageEvent.getTimeStamp();
            }
        }
        int numFullChunks = (int) (totalDuration / TRACKING_INTERVAL);
        long remainder = totalDuration % TRACKING_INTERVAL;

        // Distribute the remainder evenly across chunks, with leftover distributed to last chunks
        long extraPerChunk = remainder / numFullChunks;
        long additionalRemainder = remainder % numFullChunks;

        long currentStart = startTime;
        int eventIndex = 0;
        String currentApp = AppUtils.UNKNOWN_PACKAGE;
        for (int i = 0; i < numFullChunks; i++) {

            // For the first `additionalRemainder` chunks, add an extra 1 millisecond
            List<Event> chunkEvents = new ArrayList<>();
            long currentEnd = currentStart + TRACKING_INTERVAL + extraPerChunk + (i < additionalRemainder ? 1 : 0);
            while (eventIndex < allEvents.size() && allEvents.get(eventIndex).getTimeStamp() < currentEnd) {
                chunkEvents.add(allEvents.get(eventIndex));
                eventIndex++;
            }
            currentApp = eventManager.processEventsChunk(chunkEvents);
            currentStart = currentEnd;

        }
        if (!currentApp.equals(AppUtils.UNKNOWN_PACKAGE)) {
            handleModal(currentApp);
        }
        pastEventsProcessed.set(true);
    }

    private void handleModal (final String currentApp) {
        final Rule rule = rulesManager.getRule(currentApp);
        if (rule != null && rule.isActive()) {
            if (isHourlyLimitExceeded(rule)) {
                String message = "Hourly screen time limit of " + AppUtils.formatTime(rulesManager.getRule(currentApp).hourlyMaxSeconds()) + " exceeded!";
                sendModalIntent(message);
                return;
            }
            if (isDailyLimitExceeded(rule)) {
                String message = "Daily screen time limit of " + AppUtils.formatTime(rulesManager.getRule(currentApp).dailyMaxSeconds()) + " exceeded!";
                sendModalIntent(message);
                return;
            }
            if (isSessionLimitExceeded(rule)) {
                String message = "Session screen time limit of " + AppUtils.formatTime(rulesManager.getRule(currentApp).sessionMaxSeconds()) + " exceeded!";
                sendModalIntent(message);
                return;
            }
            if (delayStartup(rule)) {
                String message = rule.appDisplayName() + " starts in " + (STARTUP_DELAY -  eventManager.getSessionTime(currentApp)) / 1000 + " seconds...";
                sendModalIntent(message);
                return;
            }
        }
        Intent hideScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
        hideScreenTimeExceeded.putExtra("EXTRA_SHOW_MODAL", false);
        startService(hideScreenTimeExceeded);
    }

    public int getHourlyScreentime(final String packageName) {
        long currentTime = System.currentTimeMillis();
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        long startOfCurrentHour = calendar.getTimeInMillis();
        return (int) (eventManager.getScreentime(startOfCurrentHour, currentTime, packageName) / 1000);
    }

    public int getDailyScreentime(final String packageName) {
        final Rule rule = rulesManager.getRule(packageName);
        if (rule == null) {
            return 0;
        }
        final Calendar dailyReset = AppUtils.parseTimeString(rule.dailyStartsAt());
        long resetTime = dailyReset.getTimeInMillis();
        long currentTime = System.currentTimeMillis();
        if (resetTime > currentTime) {
            dailyReset.add(Calendar.DAY_OF_MONTH, -1);
        }
        long startTime = dailyReset.getTimeInMillis();
        return (int) (eventManager.getScreentime(startTime, currentTime, packageName) / 1000);
    }

    public boolean isHourlyLimitExceeded(final Rule rule) {
        if (rule == null || !rule.isActive() || !rule.isHourlyMaxSecondsEnforced()) {
            return false;
        }
        final int hourlyUsage = getHourlyScreentime(rule.app());
        return hourlyUsage >= rule.hourlyMaxSeconds();
    }

    public boolean isDailyLimitExceeded(final Rule rule) {
        if (!rule.isDailyMaxSecondsEnforced()) {
            return false;
        }
        final int dailyUsage = getDailyScreentime(rule.app());
        return dailyUsage >= rule.dailyMaxSeconds();
    }

    public boolean isSessionLimitExceeded(final Rule rule) {
        if (!rule.isSessionMaxSecondsEnforced()) {
            return false;
        }
        final int sessionDuration = (int) eventManager.getSessionTime(rule.app()) / 1000;
        return sessionDuration >= rule.sessionMaxSeconds();
    }

    public boolean delayStartup(final Rule rule) {
        if (!rule.isStartupDelayEnabled()) {
            return false;
        }
        return eventManager.getSessionTime(rule.app()) < STARTUP_DELAY;
    }

    public Pair<Double, Boolean> calculateUsageTrackingPoints(final String date) {
        final List<UsageTrackerIntervalScore> intervalScores = getIntervalScores(date);
        double points = 0;
        boolean uninterruptedTracking = true;
        for (UsageTrackerIntervalScore intervalScore : intervalScores) {
            if (!intervalScore.deviceRunning()) {
                continue;
            }
            points += intervalScore.points();
            if (!intervalScore.serviceRunning()) {
                uninterruptedTracking = false;
            }
        }
        return new Pair<>(points / SCALING_FACTOR, uninterruptedTracking);
    }

    public List<UsageTrackerIntervalScore> getIntervalScores(final String date) {
        if (!pastEventsProcessed.get()) {
            throw new IllegalArgumentException("Past events not processed");
        }
        final LocalStorageManager localStorageManager = LocalStorageManager.getInstance(this);
        final long userJoinSecondsUTC = Long.parseLong(localStorageManager.getUser().dateJoinedSeconds());
        final long userJoinSeconds = userJoinSecondsUTC + Calendar.getInstance().getTimeZone().getOffset(userJoinSecondsUTC * 1000) / 1000; // convert to local time
        final List<UsageTrackerHeartbeat> heartbeats = localStorageManager.getHeartbeats(date);
        final List<DeviceStatus> deviceStatuses = localStorageManager.getDeviceStatuses(date);
        if (heartbeats.isEmpty()) {
            throw new IllegalArgumentException("No heartbeats found");
        }
        List<UsageTrackerIntervalScore> intervalScores = new ArrayList<>();
        double lastPoint = 0;
        // consider device to be off if no info of the previous day is available
        DeviceStatus lastDeviceStatus = new DeviceStatus(0, false);
        final Calendar calendar = AppUtils.parseDate(date);
        final long startOfDay = calendar.getTimeInMillis() / 1000;
        calendar.add(Calendar.DAY_OF_MONTH, 1);
        final long endOfDay = calendar.getTimeInMillis() / 1000;
        int heartbeatIndex = 0, deviceStatusIndex = 0;
        final long currentTime = System.currentTimeMillis() / 1000;
        for (long minuteStart = startOfDay; minuteStart < endOfDay; minuteStart += 5 * 60) {
            final long minuteEnd = minuteStart + 5 * 60;
            final int minuteOfDay = (int) ((minuteStart - startOfDay) / 60);
            while (deviceStatusIndex < deviceStatuses.size() && deviceStatuses.get(deviceStatusIndex).timestamp() < minuteEnd) {
                lastDeviceStatus = deviceStatuses.get(deviceStatusIndex);
                deviceStatusIndex++;
            }
            double currentPoint = 0;
            boolean serviceRunning = true;
            boolean deviceRunning = minuteEnd <= currentTime && lastDeviceStatus.isScreenOn() && minuteEnd >= userJoinSeconds;
            while (heartbeatIndex < heartbeats.size() && heartbeats.get(heartbeatIndex).timestamp() < minuteStart) {
                heartbeatIndex++;
            }
            if (heartbeatIndex < heartbeats.size() && heartbeats.get(heartbeatIndex).timestamp() < minuteEnd) {
                currentPoint = lastPoint + heartbeats.get(heartbeatIndex).points();
            }
            else {
                serviceRunning = false;
            }
            intervalScores.add(new UsageTrackerIntervalScore(minuteOfDay, deviceRunning, serviceRunning, currentPoint));
            lastPoint = currentPoint;
        }
        return intervalScores;
    }

    private void sendModalIntent(String message) {
        Intent showScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
        showScreenTimeExceeded.putExtra("EXTRA_SHOW_MODAL", true);
        showScreenTimeExceeded.putExtra("EXTRA_MODAL_MESSAGE", message);
        startService(showScreenTimeExceeded);
    }
}