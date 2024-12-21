package com.lucive.managers;

import android.content.Context;

import com.lucive.models.Rule;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RulesManager implements LocalStorageObserver {
    private static RulesManager instance;
    private final Map<String, Rule> ruleMap = new ConcurrentHashMap<>();
    private final LocalStorageManager localStorageManager;

    private RulesManager(final Context context) {
        localStorageManager = LocalStorageManager.getInstance(context);
        localStorageManager.addObserver(this);
        onLocalStorageUpdated();
    }

    public static synchronized RulesManager getInstance(final Context context) {
        if (instance == null) {
            instance = new RulesManager(context);
        }
        return instance;
    }

    public Rule getRule(String app) {
        return ruleMap.get(app);
    }

    public double calculateHeartbeatPoints() {
        return 0;
    }

    @Override
    public void onLocalStorageUpdated() {
        ruleMap.clear();
        for (Rule rule : localStorageManager.getRules()) {
            if (rule.isMyRule()) {
                ruleMap.put(rule.app(), rule);
            }
        }
    }
}
