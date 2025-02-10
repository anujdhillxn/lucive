package com.lucive.models;

import com.lucive.utils.AppUtils;

public class Event {
    private final String packageName;
    private int eventType;
    private final long timeStamp;
    private final String activity;
    private long cumulatedScreentime;

    public Event(String packageName, int eventType, long timeStamp, final String activity) {
        this.packageName = packageName;
        this.eventType = eventType;
        this.timeStamp = timeStamp;
        this.activity = activity;
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

    public String getActivity() {
        return activity;
    }

    public void setCumulatedScreentime(long cumulatedScreentime) {
        this.cumulatedScreentime = cumulatedScreentime;
    }

    public void setEventType(int eventType) {
        this.eventType = eventType;
    }

    @Override
    public String toString() {
        return "Event{" +
                "packageName='" + packageName + '\'' +
                ", eventType=" + eventType +
                ", timeStamp=" + AppUtils.convertMillisToDate(timeStamp) +
                ", activity='" + activity + '\'' +
                ", cumulatedScreentime=" + cumulatedScreentime +
                '}';
    }
}
