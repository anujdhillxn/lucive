import time
import re
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if not re.match(r'^[\w.]+$', value):
            raise serializers.ValidationError("Username should be alphanumeric with underscores and dots.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password should be at least 8 characters long.")
        return value
    
    def validate_email(self, value):
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'invitation_token', 'date_joined']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        date_joined_seconds = str(int(instance.date_joined.timestamp()))
        return {
            'username': ret['username'],
            'email': ret['email'],
            'invitationToken': ret['invitation_token'],
            'dateJoinedSeconds': date_joined_seconds
        }

class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get('identifier')
        password = data.get('password')

        if identifier and password:
            if '@' in identifier:
                # Treat identifier as email
                try:
                    user = User.objects.get(email=identifier)
                    username = user.username
                except User.DoesNotExist:
                    raise serializers.ValidationError("Invalid credentials")
            else:
                # Treat identifier as username
                username = identifier

            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    return user
                else:
                    raise serializers.ValidationError("User is inactive")
            else:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Both identifier and password are required")

class ChangeUsernameSerializer(serializers.Serializer):
    new_username = serializers.CharField(max_length=150)

    def validate_new_username(self, value):
        if not re.match(r'^[\w.]+$', value):
            raise serializers.ValidationError("Username should be alphanumeric with underscores and dots.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        instance.username = validated_data['new_username']
        instance.save()
        return instance