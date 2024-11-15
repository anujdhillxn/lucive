from django.urls import path
from .views import AddWordsView, RandomWordsView

urlpatterns = [
    path('add-words/', AddWordsView.as_view(), name='word-add-words'),
    path('random-words/', RandomWordsView.as_view(), name='word-random-words'),
]