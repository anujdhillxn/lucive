package com.lucive.modules;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;
import android.util.Pair;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.lucive.services.UsageTrackerService;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

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
    public void getUsageTrackingPoints(final String date, Promise promise) {
        if (!isBound) {
            promise.reject("Service Error", "UsageTrackerService not bound");
            return;
        }

        final Pair<Double, Boolean> score = usageTrackerService.calculateUsageTrackingPoints(date);
        final WritableMap result = Arguments.createMap();
        result.putDouble("points", score.first);
        result.putBoolean("uninterruptedTracking", score.second);
        promise.resolve(score);
    }
}
