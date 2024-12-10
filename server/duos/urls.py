from django.urls import path
from .views import CreateDuoView, DeleteDuoView, GetDuoView, DeepLinkRedirectView

urlpatterns = [
    path('create-duo', CreateDuoView.as_view(), name='create-duo'),
    path('delete-duo', DeleteDuoView.as_view(), name='delete-duo'),
    path('get-duo', GetDuoView.as_view(), name='get-duo'),
    path('deeplink/<str:invitation_token>', DeepLinkRedirectView.as_view(), name='deeplink'),
]