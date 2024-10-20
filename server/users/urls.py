from django.urls import path
from .views import RegisterView, LoginView, UserInfoView, GoogleOAuthRegisterView, LogoutView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('auth/google/', GoogleOAuthRegisterView.as_view(), name='google-register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('me/', UserInfoView.as_view(), name='user-info'),
]