from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Rule
from rest_framework import status
from .serializers import RuleSerializer, UpdateRuleSerializer, CreateRuleSerializer, AllowChangeToRuleSerializer, DeleteRuleSerializer
from duos.models import Duo
from django.db.models import Q
class UserRulesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        confirmed_duo = Duo.objects.filter(
            (Q(user1=user) | Q(user2=user)) & Q(is_confirmed=True)
        ).first()
        if not confirmed_duo:
            return Response({'error': 'User is not part of a confirmed duo'}, status=status.HTTP_403_FORBIDDEN)
        duo_partner = confirmed_duo.user1 if confirmed_duo.user2 == user else confirmed_duo.user2
        rules = Rule.objects.filter(Q(user=user) | Q(user=duo_partner))
        serializer = RuleSerializer(rules, many=True, context={'request': request})
        return Response(serializer.data)

class UpdateRuleView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UpdateRuleSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            rule = serializer.save()
            return Response(UpdateRuleSerializer(rule).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AllowChangeToRuleView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = AllowChangeToRuleSerializer(data=request.data,context={'request': request})
        if serializer.is_valid():
            rule = serializer.save()
            return Response(AllowChangeToRuleSerializer(rule).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class CreateRuleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateRuleSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            rule = serializer.save()
            return Response(CreateRuleSerializer(rule).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteRuleView(DestroyAPIView):
    serializer_class = DeleteRuleSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)