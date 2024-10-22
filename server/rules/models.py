from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

User = get_user_model()

class Rule(models.Model):
    app = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, related_name='rules', on_delete=models.CASCADE)
    daily_max_seconds = models.IntegerField(null=True, blank=True, default=None)
    hourly_max_seconds = models.IntegerField(null=True, blank=True, default=None)
    session_max_seconds = models.IntegerField(null=True, blank=True, default=None)
    daily_reset = models.TimeField(default='00:00:00')
    INTERVENTION_CHOICES = [
        ('FULL', 'Full'),
        ('PARTIAL', 'Partial'),
    ]
    intervention_type = models.CharField(max_length=7, choices=INTERVENTION_CHOICES, default='FULL')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    last_modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('app', 'user')

    def __str__(self):
        return f"Rule for App: {self.app}"
    
class RuleModificationRequest(models.Model):
    app = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, related_name='rule_modification_requests', on_delete=models.CASCADE)
    daily_max_seconds = models.IntegerField(null=True, blank=True, default=None)
    hourly_max_seconds = models.IntegerField(null=True, blank=True, default=None)
    session_max_seconds = models.IntegerField(null=True, blank=True, default=None)
    daily_reset = models.TimeField(default='00:00:00')
    INTERVENTION_CHOICES = [
        ('FULL', 'Full'),
        ('PARTIAL', 'Partial'),
    ]
    intervention_type = models.CharField(max_length=7, choices=INTERVENTION_CHOICES)
    class Meta:
        unique_together = ('app', 'user')

    def __str__(self):
        return f"Rule Modification Request for App: {self.app}"