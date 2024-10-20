from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Duo
from django.utils import timezone
from django.db.models import Q
User = get_user_model()

class DuoInfoSerializer(serializers.ModelSerializer):
    user1 = serializers.StringRelatedField()
    user2 = serializers.StringRelatedField()

    class Meta:
        model = Duo
        fields = ['id', 'user1', 'user2', 'created_at', 'is_confirmed', 'confirmed_at'] 
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return {
            'id': ret['id'],
            'user1': ret['user1'],
            'user2': ret['user2'],
            'createdAt': ret['created_at'],
            'isConfirmed': ret['is_confirmed'],
            'confirmedAt': ret['confirmed_at']
        }

class CreateDuoSerializer(serializers.ModelSerializer):
    user2_username = serializers.CharField(write_only=True)
    class Meta:
        model = Duo
        fields = ['user2_username']

    def validate_user2_username(self, value):
        try:
            user2 = User.objects.get(username=value)
        except User.DoesNotExist:
            raise ValidationError("User with this username does not exist.")
        return user2

    def validate(self, data):
        user1 = self.context['request'].user
        user2 = data['user2_username']

        if user1 == user2:
            raise ValidationError("You cannot create a duo with yourself.")

        if Duo.objects.filter(user1=user1, is_confirmed=True).exists() or Duo.objects.filter(user2=user1, is_confirmed=True).exists():
            raise ValidationError("You already have a confirmed duo.")

        if Duo.objects.filter(user1=user1, user2=user2).exists() or Duo.objects.filter(user1=user2, user2=user1).exists():
            raise ValidationError("A duo between these users already exists.")

        return data

    def create(self, validated_data):
        user1 = self.context['request'].user
        user2 = validated_data['user2_username']
        return Duo.objects.create(user1=user1, user2=user2)

class ConfirmDuoSerializer(serializers.ModelSerializer):
    user1_username = serializers.CharField(write_only=True)

    class Meta:
        model = Duo
        fields = ['user1_username']

    def validate_user1_username(self, value):
        try:
            user1 = User.objects.get(username=value)
        except User.DoesNotExist:
            raise ValidationError("User with this username does not exist.")
        return user1

    def validate(self, data):
        user2 = self.context['request'].user
        user1 = data['user1_username']
        try:
            duo = Duo.objects.get(user1=user1, user2=user2, is_confirmed=False)
        except Duo.DoesNotExist:
            raise ValidationError("No pending duo request found between these users.")
        if Duo.objects.filter(Q(user1=user1, is_confirmed=True) | Q(user2=user1, is_confirmed=True)).exists():
            raise ValidationError("This user is already in a confirmed duo.")
        if Duo.objects.filter(Q(user1=user2, is_confirmed=True) | Q(user2=user2, is_confirmed=True)).exists():
            raise ValidationError("You are already in a confirmed duo.")
        data['duo'] = duo
        return data

    def save(self, **kwargs):
        # Get the duo instance from validated data
        duo = self.validated_data['duo']

        # Update the duo fields
        duo.is_confirmed = True
        duo.confirmed_at = timezone.now()

        # Save the updated duo
        duo.save()
        return duo

class DeleteDuoSerializer(serializers.Serializer):
    with_user_name = serializers.CharField()

    def validate_with_user_name(self, value):
        print(value)
        try:
            other_user = User.objects.get(username=value)
        except User.DoesNotExist:
            raise ValidationError("User with this username does not exist.")
        return other_user

    def validate(self, data):
        current_user = self.context['request'].user
        other_user = data['with_user_name']
        print(current_user, other_user)
        duo = Duo.objects.filter(
            Q(user1=current_user, user2=other_user) | Q(user1=other_user, user2=current_user)
        ).first()

        if not duo:
            raise ValidationError("No duo found between these users.")

        data['duo'] = duo
        return data

    def delete(self):
        duo = self.validated_data['duo']
        duo.delete()