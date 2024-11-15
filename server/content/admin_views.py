import json
from django.shortcuts import render, redirect
from django.contrib import admin, messages
from django.urls import path
from .models import Word
from .forms import JSONTextForm
from .serializers import WordSerializer

@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    change_list_template = "admin/content/word_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-json/', self.admin_site.admin_view(self.upload_json), name='upload-json'),
        ]
        return custom_urls + urls

    def upload_json(self, request):
        if request.method == "POST":
            form = JSONTextForm(request.POST)
            if form.is_valid():
                json_text = form.cleaned_data['json_text']
                try:
                    data = json.loads(json_text)
                except json.JSONDecodeError:
                    messages.error(request, "Invalid JSON format.")
                    return redirect("..")

                added_words = []
                omitted_words = []
                for word_data in data:
                    word = word_data.get('word')
                    if Word.objects.filter(word=word).exists():
                        omitted_words.append(word)
                        continue
                    serializer = WordSerializer(data=word_data)
                    if serializer.is_valid():
                        serializer.save()
                        added_words.append(serializer.data)
                    else:
                        messages.error(request, f"Error adding word: {serializer.errors}")
                messages.success(request, f"Added words: {added_words}, Omitted words: {omitted_words}")
                return redirect("..")
        else:
            form = JSONTextForm()
        return render(request, "admin/content/upload_json.html", {"form": form})