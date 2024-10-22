from django.urls import path
from .views import ApproveRuleModificationRequestView, DeleteRuleModificationRequestView, UserRulesView, UpdateRuleView, CreateRuleView, DeleteRuleView

urlpatterns = [
    path('user-rules/', UserRulesView.as_view(), name='user-rules'),
    path('update-rule', UpdateRuleView.as_view(), name='update-rule'),
    path('create-rule', CreateRuleView.as_view(), name='create-rule'),
    path('delete-rule', DeleteRuleView.as_view(), name='delete-rule'),
    path('approve-rule-modification-request', ApproveRuleModificationRequestView.as_view(), name='approve-rule-modification-request'),
    path('delete-rule-modification-request', DeleteRuleModificationRequestView.as_view(), name='delete-rule-modification-request'),
]