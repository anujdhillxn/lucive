package com.zenvia.rules;

import java.util.Calendar;

public class ScreentimeRule extends Rule {
    final int dailyMaxSeconds;
    final int hourlyMaxSeconds;
    final Calendar dailyStartsAt;

    public ScreentimeRule(boolean isActive, String app, int dailyMaxSeconds, int hourlyMaxSeconds, Calendar dailyStartsAt) {
        super(app, isActive);
        this.dailyMaxSeconds = dailyMaxSeconds;
        this.hourlyMaxSeconds = hourlyMaxSeconds;
        this.dailyStartsAt = dailyStartsAt;
    }

    public int getHourlyMaxSeconds() {
        return hourlyMaxSeconds;
    }

    public int getDailyMaxSeconds() {
        return dailyMaxSeconds;
    }

    public Calendar getDailyStartsAt() {
        return dailyStartsAt;
    }
}
