from django.db import models
from django.contrib.auth import get_user_model
from .utils import *
User = get_user_model()

class RuleConstraint(models.Model):
    app = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    daily_max_seconds = models.IntegerField(null=True, blank=True, default=60*60*24)
    is_daily_max_seconds_enforced = models.BooleanField(default=False)
    daily_reset = models.TimeField(default='00:00:00')

    hourly_max_seconds = models.IntegerField(null=True, blank=True, default=60*60)
    is_hourly_max_seconds_enforced = models.BooleanField(default=False)

    session_max_seconds = models.IntegerField(null=True, blank=True, default=60*60*24)
    is_session_max_seconds_enforced = models.BooleanField(default=False)

    is_startup_delay_enabled = models.BooleanField(default=False)

    INTERVENTION_CHOICES = [
        ('FULL', 'Full'),
        ('PARTIAL', 'Partial'),
    ]
    intervention_type = models.CharField(max_length=7, choices=INTERVENTION_CHOICES, default='FULL')

    class Meta:
        abstract = True

class Rule(RuleConstraint):
    app_display_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    valid_till = models.DateTimeField(null=True, blank=True)
    version = models.IntegerField(default=1)
    is_temporary = models.BooleanField(default=False)

    class Meta:
        unique_together = (FIELD_APP, FIELD_USER, FIELD_VERSION)

    def __str__(self):
        return f"{self.user.username}'s rule for {self.app}"

class RuleModificationRequest(RuleConstraint):
    class Meta:
        unique_together = (FIELD_APP, FIELD_USER)

    def __str__(self):
        return f"{self.user.username}'s rule modification request for {self.app}"