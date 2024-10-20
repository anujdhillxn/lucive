from rest_framework import serializers
from .models import Rule
from duos.models import Duo
from django.db import models
import json

class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance) 
        return {
            'app': ret['app'],
            'ruleType': ret['ruletype'],
            'changeAllowed': ret['change_allowed'],
            'isActive': ret['is_active'],
            'details': json.loads(ret['rule_details']),
            'isMyRule': instance.user == self.context['request'].user
        }


class UpdateRuleSerializer(serializers.ModelSerializer):
    app = serializers.CharField()
    ruletype = serializers.CharField()
    rule_details = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = Rule
        fields = ['app', 'ruletype', 'rule_details', 'is_active']

    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        ruletype = data.get('ruletype')
        try:
            duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)), is_confirmed=True)
            other_user = duo.user1 if duo.user2 == user else duo.user2
        except Duo.DoesNotExist:
            raise serializers.ValidationError("No confirmed duo found.")
        try:
            rule = Rule.objects.get(user=other_user, app=app, ruletype=ruletype)
        except Rule.DoesNotExist:
            raise serializers.ValidationError("Rule not found or you do not have permission to edit this rule.")
        if not rule.change_allowed:
            raise serializers.ValidationError("Changes to this rule are not allowed.")
        self.instance = rule
        return data
    
    def update(self, instance, validated_data):
        if('rule_details' in validated_data):
            instance.rule_details = validated_data.get('rule_details')
        if('is_active' in validated_data):
            instance.is_active = validated_data.get('is_active')
        instance.change_allowed = False
        instance.save()
        return instance

class DeleteRuleSerializer(serializers.Serializer):
    app = serializers.CharField()
    ruletype = serializers.CharField()
    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        ruletype = data.get('ruletype')
        try:
            duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)), is_confirmed=True)
            other_user = duo.user1 if duo.user2 == user else duo.user2
        except Duo.DoesNotExist:
            raise serializers.ValidationError("No confirmed duo found.")
        try:
            rule = Rule.objects.get(user=other_user, app=app, ruletype=ruletype)
        except Rule.DoesNotExist:
            raise serializers.ValidationError("Rule not found or you do not have permission to edit this rule.")
        if not rule.change_allowed:
            raise serializers.ValidationError("Changes to this rule are not allowed.")
        data['rule'] = rule
        return data

    def delete(self):
        rule = self.validated_data['rule']
        rule.delete()

class AllowChangeToRuleSerializer(serializers.ModelSerializer):
    app = serializers.CharField()
    ruletype = serializers.CharField()

    class Meta:
        model = Rule
        fields = ['app', 'ruletype']

    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        ruletype = data.get('ruletype')
        try:
            duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)), is_confirmed=True)
            other_user = duo.user1 if duo.user2 == user else duo.user2
        except Duo.DoesNotExist:
            raise serializers.ValidationError("No confirmed duo found.")
        try:
            rule = Rule.objects.get(user=user, app=app, ruletype=ruletype)
        except Rule.DoesNotExist:
            raise serializers.ValidationError("Rule not found or you do not have permission to edit this rule.")
        self.instance = rule
        return data
    
    def update(self, instance, validated_data):
        instance.change_allowed = not instance.change_allowed
        instance.save()
        return instance
      
class CreateRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = ['app', 'ruletype', 'rule_details', 'is_active']

    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        ruletype = data.get('ruletype')
        try:
            duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)), is_confirmed=True)
        except Duo.DoesNotExist:
            raise serializers.ValidationError("No confirmed duo found.")
        if Rule.objects.filter(user=user, app=app, ruletype=ruletype).exists():
            raise serializers.ValidationError("Rule already exists.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        rule = Rule.objects.create(user=user, **validated_data)
        return rule