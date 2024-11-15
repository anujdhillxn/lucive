import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    invitation_token = models.UUIDField(unique=True, default=uuid.uuid4, null=True, blank=True)
    fcm_token = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.username
