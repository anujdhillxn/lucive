package com.lucive.managers;

import android.content.Context;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.lucive.BuildConfig;

public class AdManager {
    private static AdManager instance;
    private AdView adView;
    private boolean isAdLoaded = false;

    private AdManager(Context context) {
        adView = new AdView(context);
        adView.setAdUnitId(BuildConfig.AD_UNIT_ID);
        adView.setAdSize(AdSize.BANNER);
        AdRequest adRequest = new AdRequest.Builder().build();
        adView.loadAd(adRequest);
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
        AdRequest adRequest = new AdRequest.Builder().build();
        adView.loadAd(adRequest);
    }
}