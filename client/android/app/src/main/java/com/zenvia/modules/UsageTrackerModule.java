package com.zenvia.modules;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;

import com.zenvia.rules.ScreentimeRule;
import com.zenvia.services.UsageTrackerService;
import com.zenvia.utils.AppUtils;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

public class UsageTrackerModule extends ReactContextBaseJavaModule {

    private UsageTrackerService usageTrackerService;
    private boolean isBound = false;
    private final String TAG = "UsageTrackerModule";

    // ServiceConnection to manage the connection to UsageTrackerService
    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            UsageTrackerService.LocalBinder binder = (UsageTrackerService.LocalBinder) service;
            usageTrackerService = binder.getService();
            isBound = true;
            Log.i(TAG, "UsageTrackerService connected");
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBound = false;
            Log.i(TAG, "UsageTrackerService disconnected");
        }
    };

    UsageTrackerModule(ReactApplicationContext context) {
        super(context);
        bindUsageTrackerService();
    }

    @Override
    public String getName() {
        return "UsageTracker";
    }

    // Method to bind to UsageTrackerService
    private void bindUsageTrackerService() {
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, UsageTrackerService.class);
        context.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }

    // Unbind the service when the module is destroyed
    @Override
    public void invalidate() {  // Use invalidate() instead of onCatalystInstanceDestroy()
        super.invalidate();
        if (isBound) {
            getReactApplicationContext().unbindService(serviceConnection);
            isBound = false;
            Log.i(TAG, "UsageTrackerService unbound in invalidate()");
        }
    }

    @ReactMethod
    public void getHourlyScreenTime(String packageName, Promise promise) {
        if (!isBound) {
            promise.reject("Service Error", "UsageTrackerService not bound");
            return;
        }

        int screenTime = usageTrackerService.getHourlyScreentime(packageName);
        promise.resolve(screenTime);
    }

    @ReactMethod
    public void getDailyScreenTime(String packageName, Promise promise) {
        if (!isBound) {
            promise.reject("Service Error", "UsageTrackerService not bound");
            return;
        }

        int screenTime = usageTrackerService.getDailyScreentime(packageName);
        promise.resolve(screenTime);
    }

    @ReactMethod
    public void setRules(ReadableArray screentimeRules, Promise promise) {
        final Map<String, ScreentimeRule> ruleMap = new HashMap<>();
        for (int i = 0; i < screentimeRules.size(); i++) {
            final ReadableMap map = screentimeRules.getMap(i);
            try {
                final ScreentimeRule screentimeRule = parseRule(map);
                ruleMap.put(screentimeRule.getApp(), screentimeRule);
            } catch (Exception e) {
                promise.reject("Error", e.getMessage());
            }
        }
        usageTrackerService.updateRules(ruleMap);
        promise.resolve("Rules set");
    }

    private ScreentimeRule parseRule(ReadableMap map) {
        final boolean isActive = map.getBoolean("isActive");
        final String app = map.getString("app");
        final String ruleType = map.getString("ruleType");
        assert (AppUtils.RuleType.SCREENTIME.toString().equals(ruleType));
        final ReadableMap details = map.getMap("details");
        assert details != null;
        final int dailyMaxSeconds = details.getInt("dailyMaxSeconds");
        final int hourlyMaxSeconds = details.getInt("hourlyMaxSeconds");
        final Calendar dailyStartsAt = AppUtils.parseISO8601String(details.getString("dailyStartsAt"));
        return new ScreentimeRule(isActive, app, dailyMaxSeconds, hourlyMaxSeconds, dailyStartsAt);
    }
}