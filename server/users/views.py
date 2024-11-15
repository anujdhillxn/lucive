from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChangeUsernameSerializer, RegisterSerializer, UserSerializer, LoginSerializer
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny

import requests
import hashlib
import random
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
User = get_user_model()

class GoogleOAuthRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify the token with Google
        response = requests.get(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'id_token': access_token}
        )
        if response.status_code  != 200:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = response.json()
        email = user_info.get('email')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a random username
        random_hash = hashlib.sha256(str(random.getrandbits(256)).encode('utf-8')).hexdigest()[:8]
        username = f"USER{random_hash}"

        # Create or get the user
        user, created = User.objects.get_or_create(email=email, defaults={'username': username})

        if created:
            user.set_unusable_password() 
            user.save()

        # Generate a token for the user
        token, _ = Token.objects.get_or_create(user=user)

        return Response({'token': token.key}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Override default permission classes
    authentication_classes = []  # Override default authentication classes
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserInfoView(APIView):

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    permission_classes = [AllowAny]  # Override default permission classes
    authentication_classes = []  # Override default authentication classes
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)
    
class ChangeUsernameView(APIView):
    def put(self, request):
        user = request.user
        serializer = ChangeUsernameSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(user, serializer.validated_data)
            user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SetFCMTokenView(APIView):
    def put(self, request):
        user = request.user
        user.fcm_token = request.data.get('fcm_token')
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)