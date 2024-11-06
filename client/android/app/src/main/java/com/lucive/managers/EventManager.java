package com.lucive.managers;

import android.app.usage.UsageEvents;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.lucive.models.Event;
import com.lucive.utils.AppUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class EventManager {
    private final Map<String, List<Event>> eventsMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> activityMap = new ConcurrentHashMap<>(); // Map of activities running for each package
    private static final String PREFS_NAME = "EventManagerPrefs";
    private static final String EVENTS_MAP_KEY = "eventsMap";
    private static final String ACTIVITY_MAP_KEY = "activityMap";
    private final SharedPreferences sharedPreferences;

    public EventManager(Context context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public void processEvent(final String packageName, final long timestamp, int eventType, final String activity) {
        if (eventType == UsageEvents.Event.ACTIVITY_STOPPED) {
            eventType = UsageEvents.Event.MOVE_TO_BACKGROUND;
        }
        if (eventType == UsageEvents.Event.MOVE_TO_FOREGROUND || eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) {
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
            final Event newEvent = new Event(packageName, eventType, timestamp);
            if (!eventsMap.containsKey(packageName)) {
                eventsMap.put(packageName, new ArrayList<>());
            }
            List<Event> packageEvents = eventsMap.get(packageName);
            if (packageEvents.isEmpty()) {
                newEvent.setCumulatedScreentime(0);
            } else {
                Event lastEvent = packageEvents.get(packageEvents.size() - 1);
                if (lastEvent.getTimeStamp() >= timestamp || lastEvent.getEventType() == eventType) {
                    return;
                }
                Log.d("EventManager", "Event: " + packageName + " " + eventType + " " + timestamp);
                if (lastEvent.getEventType() == eventType) {
                    return;
                }
                newEvent.setCumulatedScreentime(eventType == UsageEvents.Event.MOVE_TO_FOREGROUND ? lastEvent.getCumulatedScreentime() : lastEvent.getCumulatedScreentime() + timestamp - lastEvent.getTimeStamp());
            }
            packageEvents.add(newEvent);
        }
    }

    public void clearOldEvents(final long thresholdTimestamp) {
        for (List<Event> packageEvents : eventsMap.values()) {
            Iterator<Event> iterator = packageEvents.iterator();
            while (iterator.hasNext()) {
                Event event = iterator.next();
                if (event.getTimeStamp() < thresholdTimestamp) {
                    iterator.remove();
                } else {
                    break; // Since the list is sorted, we can stop once we reach the threshold
                }
            }
        }
    }

    public void saveData() {
        clearOldEvents(AppUtils.getLastDayStart());
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(EVENTS_MAP_KEY, serializeEventsMap());
        editor.putString(ACTIVITY_MAP_KEY, serializeActivityMap());
        editor.apply();
    }

    public void loadData() {
        String eventsMapJson = sharedPreferences.getString(EVENTS_MAP_KEY, null);
        if (eventsMapJson != null) {
            deserializeEventsMap(eventsMapJson);
        }
        String activityMapJson = sharedPreferences.getString(ACTIVITY_MAP_KEY, null);
        if (activityMapJson != null) {
            deserializeActivityMap(activityMapJson);
        }
    }

    private String serializeEventsMap() {
        JSONObject jsonObject = new JSONObject();
        try {
            for (Map.Entry<String, List<Event>> entry : eventsMap.entrySet()) {
                JSONArray jsonArray = new JSONArray();
                for (Event event : entry.getValue()) {
                    JSONObject eventJson = new JSONObject();
                    eventJson.put("packageName", event.getPackageName());
                    eventJson.put("eventType", event.getEventType());
                    eventJson.put("timeStamp", event.getTimeStamp());
                    eventJson.put("cumulatedScreentime", event.getCumulatedScreentime());
                    jsonArray.put(eventJson);
                }
                jsonObject.put(entry.getKey(), jsonArray);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return jsonObject.toString();
    }

    private String serializeActivityMap() {
        JSONObject jsonObject = new JSONObject();
        try {
            for (Map.Entry<String, List<String>> entry : activityMap.entrySet()) {
                JSONArray jsonArray = new JSONArray();
                for (String activity : entry.getValue()) {
                    jsonArray.put(activity);
                }
                jsonObject.put(entry.getKey(), jsonArray);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return jsonObject.toString();
    }

    private void deserializeEventsMap(String jsonString) {
        try {
            JSONObject jsonObject = new JSONObject(jsonString);
            eventsMap.clear();
            Iterator<String> keys = jsonObject.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                JSONArray jsonArray = jsonObject.getJSONArray(key);
                List<Event> eventList = new ArrayList<>();
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject eventJson = jsonArray.getJSONObject(i);
                    Event event = new Event(
                            eventJson.getString("packageName"),
                            eventJson.getInt("eventType"),
                            eventJson.getLong("timeStamp")
                    );
                    event.setCumulatedScreentime(eventJson.getLong("cumulatedScreentime"));
                    eventList.add(event);
                }
                eventsMap.put(key, eventList);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void deserializeActivityMap(String jsonString) {
        try {
            JSONObject jsonObject = new JSONObject(jsonString);
            activityMap.clear();
            Iterator<String> keys = jsonObject.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                JSONArray jsonArray = jsonObject.getJSONArray(key);
                List<String> activityList = new ArrayList<>();
                for (int i = 0; i < jsonArray.length(); i++) {
                    activityList.add(jsonArray.getString(i));
                }
                activityMap.put(key, activityList);
            }
        } catch (JSONException e) {
            e.printStackTrace();
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
}