from django.urls import path
from .views import RandomWordsView

urlpatterns = [
    path('random-words/', RandomWordsView.as_view(), name='word-random-words'),
]