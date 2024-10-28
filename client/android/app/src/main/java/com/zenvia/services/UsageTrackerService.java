package com.zenvia.services;

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
import com.zenvia.managers.EventManager;
import com.zenvia.models.Rule;
import com.zenvia.utils.AppUtils;

import java.util.Calendar;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class UsageTrackerService extends Service {
    private final Map<String, Rule> ruleMap = new ConcurrentHashMap<>();
    private UsageStatsManager usageStatsManager;
    private final String TAG = "UsageTrackerService";
    private final IBinder binder = new LocalBinder();
    private Handler handler;
    private Runnable trackingRunnable;
    private Runnable saveRunnable;
    private static final long INTERVAL = 3 * 1000;
    private static final long SAVE_INTERVAL = 10 * 60 * 1000;
    private static final String CHANNEL_ID = "AppUsageTrackingChannel";

    private EventManager eventManager;

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
        usageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        eventManager = new EventManager(this);
        eventManager.loadData(); // Load data on service start
        Log.i(TAG, "Service created");
        startForeground(1, createNotification());
        startTracking();
        startSavingData(); // Start periodic data saving
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
        handler.removeCallbacks(saveRunnable);
        eventManager.saveData(); // Save data on service destroy
        Log.i(TAG, "Service destroyed");
        super.onDestroy();
    }

    private Notification createNotification() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "App Usage Tracking", NotificationManager.IMPORTANCE_LOW
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
                handler.postDelayed(this, INTERVAL);
            }
        };
        handler.post(trackingRunnable);
    }

    private void startSavingData() {
        handler = new Handler(Looper.getMainLooper());
        saveRunnable = new Runnable() {
            @Override
            public void run() {
                eventManager.saveData();
                handler.postDelayed(this, SAVE_INTERVAL);
            }
        };
        handler.post(saveRunnable);
    }

    private void checkScreenUsages() {
        final long endTime = System.currentTimeMillis();
        long startTime = endTime - 5 * 1000; // to avoid missing events
        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        UsageEvents.Event event = new UsageEvents.Event();

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event);
            eventManager.processEvent(event.getPackageName(), event.getTimeStamp(), event.getEventType());
        }

        final String packageName = eventManager.getCurrentlyOpenedApp();
        if (isHourlyLimitExceeded(packageName) || isDailyLimitExceeded(packageName)) {
            final Intent showScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
            startService(showScreenTimeExceeded);
        } else {
            final Intent hideScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
            stopService(hideScreenTimeExceeded);
        }
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
        final Rule rule = ruleMap.get(packageName);
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

    public boolean isHourlyLimitExceeded(final String packageName) {
        Rule rule = ruleMap.get(packageName);
        if (rule == null || !rule.isActive()) {
            return false;
        }
        final int hourlyUsage = getHourlyScreentime(packageName);
        return hourlyUsage >= rule.hourlyMaxSeconds();
    }

    public boolean isDailyLimitExceeded(final String packageName) {
        Rule rule = ruleMap.get(packageName);
        if (rule == null || !rule.isActive()) {
            return false;
        }
        final int dailyUsage = getDailyScreentime(packageName);
        return dailyUsage >= rule.dailyMaxSeconds();
    }

    public void updateRules(final Map<String, Rule> newRules) {
        ruleMap.clear();
        ruleMap.putAll(newRules);
    }
}