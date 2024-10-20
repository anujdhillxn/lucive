package com.zenvia.services;

import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;

import com.zenvia.rules.ScreentimeRule;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class UsageTrackerService extends Service {

    private final Map<String, Integer> hourlyScreentimeMap = new HashMap<>();
    private final Map<String, Integer> dailyScreentimeMap = new HashMap<>();
    private final Map<String, ScreentimeRule> ruleMap = new HashMap<>();
    private UsageStatsManager usageStatsManager;
    private final String TAG = "UsageTrackerService";
    private final IBinder binder = new LocalBinder();

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
        Log.i(TAG, "Service created");
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
        super.onDestroy();
        Log.i(TAG, "Service destroyed");
    }

    public int getHourlyScreentime(final String packageName) {
        long currentTime = System.currentTimeMillis();
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        long startOfCurrentHour = calendar.getTimeInMillis();
        return getScreentimeUsingEvents(startOfCurrentHour, currentTime, packageName);
    }

    public int getDailyScreentime(final String packageName) {
        final ScreentimeRule rule = ruleMap.get(packageName);
        if (rule == null) {
            return 0;
        }
        final Calendar dailyReset = rule.getDailyStartsAt();
        long resetTime = dailyReset.getTimeInMillis();
        long currentTime = System.currentTimeMillis();
        if (resetTime > currentTime) {
           dailyReset.add(Calendar.DAY_OF_MONTH, -1);
        }
        long startTime = dailyReset.getTimeInMillis();
        return getScreentimeUsingEvents(startTime, currentTime, packageName);
        
    }

    public boolean isHourlyLimitExceeded (final String packageName) {
        ScreentimeRule rule = ruleMap.get(packageName);
        if (rule == null) {
            return false;
        }
        final int hourlyUsage = getHourlyScreentime(packageName);
        return hourlyUsage >= rule.getHourlyMaxSeconds();
    }

    public boolean isDailyLimitExceeded(final String packageName) {
        ScreentimeRule rule = ruleMap.get(packageName);
        if(rule == null) {
            return false;
        }
        final int dailyUsage = getDailyScreentime(packageName);
        return dailyUsage >= rule.getDailyMaxSeconds();
    }

    public void updateRules(final Map<String, ScreentimeRule> newRules) {
        ruleMap.clear();
        ruleMap.putAll(newRules);
    }

    private int getScreentimeUsingEvents(long startTime, long endTime, final String packageName) { // not perfect
        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        long totalTimeInForeground = 0;
        long lastForegroundTime = -1;
        Log.i(TAG, String.format("checking %s 's usage from %s to %s", packageName, new Date(startTime), new Date(endTime)));
        UsageEvents.Event event = new UsageEvents.Event();

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event);

            if (packageName.equals(event.getPackageName())) {
                if(packageName.equals("co.hinge.app"))
                if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    // Record the time when the app moves to the foreground
                    lastForegroundTime = event.getTimeStamp();
                } else if (event.getEventType() == UsageEvents.Event.MOVE_TO_BACKGROUND && lastForegroundTime != -1) {
                    // Add the time spent in foreground if we had a previous foreground event
                    totalTimeInForeground += (event.getTimeStamp() - lastForegroundTime);
                    lastForegroundTime = -1; // Reset foreground time after calculating
                }
            }
        }

        // In case the app is still in the foreground at the end of the queried period
        if (lastForegroundTime != -1) {
            totalTimeInForeground += (endTime - lastForegroundTime);
        }

        // Return the total time in foreground in seconds
        return (int) (totalTimeInForeground / 1000);
    }

}
