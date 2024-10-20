from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

User = get_user_model()

class Rule(models.Model):
    app = models.CharField(max_length=100)
    ruletype = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    rule_details = models.TextField()
    user = models.ForeignKey(User, related_name='rules', on_delete=models.CASCADE)
    change_allowed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('app', 'ruletype', 'user')

    def __str__(self):
        return f"Rule: {self.ruletype} for App: {self.app}"