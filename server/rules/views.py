from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from lucive.push_notifications import send_push_notification
from .models import Rule, RuleModificationRequest
from .serializers import RuleSerializer, RuleModificationRequestSerializer
from duos.models import Duo
from django.db.models import Q, Subquery, OuterRef
from .utils import *
from django.utils import timezone
from rest_framework.generics import DestroyAPIView
from django.utils.dateparse import parse_datetime
def get_latest_rule(user, app):
    """
    Returns the latest Rule instance for the given user and app,
    or None if no rule is found.
    """
    now = timezone.now()
    return (
        Rule.objects.filter(**{
            FIELD_USER: user,
            FIELD_APP: app
        })
        .exclude(
            Q(**{FIELD_IS_TEMPORARY: True}) & Q(**{f"{FIELD_VALID_TILL}__lt": now})
        )
        .order_by(f"-{FIELD_VERSION}")
        .first()
    )
class UserRulesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            duo = Duo.objects.get(Q(user1=user) | Q(user2=user))
        except Duo.DoesNotExist:
            return Response({'error': 'User is not part of a confirmed duo'}, status=403)
        
        duo_partner = duo.user1 if duo.user2 == user else duo.user2
        users = [user, duo_partner]

        now = timezone.now()
        # Subquery to get the latest version for each app and user
        latest_version_subquery = Rule.objects.filter(
            user=OuterRef(FIELD_USER),
            app=OuterRef(FIELD_APP)
        ).exclude(
            Q(**{FIELD_IS_TEMPORARY: True}) & Q(**{f"{FIELD_VALID_TILL}__lt": now})
        ).order_by(f"-{FIELD_VERSION}").values(FIELD_VERSION)[:1]

        # Get the latest rules for both users
        latest_rules = Rule.objects.filter(
            user__in=users,
            version=Subquery(latest_version_subquery)
        )

        modification_requests = RuleModificationRequest.objects.filter(user__in=users)
        combined_list = []
        mod_data = {}

        for mod_request in modification_requests:
            serializer = RuleModificationRequestSerializer(mod_request, context={'request': request})
            data = serializer.data
            mod_data[(mod_request.app, mod_request.user)] = data

        for rule in latest_rules:
            serializer = RuleSerializer(rule, context={'request': request})
            data = serializer.data
            data['modificationData'] = mod_data.get((rule.app, rule.user), None)
            combined_list.append(data)
        return Response(combined_list)

class UpdateRuleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        app = request.data.get(FIELD_APP)
        try:
            duo = Duo.objects.get(Q(user1=user) | Q(user2=user))
        except Duo.DoesNotExist:
            return Response({'error': 'User is not part of a confirmed duo'}, status=403)
        try:
            current_rule = get_latest_rule(user, app)
        except Rule.DoesNotExist:
            current_rule = None
        if not is_rule_modified(request.data, current_rule):
            return Response(
                {'error': 'Rule not modified'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        if is_rule_relaxed(request.data, current_rule):
            if RuleModificationRequest.objects.filter(user=user, app=app).exists():
                return Response(
                    {'error': 'A modification request already exists for this rule'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create modification request
            mod_request_data = {
                FIELD_USER: user,
            }
            mod_request_data.update({
                k: v for k, v in request.data.items() if k in RULE_MODIFICATION_REQUEST_FIELDS
            })
            
            mod_request = RuleModificationRequest.objects.create(**mod_request_data)
            serializer = RuleModificationRequestSerializer(
                mod_request, 
                context={'request': request}
            )
            resp = RuleSerializer(current_rule, context={'request': request}).data
            resp['modificationData'] = serializer.data
            push_notification_data = {
                'title': 'Rule modification request',
                'body': f'{user.username} has requested a rule modification',
            }
            partner = duo.user1 if duo.user2 == user else duo.user2
            send_push_notification(partner.fcm_token, **push_notification_data)
            return Response(resp, status=status.HTTP_201_CREATED)
        else:
            rule_data = {
                FIELD_USER: user,
                FIELD_APP: app,
                FIELD_VERSION: (current_rule.version if current_rule else 0) + 1,
                FIELD_VALID_TILL: (current_rule.valid_till if current_rule else None),
                FIELD_IS_TEMPORARY: (current_rule.is_temporary if current_rule else False),
            }
            rule_data.update({
                k: v for k, v in request.data.items() if k in RULE_FIELDS
            })
            new_rule = Rule.objects.create(**rule_data)
            serializer = RuleSerializer(new_rule, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
class DeleteRuleModificationRequestView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        app = request.data.get(FIELD_APP)
        if not app:
            return Response({"error": "App is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            rule_mod_request = RuleModificationRequest.objects.get(app=app, user=user)
        except RuleModificationRequest.DoesNotExist:
            return Response({"error": "Rule modification request not found or not owned by user."}, status=status.HTTP_404_NOT_FOUND)
        try:
            rule = get_latest_rule(user, app)
        except Rule.DoesNotExist:
            return Response({"error": "Rule not found."}, status=status.HTTP_404_NOT_FOUND)
        rule_mod_request.delete()
        return Response(RuleSerializer(rule, context={'request': request}).data, status=status.HTTP_200_OK)
    
class DeleteRuleView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        app = request.data.get(FIELD_APP)
        if not app:
            return Response({ "error": f"{FIELD_APP} is required." }, status=status.HTTP_400_BAD_REQUEST)
        
        Rule.objects.filter(**{
            FIELD_USER: user,
            FIELD_APP: app
        }).delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ApproveRuleModificationRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        app = request.data.get(FIELD_APP)
        try:
            duo = Duo.objects.get(Q(user1=user) | Q(user2=user))
            other_user = duo.user1 if duo.user2 == user else duo.user2
        except Duo.DoesNotExist:
            return Response({"error": "User is not part of a confirmed duo."}, status=status.HTTP_403_FORBIDDEN)
        if not app:
            return Response({"error": "App is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            rule_mod_request = RuleModificationRequest.objects.get(app=app, user=other_user)
        except RuleModificationRequest.DoesNotExist:
            return Response({"error": "Rule modification request not found or not owned by user."}, status=status.HTTP_404_NOT_FOUND)
        try:
            current_rule = get_latest_rule(other_user, app)
        except Rule.DoesNotExist:
            return Response({"error": "Rule not found."}, status=status.HTTP_404_NOT_FOUND)
        new_rule_data = {
            FIELD_USER: other_user,
            FIELD_APP: app,
            FIELD_APP_DISPLAY_NAME: current_rule.app_display_name,
            FIELD_VERSION: (current_rule.version if current_rule else 0) + 1,
        }
        new_rule_data.update({
            k: v for k, v in rule_mod_request.__dict__.items() if k in RULE_CONSTRAINT_FIELDS
        })
        valid_till = request.data.get(FIELD_VALID_TILL)
        if valid_till:
            try:
                dt = parse_datetime(valid_till)
                new_rule_data[FIELD_VALID_TILL] = dt
            except Exception:
                new_rule_data[FIELD_VALID_TILL] = None
        else:
            new_rule_data[FIELD_VALID_TILL] = None
        new_rule_data[FIELD_IS_TEMPORARY] = request.data.get(FIELD_IS_TEMPORARY, False)
        rule_mod_request.delete()
        rule = Rule.objects.create(**new_rule_data)
        push_notification_data = {
            'title': 'Rule modification request approved',
            'body': f'{user.username} has approved your rule modification request',
        }
        send_push_notification(other_user.fcm_token, **push_notification_data)
        return Response(RuleSerializer(rule, context={'request': request}).data , status=status.HTTP_200_OK)