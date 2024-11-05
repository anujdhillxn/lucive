package com.lucive.models;

import com.lucive.utils.AppUtils;

import java.util.Calendar;

public class Event {
    private final String packageName;
    private final int eventType;
    private final long timeStamp;
    private long cumulatedScreentime;

    public Event(String packageName, int eventType, long timeStamp) {
        this.packageName = packageName;
        this.eventType = eventType;
        this.timeStamp = timeStamp;
    }

    public long getCumulatedScreentime() {
        return cumulatedScreentime;
    }

    public long getTimeStamp() {
        return timeStamp;
    }

    public String getPackageName() {
        return packageName;
    }

    public int getEventType() {
        return eventType;
    }

    public void setCumulatedScreentime(long cumulatedScreentime) {
        this.cumulatedScreentime = cumulatedScreentime;
    }

    @Override
    public String toString() {
        return "Event{" +
                "packageName='" + packageName + '\'' +
                ", eventType=" + eventType +
                ", timeStamp=" + AppUtils.convertMillisToDate(timeStamp) +
                ", cumulatedScreentime=" + cumulatedScreentime +
                '}';
    }
}
