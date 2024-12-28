package com.lucive.managers;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "app_data.db";
    private static final int DATABASE_VERSION = 1;

    public static final String TABLE_HEARTBEATS = "heartbeats";
    public static final String COLUMN_ID = "_id";
    public static final String COLUMN_TIMESTAMP = "timestamp";
    public static final String COLUMN_POINTS = "points";

    public static final String TABLE_DEVICE_STATUS = "device_status";
    public static final String COLUMN_IS_SCREEN_ON = "is_screen_on";

    private static final String TABLE_CREATE_HEARTBEATS =
            "CREATE TABLE " + TABLE_HEARTBEATS + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TIMESTAMP + " INTEGER, " +
                    COLUMN_POINTS + " REAL);";

    private static final String TABLE_CREATE_DEVICE_STATUS =
            "CREATE TABLE " + TABLE_DEVICE_STATUS + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TIMESTAMP + " INTEGER, " +
                    COLUMN_IS_SCREEN_ON + " INTEGER);";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(TABLE_CREATE_HEARTBEATS);
        db.execSQL(TABLE_CREATE_DEVICE_STATUS);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_HEARTBEATS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_DEVICE_STATUS);
        onCreate(db);
    }
}