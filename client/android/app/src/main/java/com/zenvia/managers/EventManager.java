package com.zenvia.managers;

import android.app.usage.UsageEvents;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.zenvia.models.Event;
import com.zenvia.utils.AppUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class EventManager {
    private final Map<String, List<Event>> eventsMap = new ConcurrentHashMap<>();
    private static final String PREFS_NAME = "EventManagerPrefs";
    private static final String EVENTS_MAP_KEY = "eventsMap";
    private final SharedPreferences sharedPreferences;

    public EventManager(Context context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public void processEvent(final String packageName, final long timestamp, final int eventType) {
        if (eventType == UsageEvents.Event.MOVE_TO_FOREGROUND || eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) {
            final Event newEvent = new Event(packageName, eventType, timestamp);
            if (!eventsMap.containsKey(packageName)) {
                eventsMap.put(packageName, new ArrayList<>());
            }
            List<Event> packageEvents = eventsMap.get(packageName);
            if (packageEvents.isEmpty()) {
                newEvent.setCumulatedScreentime(0);
            } else {
                Event lastEvent = packageEvents.get(packageEvents.size() - 1);
                if (lastEvent.getTimeStamp() >= timestamp) {
                    return;
                }
                if (lastEvent.getEventType() == UsageEvents.Event.MOVE_TO_BACKGROUND && eventType == UsageEvents.Event.MOVE_TO_BACKGROUND) {
                    return;
                }
                if (lastEvent.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND && eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) { // last app open's closing event was not recorded, so we remove the last event. Will not count some screentime, but it's better than counting it for the wrong app
                    packageEvents.remove(packageEvents.size() - 1);
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
        editor.apply();
    }

    public void loadData() {
        String eventsMapJson = sharedPreferences.getString(EVENTS_MAP_KEY, null);
        if (eventsMapJson != null) {
            deserializeEventsMap(eventsMapJson);
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
}