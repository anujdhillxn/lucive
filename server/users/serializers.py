from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

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
        fields = ['id', 'username', 'email', 'invitation_token']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return {
            'username': ret['username'],
            'email': ret['email'],
            'invitationToken': ret['invitation_token']
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