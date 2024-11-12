package com.lucive.modules;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;

import com.lucive.models.Rule;
import com.lucive.services.UsageTrackerService;
import com.lucive.utils.AppUtils;
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
        final Map<String, Rule> ruleMap = new HashMap<>();
        for (int i = 0; i < screentimeRules.size(); i++) {
            final ReadableMap map = screentimeRules.getMap(i);
            try {
                final Rule screentimeRule = parseRule(map);
                ruleMap.put(screentimeRule.app(), screentimeRule);
            } catch (Exception e) {
                promise.reject("Error", e.getMessage());
            }
        }
        if (usageTrackerService != null) {
            usageTrackerService.updateRules(ruleMap);
            promise.resolve("Rules set");
        } else {
            promise.reject("Service Error", "UsageTrackerService not bound");
        }
    }

    private Rule parseRule(ReadableMap map) {
        final boolean isActive = map.getBoolean("isActive");
        final String app = map.getString("app");
        final int dailyMaxSeconds = map.getInt("dailyMaxSeconds");
        final int hourlyMaxSeconds = map.getInt("hourlyMaxSeconds");
        final int sessionMaxSeconds = map.getInt("sessionMaxSeconds");
        final boolean isDailyMaxSecondsEnforced = map.getBoolean("isDailyMaxSecondsEnforced");
        final boolean isHourlyMaxSecondsEnforced = map.getBoolean("isHourlyMaxSecondsEnforced");
        final boolean isSessionMaxSecondsEnforced = map.getBoolean("isSessionMaxSecondsEnforced");
        final String dailyStartsAt = map.getString("dailyReset");
        final boolean isStartupDelayEnabled = map.getBoolean("isStartupDelayEnabled");
        return new Rule(app, isActive, dailyMaxSeconds, hourlyMaxSeconds, sessionMaxSeconds, dailyStartsAt, isDailyMaxSecondsEnforced, isHourlyMaxSecondsEnforced, isSessionMaxSecondsEnforced, isStartupDelayEnabled);
    }
}
