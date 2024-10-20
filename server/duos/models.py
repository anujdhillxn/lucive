from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Duo(models.Model):
    user1 = models.ForeignKey(User, related_name='duo_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='duo_user2', on_delete=models.CASCADE)
    is_confirmed = models.BooleanField(default=False)
    confirmed_at = models.DateTimeField(null=True, blank=True)  # Add this field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user1.username} & {self.user2.username}"