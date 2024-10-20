package com.zenvia.utils;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;

public class AppUtils {

    // Check if the app has usage stats permission
    // Define the list of packages to track (e.g., Hinge, YouTube, Netflix)
    public static final String[] TARGET_PACKAGES = {
        "com.facebook.katana",
        "com.instagram.android",
        "com.snapchat.android",
        "com.whatsapp",
        "com.twitter.android",
        "com.tencent.ig",
        "com.robo.dev.arknights",
        "com.google.android.youtube", // YouTube
        "com.netflix.mediaclient", // Netflix
        "com.hulu.plus", // Hulu
        "com.amazon.avod.thirdpartyclient", // Prime Video
        "com.disney.disneyplus", // Disney+
        "com.tinder", // Tinder
        "com.okcupid.okcupid", // OkCupid
        "com.bumble.app", // Bumble
        "co.hinge.app", // Hinge
        "com.match.com" // Match.com
    };

    public enum RuleType {
        SCREENTIME
    }

    public static Calendar parseISO8601String(String isoDateString) {
        SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
        Calendar calendar = Calendar.getInstance();
        try {
            calendar.setTime(isoFormat.parse(isoDateString));  // Parse the date string
        } catch (ParseException e) {
            e.printStackTrace();  // Handle parse exception
        }
        return calendar;
    }

    public static String formatTime(int totalSeconds) {
        int hours = totalSeconds / 3600;
        int secondsLeft = totalSeconds % 3600;
        int minutes = secondsLeft / 60;
        int seconds = secondsLeft % 60;
        StringBuilder formattedTime = new StringBuilder();

        if (hours > 0) {
            formattedTime.append(hours).append(" hour").append(hours > 1 ? "s" : "");
        }

        if (minutes > 0) {
            if (formattedTime.length() > 0) {
                formattedTime.append(", ");
            }
            formattedTime.append(minutes).append(" minute").append(minutes > 1 ? "s" : "");
        }

        if (seconds > 0) {
            if (formattedTime.length() > 0) {
                formattedTime.append(", ");
            }
            formattedTime.append(seconds).append(" second").append(seconds > 1 ? "s" : "");
        }

        return formattedTime.length() > 0 ? formattedTime.toString() : "0 seconds";
    }
}