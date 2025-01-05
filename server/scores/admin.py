from django.contrib import admin

from .models import Score, ScoreAggregates

# Register your models here.
admin.site.register(Score)
admin.site.register(ScoreAggregates)