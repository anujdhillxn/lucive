package com.lucive.modules;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.lucive.managers.LocalStorageManager;
import com.lucive.models.Word;

import java.util.ArrayList;
import java.util.List;

public class LocalStorageModule extends ReactContextBaseJavaModule {

    public LocalStorageModule(ReactApplicationContext context) {
        super(context);
    }

    @ReactMethod
    public void setWords(ReadableArray words, Promise promise) {
        LocalStorageManager localStorageManager = LocalStorageManager.getInstance(getReactApplicationContext());
        final List<Word> wordsList = new ArrayList<>();
        for (int i = 0; i < words.size(); i++) {
            ReadableMap word = words.getMap(i);
            wordsList.add(new Word(
                    word.getString("word"),
                    word.getString("meaning"),
                    word.getString("usage"),
                    word.getInt("difficulty")
            ));
        }
        localStorageManager.setWords(wordsList);
        promise.resolve(true);
    }

    @NonNull
    @Override
    public String getName() {
        return "LocalStorageModule";
    }
}