package com.lucive.managers;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.lucive.models.UsageTrackerHeartbeat;

import java.util.ArrayList;
import java.util.List;

public class HeartbeatDAO {
    private SQLiteDatabase database;
    private DatabaseHelper dbHelper;

    public HeartbeatDAO(Context context) {
        dbHelper = new DatabaseHelper(context);
        database = dbHelper.getWritableDatabase();
    }

    public void addHeartbeat(UsageTrackerHeartbeat heartbeat) {
        ContentValues values = new ContentValues();
        values.put(DatabaseHelper.COLUMN_TIMESTAMP, heartbeat.timestamp());
        values.put(DatabaseHelper.COLUMN_POINTS, heartbeat.points());

        database.insert(DatabaseHelper.TABLE_HEARTBEATS, null, values);
    }

    public List<UsageTrackerHeartbeat> getHeartbeats() {
        List<UsageTrackerHeartbeat> heartbeats = new ArrayList<>();
        Cursor cursor = database.query(DatabaseHelper.TABLE_HEARTBEATS, null, null, null, null, null, null);

        if (cursor != null) {
            while (cursor.moveToNext()) {
                long timestamp = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TIMESTAMP));
                double points = cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_POINTS));
                UsageTrackerHeartbeat heartbeat = new UsageTrackerHeartbeat(timestamp, points);
                heartbeats.add(heartbeat);
            }
            cursor.close();
        }

        return heartbeats;
    }

    public void deleteOldHeartbeats(long cutoffTimeSeconds) {
        database.delete(DatabaseHelper.TABLE_HEARTBEATS, DatabaseHelper.COLUMN_TIMESTAMP + " < ?", new String[]{String.valueOf(cutoffTimeSeconds)});
    }

    public void close() {
        dbHelper.close();
    }
}