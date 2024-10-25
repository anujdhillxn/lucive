from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Duo
from .serializers import CreateDuoSerializer, DeleteDuoSerializer, DuoInfoSerializer
from django.db.models import Q
class GetDuoView(generics.ListAPIView):
    serializer_class = DuoInfoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = self.request.user
        duo = Duo.objects.filter(Q(user1=user) | Q(user2=user)).first()
        if not duo:
            return Response({'error': 'User is not part of a duo'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(duo)
        return Response(serializer.data)
    
class CreateDuoView(generics.CreateAPIView):
    serializer_class = CreateDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        duo = serializer.save()
        response_serializer = DuoInfoSerializer(duo)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
class DeleteDuoView(generics.DestroyAPIView):
    serializer_class = DeleteDuoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)