from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Score(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    value = models.FloatField()
    date = models.DateField()
    uninterrupted_tracking = models.BooleanField(default=False)
    def __str__(self):
        return f'{self.user.username}: {self.date}, {self.value}'