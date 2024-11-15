from django.db import models

class Word(models.Model):
    word = models.CharField(max_length=100, unique=True)
    meaning = models.TextField()
    usage = models.TextField()
    difficulty = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.word