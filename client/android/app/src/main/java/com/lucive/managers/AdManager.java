package com.lucive.managers;

import android.content.Context;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.lucive.BuildConfig;

import java.util.concurrent.atomic.AtomicLong;

public class AdManager {
    private static AdManager instance;
    private final AdView adView;
    private final AtomicLong lastAdLoadTime = new AtomicLong(0);
    private static final long AD_LOAD_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

    private AdManager(Context context) {
        adView = new AdView(context);
        adView.setAdUnitId(BuildConfig.AD_UNIT_ID);
        adView.setAdSize(AdSize.BANNER);
        loadNewAd();
    }

    public static synchronized AdManager getInstance(Context context) {
        if (instance == null) {
            instance = new AdManager(context);
        }
        return instance;
    }

    public AdView getAdView() {
        return adView;
    }

    public void loadNewAd() {
        long currentTime = System.currentTimeMillis();
        long lastLoadTime = lastAdLoadTime.get();
        if (currentTime - lastLoadTime >= AD_LOAD_INTERVAL) {
            AdRequest adRequest = new AdRequest.Builder().build();
            adView.loadAd(adRequest);
            lastAdLoadTime.set(currentTime);
        }
    }
}