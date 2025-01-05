package com.lucive.modules;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.lucive.BuildConfig;

public class BuildConfigModule extends ReactContextBaseJavaModule {
    public BuildConfigModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BuildConfigModule";
    }

    @ReactMethod
    public void getApiUrl(Callback callback) {
        callback.invoke(BuildConfig.API_URL);
    }
}