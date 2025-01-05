from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Score(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    value = models.FloatField(default=0)
    date = models.DateField()
    uninterrupted_tracking = models.BooleanField(default=False)
    def __str__(self):
        return f'{self.user.username}: {self.date}, {self.value}'
    
class ScoreAggregates(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    perfect_day_longest_streak = models.IntegerField(default=0)
    perfect_day_current_streak = models.IntegerField(default=0)
    last_perfect_day = models.DateField(null=True)