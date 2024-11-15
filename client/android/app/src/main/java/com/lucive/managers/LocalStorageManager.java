package com.lucive.managers;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.lucive.models.Word;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class LocalStorageManager {
    private static LocalStorageManager instance;
    private final SharedPreferences sharedPreferences;
    private final Gson gson;
    private List<Word> words;

    private LocalStorageManager(Context context) {
        this.sharedPreferences = context.getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
        this.gson = new Gson();
        this.words = new ArrayList<>();
    }

    public static synchronized LocalStorageManager getInstance(Context context) {
        if (instance == null) {
            instance = new LocalStorageManager(context);
        }
        return instance;
    }

    public void setWords(List<Word> words) {
        String json = gson.toJson(words);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("words", json);
        editor.apply();
        this.words = words;
    }

    public Word getRandomWord() {
        refreshWordsFromLocalStorage();
        if (!words.isEmpty()) {
            Random random = new Random();
            return words.get(random.nextInt(words.size()));
        }
        return null;
    }

    private void refreshWordsFromLocalStorage() {
        String json = sharedPreferences.getString("words", null);
        if (json != null) {
            Type type = new TypeToken<List<Word>>() {}.getType();
            words = gson.fromJson(json, type);
        } else {
            words = new ArrayList<>();
        }
    }
}