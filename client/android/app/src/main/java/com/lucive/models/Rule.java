package com.lucive.models;

public record Rule(String app, boolean isActive, int dailyMaxSeconds, int hourlyMaxSeconds, int sessionMaxSeconds,
                   String dailyStartsAt, boolean isDailyMaxSecondsEnforced, boolean isHourlyMaxSecondsEnforced, boolean isSessionMaxSecondsEnforced, boolean isStartupDelayEnabled) {

}
