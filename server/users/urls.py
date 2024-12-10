from django.urls import path
from .views import ChangeUsernameView, RegisterView, LoginView, SetFCMTokenView, UserInfoView, GoogleOAuthRegisterView, LogoutView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('auth/google', GoogleOAuthRegisterView.as_view(), name='google-register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('me', UserInfoView.as_view(), name='user-info'),
    path('change-username', ChangeUsernameView.as_view(), name='change-username'),
    path('set-fcm-token', SetFCMTokenView.as_view(), name='change-fcm-token'),
]