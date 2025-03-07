package com.lucive.utils;

import com.lucive.models.Event;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
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
        "com.bumble.app", // Bumble
        "co.hinge.app", // Hinge
        "com.google.android.youtube", //Youtube
        "com.linkedin.android", // LinkedIn
        "com.reddit.frontpage", // Reddit
    };

    public static final String UNKNOWN_PACKAGE = "Unknown";
    public static double SCALING_FACTOR = 10000;
    public static Calendar parseTimeString(String timeString) {
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());
        Calendar calendar = Calendar.getInstance();
        try {
            // Parse the time string
            calendar.setTime(timeFormat.parse(timeString));
            // Set the calendar to today's date with the parsed time
            Calendar today = Calendar.getInstance();
            calendar.set(Calendar.YEAR, today.get(Calendar.YEAR));
            calendar.set(Calendar.MONTH, today.get(Calendar.MONTH));
            calendar.set(Calendar.DAY_OF_MONTH, today.get(Calendar.DAY_OF_MONTH));
        } catch (ParseException e) {
            e.printStackTrace();  // Handle parse exception
        }
        return calendar;
    }

    public static String parseToYYYYMMDD(final Calendar calendar) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        return dateFormat.format(calendar.getTime());
    }

    public static long getDayStartNDaysBefore(final int n) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.add(Calendar.DAY_OF_MONTH, -n);
        return calendar.getTimeInMillis();
    }

    public static long get24HoursBefore() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -1);
        return calendar.getTimeInMillis();
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

    public static Event getLastEventBeforeOrEqual(List<Event> events, long inputTimestamp) {
        int beg = 0, end = events.size() - 1;
        Event res = null;
        while (beg <= end) {
            int mid = (beg + end) / 2;
            if (events.get(mid).getTimeStamp() <= inputTimestamp) {
                res = events.get(mid);
                beg = mid + 1;
            }
            else {
                end = mid - 1;
            }
        }
        return res;
    }

    public static Event getLastEventBefore(List<Event> events, long inputTimestamp) {
        int beg = 0, end = events.size() - 1;
        Event res = null;
        while (beg <= end) {
            int mid = (beg + end) / 2;
            if (events.get(mid).getTimeStamp() < inputTimestamp) {
                res = events.get(mid);
                beg = mid + 1;
            }
            else {
                end = mid - 1;
            }
        }
        return res;
    }

    public static String convertMillisToDate(long millis) {
        // Define the desired date format
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        // Create a Date object using the milliseconds
        Date date = new Date(millis);

        // Format the Date object into a readable string
        return sdf.format(date);
    }

    public static Calendar parseDate(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        Calendar calendar = Calendar.getInstance();
        try {
            calendar.setTime(dateFormat.parse(dateString));
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
        return calendar;
    }

    public static long convertIsoToEpoch(String isoDate) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        try {
            Date date = sdf.parse(isoDate);
            return date.getTime();
        } catch (ParseException e) {
            e.printStackTrace();
            return 0;
        }
    }

    public static String convertEpochToIso(long epoch) {
        Date date = new Date(epoch);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        return sdf.format(date);
    }
}