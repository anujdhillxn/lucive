import uuid
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
        fields = ['id', 'user1', 'user2', 'created_at'] 
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        return {
            'user1': ret['user1'],
            'user2': ret['user2'],
            'createdAt': ret['created_at']
        }

class CreateDuoSerializer(serializers.ModelSerializer):
    invitation_token = serializers.CharField(write_only=True)
    class Meta:
        model = Duo
        fields = ['invitation_token']

    def validate_invitation_token(self, value):
        try:
            user2 = User.objects.get(invitation_token=value)
        except User.DoesNotExist:
            raise ValidationError("User with this invitation token does not exist.")
        return user2

    def validate(self, data):
        user1 = self.context['request'].user
        user2 = data['invitation_token']

        if user1 == user2:
            raise ValidationError("You cannot create a duo with yourself.")

        if Duo.objects.filter(user1=user1).exists() or Duo.objects.filter(user2=user1).exists():
            raise ValidationError("You already have a duo.")
        
        if Duo.objects.filter(user1=user2).exists() or Duo.objects.filter(user2=user2).exists():
            raise ValidationError("This user is already in a duo.")

        return data

    def create(self, validated_data):
        user1 = self.context['request'].user
        user2 = validated_data['invitation_token']
        return Duo.objects.create(user1=user1, user2=user2)

class DeleteDuoSerializer(serializers.Serializer):
    def validate(self, data):
        current_user = self.context['request'].user
        duo = Duo.objects.filter(
            Q(user1=current_user) | Q(user2=current_user)
        ).first()

        if not duo:
            raise ValidationError("No duo found for this user.")

        data['duo'] = duo
        return data

    def delete(self):
        duo = self.validated_data['duo']
        user = self.context['request'].user
        other_user = duo.user1 if duo.user2 == user else duo.user2
        other_user.invitation_token = uuid.uuid4()
        user.invitation_token = self.context['new_user_token']
        other_user.save()
        user.save()
        duo.delete()