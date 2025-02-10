package com.lucive.services;

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

import com.google.android.gms.ads.MobileAds;
import com.lucive.managers.ApiRequestManager;
import com.lucive.managers.EventManager;
import com.lucive.managers.LocalStorageManager;
import com.lucive.managers.RulesManager;
import com.lucive.models.DeviceStatus;
import com.lucive.models.Event;
import com.lucive.models.Rule;
import com.lucive.models.UsageTrackerDailyScore;
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
    private Runnable heartbeatRunnable;
    private Runnable scoreSaverRunnable;
    private static final long TRACKING_INTERVAL = 250;
    private static final long HEARTBEAT_INTERVAL = 60 * 1000;
    private static final long HEARTBEAT_RUNNABLE_INTERVAL = 50 * 1000;
    private static final long SCORE_SAVE_INTERVAL = 12 * 60 * 60 * 1000;
    private static final long STARTUP_DELAY = 10;
    private static final String CHANNEL_ID = "AppUsageTrackingChannel";

    private long lastTimestamp = AppUtils.getDayStartNDaysBefore(1);
    private long lastHeartbeatTime = 0;
    private final List<String> runningApps = new ArrayList<>();
    private EventManager eventManager;
    private RulesManager rulesManager;
    private ApiRequestManager apiRequestManager;
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
        apiRequestManager = ApiRequestManager.getInstance(this);
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
        // Remove callbacks and nullify references to the handler and runnable
        if (handler != null) {
            handler.removeCallbacksAndMessages(null);
            handler = null;
        }
        trackingRunnable = null;
        heartbeatRunnable = null;
        scoreSaverRunnable = null;

        // Nullify or clean up resource-heavy objects
        usageStatsManager = null;
        eventManager = null;
        rulesManager = null;
        apiRequestManager = null;
        // Log and finalize
        Log.i(TAG, "Service destroyed and resources cleaned up");
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
        heartbeatRunnable = new Runnable() {
            @Override
            public void run() {
                saveHeartbeat(System.currentTimeMillis());
                handler.postDelayed(this, HEARTBEAT_RUNNABLE_INTERVAL);
            }
        };
        scoreSaverRunnable = new Runnable() {
            @Override
            public void run() {
                saveScores();
                handler.postDelayed(this, SCORE_SAVE_INTERVAL);
            }
        };
        handler.post(trackingRunnable);
        handler.post(heartbeatRunnable);
        handler.post(scoreSaverRunnable);
    }

    private void saveScores() {
        if (!pastEventsProcessed.get()) {
            return;
        }
        final List<UsageTrackerDailyScore> dailyScores = new ArrayList<>();
        final Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -1);
        for (int i = 0; i < 7; i++) {
            String date = AppUtils.parseToYYYYMMDD(calendar);
            try {
                dailyScores.add(calculateUsageTrackingScore(date));
            }
            catch (Exception e) {
                Log.e(TAG, "Error calculating score for date: " + date, e);
            }
            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
        apiRequestManager.updateScores(dailyScores);
    }

    private void saveHeartbeat(final long currentTime) {
        long currentInterval = getStartOfHeartbeatInterval(currentTime);
        if (lastHeartbeatTime < currentInterval && eventManager.isScreenOn()) {
            final LocalStorageManager localStorageManager = LocalStorageManager.getInstance(this);
            localStorageManager.saveHeartbeat(new UsageTrackerHeartbeat(currentTime / 1000, rulesManager.calculateHeartbeatPoints()));
            lastHeartbeatTime = currentTime;
            Calendar calendar = Calendar.getInstance();
            Log.i(TAG, "Heartbeat saved at " + calendar.getTime());
        }
    }

    private void checkScreenUsages() {
        final long endTime = System.currentTimeMillis();
        long startTime = lastTimestamp + 1;
        long totalDuration = endTime - startTime;
        if (totalDuration < TRACKING_INTERVAL) {
            return;
        }
        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        UsageEvents.Event usageEvent = new UsageEvents.Event();
        boolean processedEvents = false;
        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(usageEvent);
            if (usageEvent.getEventType() == UsageEvents.Event.ACTIVITY_RESUMED
                    || usageEvent.getEventType() == UsageEvents.Event.ACTIVITY_PAUSED
                    || usageEvent.getEventType() == UsageEvents.Event.ACTIVITY_STOPPED
                    || usageEvent.getEventType() == UsageEvents.Event.SCREEN_NON_INTERACTIVE
                    || usageEvent.getEventType() == UsageEvents.Event.SCREEN_INTERACTIVE) {
                eventManager.processEvent(usageEvent.getPackageName(), usageEvent.getTimeStamp(), usageEvent.getEventType(), usageEvent.getClassName());
                lastTimestamp = usageEvent.getTimeStamp();
                processedEvents = true;
            }
        }
        if (!pastEventsProcessed.get()) {
            pastEventsProcessed.set(true);
        }
        if (processedEvents) {
            runningApps.clear();
            runningApps.addAll(eventManager.getCurrentlyOpenedApps());
        }
        handleModal(runningApps);
    }

    private void handleModal (final List<String> runningApps) {
        for (String currentApp: runningApps) {
            final Rule rule = rulesManager.getRule(currentApp);
            final List<Event> events = eventManager.getEvents(currentApp);
            if (rule != null) {
                if (rule.isTemporary() && rule.validTill() < System.currentTimeMillis()) {
                    apiRequestManager.getRules();
                }
                if (rule.isActive() && !events.isEmpty()) {
                    if (isHourlyLimitExceeded(rule, events)) {
                        String message = "Hourly screen time limit of " + AppUtils.formatTime(rulesManager.getRule(currentApp).hourlyMaxSeconds()) + " exceeded!";
                        sendModalIntent(message);
                        return;
                    }
                    if (isDailyLimitExceeded(rule, events)) {
                        String message = "Daily screen time limit of " + AppUtils.formatTime(rulesManager.getRule(currentApp).dailyMaxSeconds()) + " exceeded!";
                        sendModalIntent(message);
                        return;
                    }
                    if (isSessionLimitExceeded(rule, events)) {
                        String message = "Session screen time limit of " + AppUtils.formatTime(rulesManager.getRule(currentApp).sessionMaxSeconds()) + " exceeded!";
                        sendModalIntent(message);
                        return;
                    }
                    if (delayStartup(rule, events)) {
                        String message = rule.appDisplayName() + " starts in " + (STARTUP_DELAY -  getSessionTime(events)) + " seconds...";
                        sendModalIntent(message);
                        return;
                    }
                }
            }
        }
        Intent hideScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
        hideScreenTimeExceeded.putExtra("EXTRA_SHOW_MODAL", false);
        startService(hideScreenTimeExceeded);
    }

    public int getHourlyScreentime(final List<Event> events) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        long startOfCurrentHour = calendar.getTimeInMillis();
        return (int) getScreentimeFrom(startOfCurrentHour, events) / 1000;
    }

    public int getDailyScreentime(final Rule rule, final List<Event> events) {
        final Calendar dailyReset = AppUtils.parseTimeString(rule.dailyStartsAt());
        long resetTime = dailyReset.getTimeInMillis();
        long currentTime = System.currentTimeMillis();
        if (resetTime > currentTime) {
            dailyReset.add(Calendar.DAY_OF_MONTH, -1);
        }
        long startTime = dailyReset.getTimeInMillis();
        return (int) getScreentimeFrom(startTime, events) / 1000;
    }

    public long getScreentimeFrom(final long startTime, final List<Event> packageEvents) {
        final Event lastEvent = packageEvents.get(packageEvents.size() - 1);
        long screentime = lastEvent.getCumulatedScreentime();
        if (lastEvent.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
            screentime += System.currentTimeMillis() - lastEvent.getTimeStamp();
        }
        Event lastEventBeforeStart = AppUtils.getLastEventBefore(packageEvents, startTime);
        if (lastEventBeforeStart != null) {
            screentime -= lastEventBeforeStart.getCumulatedScreentime();
            if (lastEventBeforeStart.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                screentime -= startTime - lastEventBeforeStart.getTimeStamp();
            }
        }
        return screentime;
    }

    public int getSessionTime(final List<Event> events) {
        if (events.get(events.size() - 1).getEventType() == UsageEvents.Event.ACTIVITY_RESUMED) {
            return (int) (System.currentTimeMillis() - events.get(events.size() - 1).getTimeStamp()) / 1000;
        }
        return 0;
    }

    public boolean isHourlyLimitExceeded(final Rule rule, final List<Event> events) {
        if (!rule.isHourlyMaxSecondsEnforced()) {
            return false;
        }
        final int hourlyUsage = getHourlyScreentime(events);
        return hourlyUsage >= rule.hourlyMaxSeconds();
    }

    public boolean isDailyLimitExceeded(final Rule rule, final List<Event> events) {
        if (!rule.isDailyMaxSecondsEnforced()) {
            return false;
        }
        final int dailyUsage = getDailyScreentime(rule, events);
        return dailyUsage >= rule.dailyMaxSeconds();
    }

    public boolean isSessionLimitExceeded(final Rule rule, final List<Event> events) {
        if (!rule.isSessionMaxSecondsEnforced()) {
            return false;
        }
        final int sessionDuration = getSessionTime(events);
        return sessionDuration >= rule.sessionMaxSeconds();
    }

    public boolean delayStartup(final Rule rule, final List<Event> events) {
        if (!rule.isStartupDelayEnabled()) {
            return false;
        }
        return events.get(events.size() - 1).getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND
                && getSessionTime(events) < STARTUP_DELAY;
    }

    public UsageTrackerDailyScore calculateUsageTrackingScore(final String date) {
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
        return new UsageTrackerDailyScore(date, points, uninterruptedTracking);
    }

    public List<UsageTrackerIntervalScore> getIntervalScores(final String date) {
        final LocalStorageManager localStorageManager = LocalStorageManager.getInstance(this);
        final long userJoinSeconds = Long.parseLong(localStorageManager.getUser().dateJoinedSeconds());
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
        for (long minuteStart = startOfDay; minuteStart < endOfDay; minuteStart += HEARTBEAT_INTERVAL / 1000) {
            final long minuteEnd = minuteStart + HEARTBEAT_INTERVAL / 1000;
            final int minuteOfDay = (int) ((minuteStart - startOfDay) / 60);
            boolean deviceStatusChanged = false;
            while (deviceStatusIndex < deviceStatuses.size() && deviceStatuses.get(deviceStatusIndex).timestamp() < minuteEnd) {
                lastDeviceStatus = deviceStatuses.get(deviceStatusIndex);
                if (lastDeviceStatus.timestamp() >= minuteStart) {
                    deviceStatusChanged = true;
                }
                deviceStatusIndex++;
            }
            double currentPoint = 0;
            boolean serviceRunning = true;
            boolean deviceRunning = minuteEnd <= currentTime && lastDeviceStatus.isScreenOn() && minuteEnd >= userJoinSeconds && !deviceStatusChanged;
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

    private long getStartOfHeartbeatInterval(long currentTime) {
        return currentTime - (currentTime % HEARTBEAT_INTERVAL);
    }
}