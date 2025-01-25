package com.lucive.managers;

import android.app.usage.UsageEvents;
import android.content.Context;
import android.os.Build;
import android.util.Log;

import com.lucive.models.DeviceStatus;
import com.lucive.models.Event;
import com.lucive.utils.AppUtils;


import java.util.ArrayList;
import java.util.Date;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

public class EventManager {
    private final Map<String, List<Event>> eventsMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> activityMap = new ConcurrentHashMap<>();
    private final AtomicBoolean isScreenOn = new AtomicBoolean(true);
    private final Deque<Event> allEvents = new ConcurrentLinkedDeque<>();
    private final AtomicLong screenOnLastTimestamp = new AtomicLong(AppUtils.get24HoursBefore());
    private final String TAG = "EventManager";
    private final LocalStorageManager localStorageManager;
    private static EventManager instance;

    private EventManager(final Context context) {
        localStorageManager = LocalStorageManager.getInstance(context);
    }

    public static synchronized EventManager getInstance(final Context context) {
        if (instance == null) {
            instance = new EventManager(context);
        }
        return instance;
    }

    public void processEvent(final String packageName, final long timestamp, int eventType, final String activity) {
        if (eventType == UsageEvents.Event.SCREEN_NON_INTERACTIVE) {
            isScreenOn.set(false);
            localStorageManager.saveDeviceStatus(new DeviceStatus(timestamp / 1000, false));
            return;
        }
        if (eventType == UsageEvents.Event.SCREEN_INTERACTIVE) {
            isScreenOn.set(true);
            screenOnLastTimestamp.set(timestamp);
            localStorageManager.saveDeviceStatus(new DeviceStatus(timestamp / 1000, true));
            return;
        }
        if (eventType == UsageEvents.Event.ACTIVITY_STOPPED) {
            eventType = UsageEvents.Event.MOVE_TO_BACKGROUND;
        }
        if (packageName.equals("android")) {
            return;
        }
        if (!activityMap.containsKey(packageName)) {
            activityMap.put(packageName, new ArrayList<>());
        }

        List<String> packageActivities = activityMap.get(packageName);
        final boolean isOpening = eventType == UsageEvents.Event.MOVE_TO_FOREGROUND && packageActivities.isEmpty();
        if (eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
            if (!packageActivities.contains(activity)) {
                packageActivities.add(activity);
            }
        } else {
            packageActivities.remove(activity);
        }
        final boolean isClosing = eventType == UsageEvents.Event.MOVE_TO_BACKGROUND && packageActivities.isEmpty();
        if (!isOpening && !isClosing) {
            return;
        }
        final Event newEvent = new Event(packageName, eventType, timestamp, activity);

        if (!eventsMap.containsKey(packageName)) {
            eventsMap.put(packageName, new ArrayList<>());
        }
        List<Event> packageEvents = eventsMap.get(packageName);
        if (packageEvents.isEmpty()) {
            newEvent.setCumulatedScreentime(0);
        } else {
            Event lastEvent = packageEvents.get(packageEvents.size() - 1);
            assert lastEvent.getTimeStamp() <= timestamp;
            if (lastEvent.getEventType() == eventType) {
                return;
            }
            newEvent.setCumulatedScreentime(eventType == UsageEvents.Event.MOVE_TO_FOREGROUND ? lastEvent.getCumulatedScreentime() : lastEvent.getCumulatedScreentime() + timestamp - lastEvent.getTimeStamp());
        }
        if (checkSessionContinuation(packageEvents, newEvent)) {
            return;
        }
        packageEvents.add(newEvent);
        allEvents.add(newEvent);
        //clear events older than a day
        final long twentyFourHoursBefore = AppUtils.get24HoursBefore();
        while (!packageEvents.isEmpty() && packageEvents.get(0).getTimeStamp() < twentyFourHoursBefore) {
            packageEvents.remove(0);
        }
        while (!allEvents.isEmpty() && allEvents.peekFirst().getTimeStamp() < twentyFourHoursBefore) {
            allEvents.removeFirst();
        }
    }

    private boolean checkSessionContinuation(final List<Event> packageEvents, final Event newEvent) {
        if (!packageEvents.isEmpty() && !allEvents.isEmpty()) {
            final Event lastEvent = allEvents.peekLast();
            if (lastEvent.getEventType() == UsageEvents.Event.ACTIVITY_PAUSED
                    && lastEvent.getTimeStamp() > screenOnLastTimestamp.get()
                    && newEvent.getPackageName().equals(lastEvent.getPackageName())
                    && newEvent.getEventType() == UsageEvents.Event.ACTIVITY_RESUMED
            ) {
                packageEvents.remove(packageEvents.size() - 1);
                allEvents.removeLast();
                Log.d(TAG, "Session continued for " + newEvent.getPackageName());
                return true;
            }
        }
        return false;
    }


    public String getCurrentlyOpenedApp() {
        String currentApp = AppUtils.UNKNOWN_PACKAGE;
        long latestTimestamp = 0;

        for (Map.Entry<String, List<Event>> entry : eventsMap.entrySet()) {
            List<Event> packageEvents = entry.getValue();
            if (!packageEvents.isEmpty()) {
                Event lastEvent = packageEvents.get(packageEvents.size() - 1);
                if (lastEvent.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND && lastEvent.getTimeStamp() > latestTimestamp) {
                    currentApp = entry.getKey();
                    latestTimestamp = lastEvent.getTimeStamp();
                }
            }
        }
        return currentApp;
    }

    public List<Event> getEvents(final String packageName) {
        if (eventsMap.containsKey(packageName)) {
            return eventsMap.get(packageName);
        }
        return new ArrayList<>();
    }

    public List<String> openApps() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                return activityMap.keySet().stream().filter(packageName -> {
                    List<Event> packageActivities = eventsMap.get(packageName);
                    return !packageActivities.isEmpty() && packageActivities.get(packageActivities.size() - 1).getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND;
                }).toList();
            }
        }
        return new ArrayList<>();
    }

    public boolean isScreenOn() {
        return isScreenOn.get();
    }
}