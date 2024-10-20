from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Duo
from .serializers import CreateDuoSerializer, ConfirmDuoSerializer, DeleteDuoSerializer, DuoInfoSerializer
from django.db.models import Q
class ListDuoInfoView(generics.ListAPIView):
    serializer_class = DuoInfoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        current_user = self.request.user
        my_duos = Duo.objects.filter(Q(user1=current_user) | Q(user2=current_user))
        my_confirmed_duos = my_duos.filter(is_confirmed=True)
        duo_requests_received = my_duos.filter(user2=current_user, is_confirmed=False)
        duo_requests_sent = my_duos.filter(user1=current_user, is_confirmed=False)
        confirmed_duos = Duo.objects.filter(is_confirmed=True).exclude(Q(user1=current_user) | Q(user2=current_user))
        exclude_confirmed = Q(user1__in=confirmed_duos.values('user1')) | Q(user2__in=confirmed_duos.values('user2')) | Q(user2__in=confirmed_duos.values('user1')) | Q(user1__in=confirmed_duos.values('user2'))
        duo_requests_received_exclude_confirmed = duo_requests_received.exclude(exclude_confirmed)
        duo_requests_sent_exclude_confirmed = duo_requests_sent.exclude(exclude_confirmed)
        return Response({
            'myDuo': DuoInfoSerializer(my_confirmed_duos, many=True).data,
            'requestsReceived': DuoInfoSerializer(duo_requests_received_exclude_confirmed, many=True).data,
            'requestsSent': DuoInfoSerializer(duo_requests_sent_exclude_confirmed, many=True).data
        }, status=status.HTTP_200_OK)
    
class CreateDuoView(generics.CreateAPIView):
    serializer_class = CreateDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ConfirmDuoView(generics.UpdateAPIView):
    serializer_class = ConfirmDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        duo = serializer.validated_data['duo']  # Get the duo object from validated data
        serializer.save(instance=duo)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DeleteDuoView(generics.DestroyAPIView):
    serializer_class = DeleteDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)