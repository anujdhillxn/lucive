package com.lucive.managers;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.content.Context;
import android.util.Log;

import com.lucive.BuildConfig;
import com.lucive.models.Rule;
import com.lucive.models.UsageTrackerDailyScore;
import com.lucive.utils.AppUtils;

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

    private String post(final String apiUrl, final Object payload) {
        return makeRequest(apiUrl, "POST", payload);
    }

    private String get(final String apiUrl) {
        return makeRequest(apiUrl, "GET", null);
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
        CompletableFuture.runAsync(() -> post(url, payload), executorService);
    }

    public void getRules() {
        final String url = BuildConfig.API_URL + "rules/user-rules";
        CompletableFuture<String> res = CompletableFuture.supplyAsync(() -> get(url), executorService);
        res.thenAccept(response -> {
            try {
                final JSONArray rulesArray = new JSONArray(response);
                List<Rule> rulesList = new ArrayList<>();
                for (int i = 0; i < rulesArray.length(); i++) {
                    final JSONObject ruleJson = rulesArray.getJSONObject(i);
                    final String app = ruleJson.getString("app");
                    final String appDisplayName = ruleJson.getString("appDisplayName");
                    final boolean isActive = ruleJson.getBoolean("isActive");
                    final int dailyMaxSeconds = ruleJson.getInt("dailyMaxSeconds");
                    final int hourlyMaxSeconds = ruleJson.getInt("hourlyMaxSeconds");
                    final int sessionMaxSeconds = ruleJson.getInt("sessionMaxSeconds");
                    final boolean isDailyMaxSecondsEnforced = ruleJson.getBoolean("isDailyMaxSecondsEnforced");
                    final boolean isHourlyMaxSecondsEnforced = ruleJson.getBoolean("isHourlyMaxSecondsEnforced");
                    final boolean isSessionMaxSecondsEnforced = ruleJson.getBoolean("isSessionMaxSecondsEnforced");
                    final String dailyStartsAt = ruleJson.getString("dailyReset");
                    final boolean isStartupDelayEnabled = ruleJson.getBoolean("isStartupDelayEnabled");
                    final boolean isMyRule = ruleJson.getBoolean("isMyRule");
                    final boolean isTemporary = ruleJson.getBoolean("isTemporary");
                    final String validTill = ruleJson.getString("validTill");

                    Rule rule = new Rule(app, appDisplayName, isActive, dailyMaxSeconds, hourlyMaxSeconds,
                            sessionMaxSeconds, dailyStartsAt, isDailyMaxSecondsEnforced,
                            isHourlyMaxSecondsEnforced, isSessionMaxSecondsEnforced, isStartupDelayEnabled,
                            isMyRule, isTemporary, AppUtils.convertIsoToEpoch(validTill));
                    rulesList.add(rule);
                }
                localStorageManager.setRules(rulesList);
            } catch (Exception e) {
                Log.e("ApiRequestManager", "Exception in getRules", e);
            }
        });
    }
}