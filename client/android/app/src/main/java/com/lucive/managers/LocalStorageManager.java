package com.lucive.managers;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.lucive.models.DeviceStatus;
import com.lucive.models.Rule;
import com.lucive.models.UsageTrackerHeartbeat;
import com.lucive.models.User;
import com.lucive.models.Word;
import com.lucive.utils.AppUtils;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

public class LocalStorageManager {
    private static LocalStorageManager instance;

    private final SharedPreferences sharedPreferences;
    private final Gson gson;
    private final Set<LocalStorageObserver> observers = new HashSet<>();
    private final HeartbeatDAO heartbeatDAO;
    private final DeviceStatusDAO deviceStatusDAO;
    private final AtomicLong lastHeartbeatCleanup = new AtomicLong(0);
    private final AtomicLong lastDeviceStatusCleanup = new AtomicLong(0);

    public static final String WORDS_KEY = "words";
    public static final String RULES_KEY = "rules";
    public static final String USER_KEY = "user";
    public static final String LAST_HEARTBEAT_CLEANUP_KEY = "last_heartbeat_cleanup";
    public static final String LAST_DEVICE_STATUS_CLEANUP_KEY = "last_device_status_cleanup";
    public static final long DAYS_10 = 10 * 24 * 60 * 60;

    private LocalStorageManager(Context context) {
        this.sharedPreferences = context.getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
        this.gson = new Gson();
        this.heartbeatDAO = new HeartbeatDAO(context);
        this.deviceStatusDAO = new DeviceStatusDAO(context);

        long lastHeartbeatCleanupTime = sharedPreferences.getLong(LAST_HEARTBEAT_CLEANUP_KEY, System.currentTimeMillis() / 1000);
        lastHeartbeatCleanup.set(lastHeartbeatCleanupTime);
        long lastDeviceStatusCleanupTime = sharedPreferences.getLong(LAST_DEVICE_STATUS_CLEANUP_KEY, System.currentTimeMillis() / 1000);
        lastDeviceStatusCleanup.set(lastDeviceStatusCleanupTime);
    }

    public static synchronized LocalStorageManager getInstance(Context context) {
        if (instance == null) {
            instance = new LocalStorageManager(context);
        }
        return instance;
    }

    public void addObserver(LocalStorageObserver observer) {
        observers.add(observer);
    }

    private void notifyObservers() {
        for (LocalStorageObserver observer : observers) {
            observer.onLocalStorageUpdated();
        }
    }

    public void setWords(List<Word> words) {
        String json = gson.toJson(words);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(WORDS_KEY, json);
        editor.apply();
        notifyObservers();
    }

    public List<Word> getWords() {
        String json = sharedPreferences.getString(WORDS_KEY, null);
        if (json != null) {
            Type type = new TypeToken<List<Word>>() {}.getType();
            return gson.fromJson(json, type);
        } else {
            return new ArrayList<>();
        }
    }

    public void setRules(List<Rule> rules) {
        String json = gson.toJson(rules);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(RULES_KEY, json);
        editor.apply();
        notifyObservers();
    }

    public List<Rule> getRules() {
        String json = sharedPreferences.getString(RULES_KEY, null);
        if (json != null) {
            Type type = new TypeToken<List<Rule>>() {}.getType();
            return gson.fromJson(json, type);
        } else {
            return new ArrayList<>();
        }
    }

    public void saveDeviceStatus(final DeviceStatus newDeviceStatus) {
        DeviceStatus lastDeviceStatus = deviceStatusDAO.getLastDeviceStatus();
        if (lastDeviceStatus == null || newDeviceStatus.timestamp() > lastDeviceStatus.timestamp()) {
            deviceStatusDAO.addDeviceStatus(newDeviceStatus);
            cleanOldDeviceStatuses();
        }
    }

    public List<DeviceStatus> getDeviceStatuses() {
        return deviceStatusDAO.getDeviceStatuses();
    }

    private void cleanOldDeviceStatuses() {
        if (System.currentTimeMillis() / 1000 - lastDeviceStatusCleanup.get() < DAYS_10) {
            return;
        }
        long cutoffTimeSeconds = AppUtils.getDayStartNDaysBefore(10) / 1000;
        deviceStatusDAO.deleteOldDeviceStatuses(cutoffTimeSeconds);
        lastDeviceStatusCleanup.set(System.currentTimeMillis() / 1000);
        sharedPreferences.edit().putLong(LAST_DEVICE_STATUS_CLEANUP_KEY, lastDeviceStatusCleanup.get()).apply();
    }

    public List<DeviceStatus> getDeviceStatuses(final String date) {
        final Calendar calendar = AppUtils.parseDate(date);
        final List<DeviceStatus> deviceStatuses = getDeviceStatuses();
        calendar.add(Calendar.DAY_OF_MONTH, -1);
        final long startOfDay = calendar.getTimeInMillis() / 1000;
        calendar.add(Calendar.DAY_OF_MONTH, 2);
        final long endOfDay = calendar.getTimeInMillis() / 1000;
        List<DeviceStatus> filteredDeviceStatuses = new ArrayList<>();
        for (DeviceStatus deviceStatus : deviceStatuses) {
            if (deviceStatus.timestamp() >= startOfDay && deviceStatus.timestamp() < endOfDay) {
                filteredDeviceStatuses.add(deviceStatus);
            }
        }
        return filteredDeviceStatuses;
    }


    public void saveHeartbeat(final UsageTrackerHeartbeat heartbeat) {
        heartbeatDAO.addHeartbeat(heartbeat);
        cleanOldHeartbeats();
    }

    public List<UsageTrackerHeartbeat> getHeartbeats() {
        return heartbeatDAO.getHeartbeats();
    }

    public List<UsageTrackerHeartbeat> getHeartbeats(final String date) {
        final Calendar calendar = AppUtils.parseDate(date);
        final List<UsageTrackerHeartbeat> heartbeats = getHeartbeats();
        final long startOfDay = calendar.getTimeInMillis() / 1000;
        calendar.add(Calendar.DAY_OF_MONTH, 1);
        final long endOfDay = calendar.getTimeInMillis() / 1000;
        List<UsageTrackerHeartbeat> filteredHeartbeats = new ArrayList<>();
        for (UsageTrackerHeartbeat heartbeat : heartbeats) {
            if (heartbeat.timestamp() >= startOfDay && heartbeat.timestamp() < endOfDay) {
                filteredHeartbeats.add(heartbeat);
            }
        }

        return filteredHeartbeats;
    }

    private void cleanOldHeartbeats() {
        if (System.currentTimeMillis() / 1000 - lastHeartbeatCleanup.get() < DAYS_10) {
            return;
        }
        long cutoffTimeSeconds = AppUtils.getDayStartNDaysBefore(10) / 1000;
        heartbeatDAO.deleteOldHeartbeats(cutoffTimeSeconds);
        lastHeartbeatCleanup.set(System.currentTimeMillis() / 1000);
        sharedPreferences.edit().putLong(LAST_HEARTBEAT_CLEANUP_KEY, lastHeartbeatCleanup.get()).apply();
    }

    public void setUser(final User user) {
        String json = gson.toJson(user);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(USER_KEY, json);
        editor.apply();
        notifyObservers();
    }

    public User getUser() {
        String json = sharedPreferences.getString(USER_KEY, null);
        if (json != null) {
            return gson.fromJson(json, User.class);
        } else {
            return null;
        }
    }

    public void clearUser() {
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.remove(USER_KEY);
        editor.apply();
        notifyObservers();
    }
}