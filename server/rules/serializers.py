from rest_framework import serializers
from .models import Rule, RuleModificationRequest
from duos.models import Duo
from django.db import models
import json

class RuleSerializer(serializers.ModelSerializer):
    isMyRule = serializers.SerializerMethodField()

    class Meta:
        model = Rule
        fields = '__all__'

    def get_isMyRule(self, instance):
        return instance.user == self.context['request'].user

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        res = {
            'app': ret['app'],
            'appDisplayName': ret['app_display_name'],
            'isActive': ret['is_active'],
            'dailyReset': ret['daily_reset'],
            'interventionType': ret['intervention_type'],
            'createdAt': ret['created_at'],
            'lastModifiedAt': ret['last_modified_at'],
            'isMyRule': self.get_isMyRule(instance),
        }
        if ret['daily_max_seconds']:
            res['dailyMaxSeconds'] = ret['daily_max_seconds']
        if ret['hourly_max_seconds']:
            res['hourlyMaxSeconds'] = ret['hourly_max_seconds']
        if ret['session_max_seconds']:
            res['sessionMaxSeconds'] = ret['session_max_seconds']
        return res

class RuleModificationRequestSerializer(serializers.ModelSerializer):
    isMyRule = serializers.SerializerMethodField()

    class Meta:
        model = RuleModificationRequest
        fields = '__all__'

    def get_isMyRule(self, instance):
        return instance.user == self.context['request'].user

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        res = {
            'app': ret['app'],
            'isActive': ret['is_active'],
            'dailyReset': ret['daily_reset'],
            'interventionType': ret['intervention_type'],
            'isMyRule': self.get_isMyRule(instance),
        }
        if ret['daily_max_seconds']:
            res['dailyMaxSeconds'] = ret['daily_max_seconds']
        if ret['hourly_max_seconds']:
            res['hourlyMaxSeconds'] = ret['hourly_max_seconds']
        if ret['session_max_seconds']:
            res['sessionMaxSeconds'] = ret['session_max_seconds']
        return res

class DeleteRuleSerializer(serializers.Serializer):
    app = serializers.CharField()
    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        try:
            rule = Rule.objects.get(user=user, app=app)
        except Rule.DoesNotExist:
            raise serializers.ValidationError("Rule not found or you do not have permission to edit this rule.")
        if rule.is_active:
            raise serializers.ValidationError("You cannot delete an active rule.")
        data['rule'] = rule
        return data

    def delete(self):
        rule = self.validated_data['rule']
        rule.delete()
      
class CreateRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = [
            'app', 'app_display_name', 'is_active', 'daily_max_seconds', 'hourly_max_seconds',
            'session_max_seconds', 'daily_reset', 'intervention_type'
        ]

    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        try:
            duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)))
        except Duo.DoesNotExist:
            raise serializers.ValidationError("No confirmed duo found.")
        if Rule.objects.filter(user=user, app=app).exists():
            raise serializers.ValidationError("Rule already exists.")
        return data

    def create(self, validated_data):
        if validated_data.get('app_display_name') is None or validated_data.get('app_display_name') == '':
            validated_data['app_display_name'] = validated_data['app']
        user = self.context['request'].user
        rule = Rule.objects.create(user=user, **validated_data)
        return rule

class UpdateRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = [
            'app', 'is_active', 'daily_max_seconds', 'hourly_max_seconds',
            'session_max_seconds', 'daily_reset', 'intervention_type'
        ]

    def validate(self, data):
        rule = self.instance
        self.check_if_rule_disabled(data, rule)
        self.check_if_rule_modified(data, rule)
        self.check_if_max_seconds_increased(data, rule)
        self.check_if_max_seconds_removed(data, rule)
        self.check_if_intervention_relaxed(data, rule)
        self.check_if_daily_reset_changed(data, rule)
        return data
    
    def check_if_daily_reset_changed(self, new_rule, old_rule):
        if new_rule.get('daily_reset') != old_rule.daily_reset:
            raise serializers.ValidationError("You cannot change the daily reset time.")
    
    def check_if_intervention_relaxed(self, new_rule, old_rule):
        if new_rule.get('intervention_type') == 'PARTIAL' and old_rule.intervention_type == 'FULL':
            raise serializers.ValidationError("You cannot relax the intervention type.")
    
    def check_if_rule_disabled(self, new_rule, old_rule):
        if not new_rule.get('is_active') and old_rule.is_active:
            raise serializers.ValidationError("You cannot disable an active rule.")
    
    def check_if_rule_modified(self, new_rule, old_rule):
        if new_rule.get('is_active') != old_rule.is_active:
            return
        if new_rule.get('daily_max_seconds') != old_rule.daily_max_seconds:
            return
        if new_rule.get('hourly_max_seconds') != old_rule.hourly_max_seconds:
            return
        if new_rule.get('session_max_seconds') != old_rule.session_max_seconds:
            return
        if new_rule.get('daily_reset') != old_rule.daily_reset:
            return
        if new_rule.get('intervention_type') != old_rule.intervention_type:
            return
        raise serializers.ValidationError("No changes detected.")
    
    def check_if_max_seconds_removed(self, new_rule, old_rule):
        if new_rule.get('daily_max_seconds') is None and old_rule.daily_max_seconds:
            raise serializers.ValidationError("You cannot remove the daily max seconds.")
        if new_rule.get('hourly_max_seconds') is None and old_rule.hourly_max_seconds:
            raise serializers.ValidationError("You cannot remove the hourly max seconds.")
        if new_rule.get('session_max_seconds') is None and old_rule.session_max_seconds:
            raise serializers.ValidationError("You cannot remove the session max seconds.")

    def check_if_max_seconds_increased(self, new_rule, old_rule):
        if new_rule.get('daily_max_seconds') and new_rule['daily_max_seconds'] > old_rule.daily_max_seconds:
            raise serializers.ValidationError("You cannot increase the daily max seconds.")
        if new_rule.get('hourly_max_seconds') and new_rule['hourly_max_seconds'] > old_rule.hourly_max_seconds:
            raise serializers.ValidationError("You cannot increase the hourly max seconds.")
        if new_rule.get('session_max_seconds') and new_rule['session_max_seconds'] > old_rule.session_max_seconds:
            raise serializers.ValidationError("You cannot increase the session max seconds.")

    def update(self, instance, validated_data):
        instance.app = validated_data['app']
        instance.is_active = validated_data['is_active']
        instance.daily_max_seconds = validated_data['daily_max_seconds']
        instance.hourly_max_seconds = validated_data['hourly_max_seconds']
        #instance.session_max_seconds = validated_data['session_max_seconds']
        instance.daily_reset = validated_data['daily_reset']
        instance.intervention_type = validated_data['intervention_type']
        instance.save()
        return instance
    

class CreateRuleModificationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RuleModificationRequest
        fields = [
            'app', 'is_active', 'daily_max_seconds', 'hourly_max_seconds',
            'session_max_seconds', 'daily_reset', 'intervention_type'
        ]

    def validate(self, data):
        user = self.context['request'].user
        app = data.get('app')
        if not app:
            raise serializers.ValidationError("App is required.")
        try:
            duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)))
        except Duo.DoesNotExist:
            raise serializers.ValidationError("No confirmed duo found.")
        if RuleModificationRequest.objects.filter(user=user, app=app).exists():
            raise serializers.ValidationError("Rule modification request already exists.")
        try:
            rule = Rule.objects.get(app=app, user=user)
        except Rule.DoesNotExist:
            raise serializers.ValidationError("Rule not found or not owned by user.")
        self.check_if_rule_modified(data, rule)
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        rule_mod_request = RuleModificationRequest.objects.create(user=user, **validated_data)
        return rule_mod_request
    
    def check_if_rule_modified(self, new_rule, old_rule):
        if new_rule.get('is_active') != old_rule.is_active:
            return
        if new_rule.get('daily_max_seconds') != old_rule.daily_max_seconds:
            return
        if new_rule.get('hourly_max_seconds') != old_rule.hourly_max_seconds:
            return
        if new_rule.get('session_max_seconds') != old_rule.session_max_seconds:
            return
        if new_rule.get('daily_reset') != old_rule.daily_reset:
            return
        if new_rule.get('intervention_type') != old_rule.intervention_type:
            return
        raise serializers.ValidationError("No changes detected.")