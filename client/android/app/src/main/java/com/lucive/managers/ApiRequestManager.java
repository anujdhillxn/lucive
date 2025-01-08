package com.lucive.managers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.content.Context;
import android.util.Log;

import com.lucive.BuildConfig;
import com.lucive.models.UsageTrackerDailyScore;

import org.json.JSONArray;
import org.json.JSONObject;

public class ApiRequestManager implements LocalStorageObserver {
    private static ApiRequestManager instance;
    private String requestToken;
    private final LocalStorageManager localStorageManager;
    private final ExecutorService executorService;

    private ApiRequestManager(final Context context) {
        localStorageManager = LocalStorageManager.getInstance(context);
        localStorageManager.addObserver(this);
        onLocalStorageUpdated();
        executorService = Executors.newSingleThreadExecutor();
    }

    public static synchronized ApiRequestManager getInstance(final Context context) {
        if (instance == null) {
            instance = new ApiRequestManager(context);
        }
        return instance;
    }

    @Override
    public void onLocalStorageUpdated() {
        requestToken = localStorageManager.getRequestToken();
    }

    private void post(final String apiUrl, final Object payload) {
        executorService.submit(() -> makeRequest(apiUrl, "POST", payload));
    }

    // Helper method to make an HTTP request
    private String makeRequest(final String apiUrl, final String method, final Object payload) {
        HttpURLConnection connection = null;
        try {
            final URL url = new URL(apiUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(method);
            connection.setRequestProperty("Authorization", "Token " + requestToken);
            connection.setRequestProperty("Content-Type", "application/json");

            if (payload != null && (method.equals("POST") || method.equals("PUT"))) {
                connection.setDoOutput(true);
                try (final OutputStream os = connection.getOutputStream()) {
                    final byte[] input = payload.toString().getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }
            }

            final int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                final BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                final StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
                return response.toString();
            } else if (responseCode == HttpURLConnection.HTTP_UNAUTHORIZED) {
                localStorageManager.clearRequestToken();
                return "Error: Unauthorized";
            } else {
                return "Error: " + responseCode;
            }
        } catch (final Exception e) {
            Log.e("ApiRequestManager", "Exception in makeRequest", e);
            return "Exception: " + e.getMessage();
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    public void updateScores(final List<UsageTrackerDailyScore> scores) {
        final String url = BuildConfig.API_URL + "scores/update-score";
        final JSONArray payload = new JSONArray();
        for (UsageTrackerDailyScore score : scores) {
            JSONObject scoreJson = new JSONObject();
            try {
                scoreJson.put("date", score.date());
                scoreJson.put("value", score.points());
                scoreJson.put("uninterrupted_tracking", score.uninterruptedTracking());
                payload.put(scoreJson);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        post(url, payload);
    }
}