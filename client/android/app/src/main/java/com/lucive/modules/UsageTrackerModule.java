package com.lucive.modules;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;
import android.util.Pair;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.lucive.managers.EventManager;
import com.lucive.managers.RulesManager;
import com.lucive.models.Event;
import com.lucive.models.UsageTrackerIntervalScore;
import com.lucive.services.UsageTrackerService;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;

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
        final EventManager eventManager = EventManager.getInstance(getReactApplicationContext());
        final List<Event> events = eventManager.getEvents(packageName);
        int screenTime = events.isEmpty() ? 0 : usageTrackerService.getHourlyScreentime(events);
        promise.resolve(screenTime);
    }

    @ReactMethod
    public void getDailyScreenTime(String packageName, Promise promise) {
        if (!isBound) {
            promise.reject("Service Error", "UsageTrackerService not bound");
            return;
        }
        final EventManager eventManager = EventManager.getInstance(getReactApplicationContext());
        final RulesManager rulesManager = RulesManager.getInstance(getReactApplicationContext());
        final List<Event> events = eventManager.getEvents(packageName);
        int screenTime = events.isEmpty() ? 0 : usageTrackerService.getDailyScreentime(rulesManager.getRule(packageName), events);
        promise.resolve(screenTime);
    }

    @ReactMethod
    public void getUsageTrackingPoints(final String date, Promise promise) {
        if (!isBound) {
            promise.reject("Service Error", "UsageTrackerService not bound");
            return;
        }
        try {
            final Pair<Double, Boolean> score = usageTrackerService.calculateUsageTrackingPoints(date);
            final WritableMap result = Arguments.createMap();
            result.putDouble("points", score.first);
            result.putBoolean("uninterruptedTracking", score.second);
            promise.resolve(result);
        }
        catch (Exception e) {
            promise.reject("Error", e.getMessage());
        }
    }

    @ReactMethod
    public void getIntervalScores(final String date, Promise promise) {
        if (!isBound) {
            promise.reject("Service Error", "UsageTrackerService not bound");
            return;
        }
        try {
            final List<UsageTrackerIntervalScore> scores = usageTrackerService.getIntervalScores(date);
            final WritableArray result = Arguments.createArray();
            for (UsageTrackerIntervalScore score : scores) {
                final WritableMap scoreMap = Arguments.createMap();
                scoreMap.putInt("minuteOfDay", score.minuteOfDay());
                scoreMap.putDouble("points", score.points());
                scoreMap.putBoolean("serviceRunning", score.serviceRunning());
                scoreMap.putBoolean("deviceRunning", score.deviceRunning());
                result.pushMap(scoreMap);
            }
            promise.resolve(result);
        }
        catch (Exception e) {
            promise.reject("Error", e.getMessage());
        }
    }
}
