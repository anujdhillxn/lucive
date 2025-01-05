from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/duos/', include('duos.urls')),
    path('api/rules/', include('rules.urls')),
    path('api/content/', include('content.urls')),
    path('api/scores/', include('scores.urls')),
]