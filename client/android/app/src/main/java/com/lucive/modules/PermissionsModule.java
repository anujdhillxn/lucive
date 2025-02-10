package com.lucive.modules;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class PermissionsModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "PermissionsModule";

    public PermissionsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) getReactApplicationContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(), getReactApplicationContext().getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private boolean hasOverlayPermission() {
        return Settings.canDrawOverlays(getReactApplicationContext());
    }

    @ReactMethod
    public void requestUsageStatsPermission(Promise promise) {
        if (hasUsageStatsPermission()) {
            promise.resolve(true); // Permission already granted
        } else {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS,
                    Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(false); // Permission request initiated
        }
    }

    // Method to request usage stats permission
    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        if (hasOverlayPermission()) {
            promise.resolve(true); // Permission already granted
        } else {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(false); // Permission request initiated
        }
    }

    @ReactMethod
    public void hasUsageStatsPermission(Promise promise) {
        promise.resolve(hasUsageStatsPermission());
    }

    @ReactMethod
    public void hasOverlayPermission(Promise promise) {
        promise.resolve(hasOverlayPermission());
    }
}
