package com.lucive.modules;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.lucive.managers.LocalStorageManager;
import com.lucive.models.Rule;
import com.lucive.models.User;
import com.lucive.models.Word;
import com.lucive.utils.AppUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LocalStorageModule extends ReactContextBaseJavaModule {

    public LocalStorageModule(ReactApplicationContext context) {
        super(context);
    }

    @ReactMethod
    public void setWords(ReadableArray words, Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        final List<Word> wordsList = new ArrayList<>();
        for (int i = 0; i < words.size(); i++) {
            ReadableMap word = words.getMap(i);
            wordsList.add(new Word(
                    word.getString("word"),
                    word.getString("meaning"),
                    word.getString("usage"),
                    word.getInt("difficulty")
            ));
        }
        localStorageManager.setWords(wordsList);
        promise.resolve(true);
    }

    @ReactMethod
    public void setRules(ReadableArray screentimeRules, Promise promise) {
        final List<Rule> rulesList = new ArrayList<>();
        for (int i = 0; i < screentimeRules.size(); i++) {
            final ReadableMap map = screentimeRules.getMap(i);
            try {
                final Rule screentimeRule = parseRule(map);
                rulesList.add(screentimeRule);
            } catch (Exception e) {
                promise.reject("Error", e.getMessage());
            }
        }
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        localStorageManager.setRules(rulesList);
    }

    @ReactMethod
    public void getRules(Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        final List<Rule> rules = localStorageManager.getRules();
        WritableArray rulesArray = Arguments.createArray();
        for (Rule rule : rules) {
            WritableMap ruleMap = Arguments.createMap();
            ruleMap.putString("app", rule.app());
            ruleMap.putString("appDisplayName", rule.appDisplayName());
            ruleMap.putBoolean("isActive", rule.isActive());
            ruleMap.putInt("dailyMaxSeconds", rule.dailyMaxSeconds());
            ruleMap.putInt("hourlyMaxSeconds", rule.hourlyMaxSeconds());
            ruleMap.putInt("sessionMaxSeconds", rule.sessionMaxSeconds());
            ruleMap.putBoolean("isDailyMaxSecondsEnforced", rule.isDailyMaxSecondsEnforced());
            ruleMap.putBoolean("isHourlyMaxSecondsEnforced", rule.isHourlyMaxSecondsEnforced());
            ruleMap.putBoolean("isSessionMaxSecondsEnforced", rule.isSessionMaxSecondsEnforced());
            ruleMap.putString("dailyReset", rule.dailyStartsAt());
            ruleMap.putBoolean("isStartupDelayEnabled", rule.isStartupDelayEnabled());
            ruleMap.putBoolean("isMyRule", rule.isMyRule());
            ruleMap.putBoolean("isTemporary", rule.isTemporary());
            ruleMap.putString("validTill", AppUtils.convertEpochToIso(rule.validTill()));
            rulesArray.pushMap(ruleMap);
        }
        promise.resolve(rulesArray);
    }

    private Rule parseRule(ReadableMap map) {
        final boolean isActive = map.getBoolean("isActive");
        final String app = map.getString("app");
        final String appDisplayName = map.getString("appDisplayName");
        final int dailyMaxSeconds = map.getInt("dailyMaxSeconds");
        final int hourlyMaxSeconds = map.getInt("hourlyMaxSeconds");
        final int sessionMaxSeconds = map.getInt("sessionMaxSeconds");
        final boolean isDailyMaxSecondsEnforced = map.getBoolean("isDailyMaxSecondsEnforced");
        final boolean isHourlyMaxSecondsEnforced = map.getBoolean("isHourlyMaxSecondsEnforced");
        final boolean isSessionMaxSecondsEnforced = map.getBoolean("isSessionMaxSecondsEnforced");
        final String dailyStartsAt = map.getString("dailyReset");
        final boolean isStartupDelayEnabled = map.getBoolean("isStartupDelayEnabled");
        final boolean isMyRule = map.getBoolean("isMyRule");
        final boolean isTemporary = map.getBoolean("isTemporary");
        final String validTill = map.getString("validTill");
        return new Rule(app, appDisplayName, isActive, dailyMaxSeconds, hourlyMaxSeconds,
                sessionMaxSeconds, dailyStartsAt, isDailyMaxSecondsEnforced,
                isHourlyMaxSecondsEnforced, isSessionMaxSecondsEnforced, isStartupDelayEnabled,
                isMyRule, isTemporary, AppUtils.convertIsoToEpoch(validTill));
    }
    @ReactMethod
    public void setUser(ReadableMap userMap, Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        final User user = new User(
                userMap.getString("username"),
                userMap.getString("email"),
                userMap.getString("invitationToken"),
                userMap.getString("dateJoinedSeconds")
        );
        localStorageManager.setUser(user);
        promise.resolve(true);
    }
    @ReactMethod
    public void getUser(Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        final User user = localStorageManager.getUser();
        if (user == null) {
            promise.reject("Error", "User not found");
            return;
        }
        WritableMap userMap = Arguments.createMap();
        userMap.putString("username", user.username());
        userMap.putString("email", user.email());
        userMap.putString("invitationToken", user.invitationToken());
        userMap.putString("dateJoinedSeconds", String.valueOf(user.dateJoinedSeconds()));
        promise.resolve(userMap);
    }
    @ReactMethod
    public void clearUser(Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        localStorageManager.clearUser();
        promise.resolve(true);
    }

    @ReactMethod
    public void getRequestToken(Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        promise.resolve(localStorageManager.getRequestToken());
    }

    @ReactMethod
    public void setRequestToken(String requestToken, Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        localStorageManager.setRequestToken(requestToken);
        promise.resolve(true);
    }

    @ReactMethod
    public void clearRequestToken(Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        localStorageManager.clearRequestToken();
        promise.resolve(true);
    }

    @NonNull
    @Override
    public String getName() {
        return "LocalStorageModule";
    }
}