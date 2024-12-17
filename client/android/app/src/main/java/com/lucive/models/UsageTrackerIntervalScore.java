package com.lucive.models;

public record UsageTrackerIntervalScore(int minuteOfDay, boolean deviceRunning, boolean serviceRunning, double points) {
}
