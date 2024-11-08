package com.lucive.managers;

import android.app.usage.UsageEvents;
import android.util.Log;

import com.lucive.models.Event;
import com.lucive.utils.AppUtils;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class EventManager {
    private final Map<String, List<Event>> eventsMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> activityMap = new ConcurrentHashMap<>();
    private long lastTimestamp = AppUtils.get24HoursBefore();

    public void processEvent(final String packageName, final long timestamp, int eventType, final String activity) {
        if (eventType == UsageEvents.Event.ACTIVITY_STOPPED) {
            eventType = UsageEvents.Event.MOVE_TO_BACKGROUND;
        }
        if (eventType == UsageEvents.Event.MOVE_TO_FOREGROUND || eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) {
            lastTimestamp = timestamp;
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
                if (lastEvent.getEventType() == UsageEvents.Event.MOVE_TO_BACKGROUND && eventType == UsageEvents.Event.MOVE_TO_FOREGROUND && timestamp - lastEvent.getTimeStamp() <= 1000) {
                    packageEvents.remove(packageEvents.size() - 1); // continue the session
                    return;
                }
                newEvent.setCumulatedScreentime(eventType == UsageEvents.Event.MOVE_TO_FOREGROUND ? lastEvent.getCumulatedScreentime() : lastEvent.getCumulatedScreentime() + timestamp - lastEvent.getTimeStamp());
            }
            packageEvents.add(newEvent);
        }
    }


    public String getCurrentlyOpenedApp() {
        String currentApp = "Unknown";
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

    public long getScreentime(final long startTime, final long endTime, final String packageName) {
        if (!eventsMap.containsKey(packageName)) {
            return 0;
        }
        List<Event> packageEvents = eventsMap.get(packageName);
        Event lastEventBeforeEnd = AppUtils.getLastEventBeforeOrEqual(packageEvents, endTime);
        if (lastEventBeforeEnd == null) {
            return 0;
        }
        long screentime = lastEventBeforeEnd.getCumulatedScreentime();
        if (lastEventBeforeEnd.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
            screentime += endTime - lastEventBeforeEnd.getTimeStamp();
        }
        Event lastEventBeforeStart = AppUtils.getLastEventBefore(packageEvents, startTime);
        if (lastEventBeforeStart != null) {
            screentime -= lastEventBeforeStart.getCumulatedScreentime();
            if (lastEventBeforeStart.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                screentime -= startTime - lastEventBeforeStart.getTimeStamp();
            }
        }
        return screentime;
    }

    public long getSessionTime(final String packageName) {
        if (!eventsMap.containsKey(packageName)) {
            return 0;
        }
        List<Event> packageEvents = eventsMap.get(packageName);
        if (packageEvents.isEmpty()) {
            return 0;
        }
        Event lastEvent = packageEvents.get(packageEvents.size() - 1);
        if (lastEvent.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
            return System.currentTimeMillis() - lastEvent.getTimeStamp();
        }
        return 0;
    }

    public long getLastTimestamp() {
        return lastTimestamp;
    }
}