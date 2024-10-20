package com.zenvia.services;

import android.accessibilityservice.AccessibilityService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

public class AppUsageAccessibilityService extends AccessibilityService {

    private static final String TAG = "AppUsageAccessibilityService";
    private String lastPackageName = "";
    private boolean lastModal = false;
    
    private UsageTrackerService usageTrackerService;
    private boolean isBound = false;

    // ServiceConnection to manage the connection to UsageTrackerService
    private final ServiceConnection serviceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            UsageTrackerService.LocalBinder binder = (UsageTrackerService.LocalBinder) service;
            usageTrackerService = binder.getService();
            isBound = true;

        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBound = false;
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();

        // Bind to UsageTrackerService
        Intent intent = new Intent(this, UsageTrackerService.class);
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        // Unbind from UsageTrackerService
        if (isBound) {
            unbindService(serviceConnection);
            isBound = false;
        }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        int eventType = event.getEventType();
        String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
        if (!isBound || usageTrackerService == null) {
            Log.i(TAG, "UsageTracker service not bound");
            return;
        }
        if ((eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED || eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED)
                && !packageName.equals("com.android.systemui")
            && !(lastModal && packageName.equals("com.zenvia"))) {
            lastModal = false;
            if (!packageName.equals(lastPackageName)) {
                lastPackageName = packageName;
                if (usageTrackerService.isHourlyLimitExceeded(packageName) || usageTrackerService.isDailyLimitExceeded(packageName)) {
                    final Intent showScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
                    startService(showScreenTimeExceeded);
                    lastModal = true;
                }
                else {
                    final Intent showScreenTimeExceeded = new Intent(this, FloatingWindowService.class);
                    stopService(showScreenTimeExceeded);
                }
            }
        }
    }

    @Override
    public void onInterrupt() {
        // Handle interruptions
    }
}