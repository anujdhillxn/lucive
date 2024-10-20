from django.urls import path
from .views import CreateDuoView, ConfirmDuoView, DeleteDuoView, ListDuoInfoView

urlpatterns = [
    path('create-duo', CreateDuoView.as_view(), name='create-duo'),
    path('confirm-duo', ConfirmDuoView.as_view(), name='confirm-duo'),
    path('delete-duo', DeleteDuoView.as_view(), name='delete-duo'),
    path('duo-list/', ListDuoInfoView.as_view(), name='duo-list'),
]