package com.lucive.managers;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.lucive.models.Rule;
import com.lucive.models.Word;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class LocalStorageManager {
    private static LocalStorageManager instance;
    private final SharedPreferences sharedPreferences;
    private final Gson gson;
    private final Set<LocalStorageObserver> observers = new HashSet<>();

    public static final String WORDS_KEY = "words";
    public static final String RULES_KEY = "rules";

    private LocalStorageManager(Context context) {
        this.sharedPreferences = context.getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
        this.gson = new Gson();
    }

    public static synchronized LocalStorageManager getInstance(Context context) {
        if (instance == null) {
            instance = new LocalStorageManager(context);
        }
        return instance;
    }

    public void addObserver(LocalStorageObserver observer) {
        observers.add(observer);
    }

    private void notifyObservers() {
        for (LocalStorageObserver observer : observers) {
            observer.onLocalStorageUpdated();
        }
    }

    public void setWords(List<Word> words) {
        String json = gson.toJson(words);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(WORDS_KEY, json);
        editor.apply();
        notifyObservers();
    }

    public List<Word> getWords() {
        String json = sharedPreferences.getString(WORDS_KEY, null);
        if (json != null) {
            Type type = new TypeToken<List<Word>>() {}.getType();
            return gson.fromJson(json, type);
        } else {
            return new ArrayList<>();
        }
    }

    public void setRules(List<Rule> rules) {
        String json = gson.toJson(rules);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(RULES_KEY, json);
        editor.apply();
        notifyObservers();
    }

    public List<Rule> getRules() {
        String json = sharedPreferences.getString(RULES_KEY, null);
        if (json != null) {
            Type type = new TypeToken<List<Rule>>() {}.getType();
            return gson.fromJson(json, type);
        } else {
            return new ArrayList<>();
        }
    }
}