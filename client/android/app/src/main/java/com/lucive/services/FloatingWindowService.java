package com.lucive.services;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.IBinder;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

import com.lucive.R;
import com.lucive.managers.LocalStorageManager;
import com.lucive.models.Word;

public class FloatingWindowService extends Service {
    private WindowManager windowManager;
    private View floatingView;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        boolean showModal = intent != null && intent.getBooleanExtra("EXTRA_SHOW_MODAL", false);

        if (showModal) {
            String message = intent.getStringExtra("EXTRA_MODAL_MESSAGE");

            // Check if floatingView already exists
            if (floatingView == null) {
                // Inflate the view and add it to the WindowManager
                floatingView = LayoutInflater.from(this).inflate(R.layout.modal_layout, null);
                TextView modalMessage = floatingView.findViewById(R.id.modal_message);
                modalMessage.setText(message != null ? message : "Screen Time Exceeded!");

                // Fetch a random word from LocalStorageManager
                LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getApplicationContext());
                Word randomWord = localStorageManager.getRandomWord();

                if (randomWord != null) {
                    TextView wordTextView = floatingView.findViewById(R.id.word_text);
                    TextView meaningTextView = floatingView.findViewById(R.id.meaning_text);
                    TextView usageTextView = floatingView.findViewById(R.id.usage_text);

                    wordTextView.setText(randomWord.word());
                    meaningTextView.setText(randomWord.meaning());
                    usageTextView.setText(String.format("'%s'", randomWord.usage()));
                }

                WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                        WindowManager.LayoutParams.MATCH_PARENT,
                        WindowManager.LayoutParams.MATCH_PARENT,
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                        PixelFormat.TRANSLUCENT);

                windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
                windowManager.addView(floatingView, params);
            } else {
                // Update the message if view already exists
                TextView modalMessage = floatingView.findViewById(R.id.modal_message);
                modalMessage.setText(message != null ? message : "Screen Time Exceeded!");
            }
        } else {
            // Hide the view if present
            if (floatingView != null) {
                windowManager.removeView(floatingView);
                floatingView = null;
            }
            // Stop the service when modal is hidden
            stopSelf();
        }

        return START_STICKY;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Ensure floatingView is removed to prevent memory leaks
        if (floatingView != null) {
            windowManager.removeView(floatingView);
        }
    }
}