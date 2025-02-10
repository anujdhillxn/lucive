import uuid
from django.http import HttpResponseRedirect
from django.views import View
from rest_framework import generics, status, permissions
from rest_framework.response import Response

from .responses import CustomSchemeRedirect
from .models import Duo
from .serializers import CreateDuoSerializer, DeleteDuoSerializer, DuoInfoSerializer
from django.db.models import Q
from lucive.push_notifications import send_push_notification
class GetDuoView(generics.ListAPIView):
    serializer_class = DuoInfoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = self.request.user
        duo = Duo.objects.filter(Q(user1=user) | Q(user2=user)).first()
        if not duo:
            return Response({'found' : False}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(duo)
        return Response({'found' : True, 'duo': serializer.data}, status=status.HTTP_200_OK)
    
class CreateDuoView(generics.CreateAPIView):
    serializer_class = CreateDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        duo = serializer.save()
        push_notification_data = {
            'title': 'Duo Invitation accepted',
            'body': f'{duo.user1.username} has accepted your Duo invitation',
        }
        send_push_notification(duo.user2.fcm_token, **push_notification_data)
        response_serializer = DuoInfoSerializer(duo)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
class DeleteDuoView(generics.DestroyAPIView):
    serializer_class = DeleteDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        new_user_token = uuid.uuid4()
        serializer = self.get_serializer(data=request.data, context={'request': request, 'new_user_token': new_user_token})
        serializer.is_valid(raise_exception=True)
        serializer.delete()
        return Response(new_user_token, status=status.HTTP_200_OK)
    
class DeepLinkRedirectView(View):
    def get(self, request, *args, **kwargs):
        invitation_token = kwargs.get('invitation_token')
        if invitation_token:
            deep_link_url = f"com.lucive://open?invitationToken={invitation_token}"
            return CustomSchemeRedirect(deep_link_url)
        else:
            # Handle the case where the invitation token is missing
            return Response("Invitation token is missing", status=status.HTTP_400_BAD_REQUEST)