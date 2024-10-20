from django.urls import path
from .views import UserRulesView, UpdateRuleView, CreateRuleView, AllowChangeToRuleView, DeleteRuleView

urlpatterns = [
    path('user-rules/', UserRulesView.as_view(), name='user-rules'),
    path('update-rule', UpdateRuleView.as_view(), name='update-rule'),
    path('create-rule', CreateRuleView.as_view(), name='create-rule'),
    path('allow-change-to-rule', AllowChangeToRuleView.as_view(), name='allow-change'),
    path('delete-rule', DeleteRuleView.as_view(), name='delete-rule')
]