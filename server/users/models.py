from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.username
