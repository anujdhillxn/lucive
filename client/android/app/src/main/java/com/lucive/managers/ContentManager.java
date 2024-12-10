package com.lucive.managers;

import android.content.Context;
import com.lucive.models.Word;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ContentManager implements LocalStorageObserver {
    private static ContentManager instance;
    private final List<Word> words = new ArrayList<>();
    private final LocalStorageManager localStorageManager;

    private ContentManager(final Context context) {
        localStorageManager = LocalStorageManager.getInstance(context);
        localStorageManager.addObserver(this);
        onLocalStorageUpdated();
    }

    public Word getRandomWord() {
        if (words.isEmpty()) {
            words.addAll(localStorageManager.getWords());
        }
        if (!words.isEmpty()) {
            Random random = new Random();
            final int popIndex = random.nextInt(words.size());
            final Word word = words.get(popIndex);
            words.remove(popIndex);
            return word;
        }
        return null;
    }

    public static synchronized ContentManager getInstance(Context context) {
        if (instance == null) {
            instance = new ContentManager(context);
        }
        return instance;
    }

    @Override
    public void onLocalStorageUpdated() {
        words.clear();
        words.addAll(localStorageManager.getWords());
    }
}