package com.lucive.managers;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.lucive.models.DeviceStatus;

import java.util.ArrayList;
import java.util.List;

public class DeviceStatusDAO {
    private SQLiteDatabase database;
    private DatabaseHelper dbHelper;

    public DeviceStatusDAO(Context context) {
        dbHelper = new DatabaseHelper(context);
        database = dbHelper.getWritableDatabase();
    }

    public void addDeviceStatus(DeviceStatus deviceStatus) {
        ContentValues values = new ContentValues();
        values.put(DatabaseHelper.COLUMN_TIMESTAMP, deviceStatus.timestamp());
        values.put(DatabaseHelper.COLUMN_IS_SCREEN_ON, deviceStatus.isScreenOn() ? 1 : 0);

        database.insert(DatabaseHelper.TABLE_DEVICE_STATUS, null, values);
    }

    public DeviceStatus getLastDeviceStatus() {
        Cursor cursor = database.query(DatabaseHelper.TABLE_DEVICE_STATUS, null, null, null, null, null, DatabaseHelper.COLUMN_TIMESTAMP + " DESC", "1");
        if (cursor != null && cursor.moveToFirst()) {
            long timestamp = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TIMESTAMP));
            boolean isScreenOn = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_IS_SCREEN_ON)) == 1;
            cursor.close();
            return new DeviceStatus(timestamp, isScreenOn);
        }
        return null;
    }

    public List<DeviceStatus> getDeviceStatuses() {
        List<DeviceStatus> deviceStatuses = new ArrayList<>();
        Cursor cursor = database.query(DatabaseHelper.TABLE_DEVICE_STATUS, null, null, null, null, null, null);

        if (cursor != null) {
            while (cursor.moveToNext()) {
                long timestamp = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TIMESTAMP));
                boolean isScreenOn = cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_IS_SCREEN_ON)) == 1;
                DeviceStatus deviceStatus = new DeviceStatus(timestamp, isScreenOn);
                deviceStatuses.add(deviceStatus);
            }
            cursor.close();
        }

        return deviceStatuses;
    }

    public void deleteOldDeviceStatuses(long cutoffTimeSeconds) {
        database.delete(DatabaseHelper.TABLE_DEVICE_STATUS, DatabaseHelper.COLUMN_TIMESTAMP + " < ?", new String[]{String.valueOf(cutoffTimeSeconds)});
    }

    public void close() {
        dbHelper.close();
    }
}