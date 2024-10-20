package com.zenvia.modules;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.util.Base64;

import com.zenvia.utils.AppUtils;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class InstalledAppsModule extends ReactContextBaseJavaModule {

    public InstalledAppsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "InstalledApps";
    }

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = getReactApplicationContext().getPackageManager();
            List<ApplicationInfo> apps = pm.getInstalledApplications(PackageManager.GET_META_DATA);

            List<ApplicationInfo> targetApps = new ArrayList<>();

            for (ApplicationInfo app : apps) {
                for (String packageName : AppUtils.TARGET_PACKAGES) {
                    if (app.packageName.equals(packageName) && (app.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                        targetApps.add(app);
                    }
                }
            }
            Collections.sort(targetApps, new Comparator<ApplicationInfo>() {
                @Override
                public int compare(ApplicationInfo app1, ApplicationInfo app2) {
                    String label1 = pm.getApplicationLabel(app1).toString();
                    String label2 = pm.getApplicationLabel(app2).toString();
                    return label1.compareToIgnoreCase(label2);
                }
            });
            WritableArray array = Arguments.createArray();
            for (ApplicationInfo app : targetApps) {
                WritableMap appInfo = Arguments.createMap();
                appInfo.putString("packageName", app.packageName);
                appInfo.putString("displayName", pm.getApplicationLabel(app).toString());
                Drawable icon = pm.getApplicationIcon(app);
                Bitmap bitmap = drawableToBitmap(icon);
                String iconBase64 = bitmapToBase64(bitmap);
                appInfo.putString("icon", iconBase64);
                array.pushMap(appInfo);
            }
            promise.resolve(array);
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    private Bitmap drawableToBitmap(Drawable drawable) {
        if (drawable instanceof BitmapDrawable) {
            return ((BitmapDrawable) drawable).getBitmap();
        }
        Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
        drawable.draw(canvas);
        return bitmap;
    }

    private String bitmapToBase64(Bitmap bitmap) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.NO_WRAP);
    }
}
