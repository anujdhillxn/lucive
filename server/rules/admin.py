from django.contrib import admin
from .models import Rule, RuleModificationRequest

admin.site.register(Rule)
admin.site.register(RuleModificationRequest)