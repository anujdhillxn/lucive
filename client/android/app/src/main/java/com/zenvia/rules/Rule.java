package com.zenvia.rules;

public class Rule {
    private final String app;
    private final boolean isActive;

    public Rule(String app, boolean isActive) {
        this.app = app;
        this.isActive = isActive;
    }

    public String getApp() {
        return app;
    }

    public boolean isActive() {
        return isActive;
    }
}
