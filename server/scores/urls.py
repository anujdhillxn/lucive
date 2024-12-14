from django.urls import path
from .views import RetrieveScoreView, UpdateScoreView

urlpatterns = [
    path('retrieve-score/', RetrieveScoreView.as_view(), name='retrieve-score'),
    path('update-score/', UpdateScoreView.as_view(), name='update-score'),
]