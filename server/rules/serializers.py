from rest_framework import serializers
from .models import Rule, RuleModificationRequest
from .utils import *
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
            SERIAL_APP: ret[FIELD_APP],
            SERIAL_APP_DISPLAY_NAME: ret[FIELD_APP_DISPLAY_NAME],
            SERIAL_IS_ACTIVE: ret[FIELD_IS_ACTIVE],
            SERIAL_DAILY_RESET: ret[FIELD_DAILY_RESET],
            SERIAL_INTERVENTION_TYPE: ret[FIELD_INTERVENTION_TYPE],
            SERIAL_CREATED_AT: ret[FIELD_CREATED_AT],
            SERIAL_IS_MY_RULE: self.get_isMyRule(instance),
            SERIAL_IS_DAILY_MAX_SECONDS_ENFORCED: ret[FIELD_IS_DAILY_MAX_SECONDS_ENFORCED],
            SERIAL_IS_HOURLY_MAX_SECONDS_ENFORCED: ret[FIELD_IS_HOURLY_MAX_SECONDS_ENFORCED],
            SERIAL_IS_SESSION_MAX_SECONDS_ENFORCED: ret[FIELD_IS_SESSION_MAX_SECONDS_ENFORCED],
            SERIAL_DAILY_MAX_SECONDS: ret[FIELD_DAILY_MAX_SECONDS],
            SERIAL_HOURLY_MAX_SECONDS: ret[FIELD_HOURLY_MAX_SECONDS],
            SERIAL_SESSION_MAX_SECONDS: ret[FIELD_SESSION_MAX_SECONDS],
            SERIAL_IS_STARTUP_DELAY_ENABLED: ret[FIELD_IS_STARTUP_DELAY_ENABLED],
            SERIAL_VALID_TILL: instance.valid_till.isoformat() if instance.valid_till else '',
            SERIAL_IS_TEMPORARY: ret[FIELD_IS_TEMPORARY],
            SERIAL_VERSION: ret[FIELD_VERSION]
        }
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
            SERIAL_APP: ret[FIELD_APP],
            SERIAL_IS_ACTIVE: ret[FIELD_IS_ACTIVE],
            SERIAL_DAILY_RESET: ret[FIELD_DAILY_RESET],
            SERIAL_INTERVENTION_TYPE: ret[FIELD_INTERVENTION_TYPE],
            SERIAL_IS_MY_RULE: self.get_isMyRule(instance),
            SERIAL_IS_DAILY_MAX_SECONDS_ENFORCED: ret[FIELD_IS_DAILY_MAX_SECONDS_ENFORCED],
            SERIAL_IS_HOURLY_MAX_SECONDS_ENFORCED: ret[FIELD_IS_HOURLY_MAX_SECONDS_ENFORCED],
            SERIAL_IS_SESSION_MAX_SECONDS_ENFORCED: ret[FIELD_IS_SESSION_MAX_SECONDS_ENFORCED],
            SERIAL_DAILY_MAX_SECONDS: ret[FIELD_DAILY_MAX_SECONDS],
            SERIAL_HOURLY_MAX_SECONDS: ret[FIELD_HOURLY_MAX_SECONDS],
            SERIAL_SESSION_MAX_SECONDS: ret[FIELD_SESSION_MAX_SECONDS],
            SERIAL_IS_STARTUP_DELAY_ENABLED: ret[FIELD_IS_STARTUP_DELAY_ENABLED]
        }
        return res

# ... rest of your code ...

# class DeleteRuleSerializer(serializers.Serializer):
#     app = serializers.CharField()
#     def validate(self, data):
#         user = self.context['request'].user
#         app = data.get('app')
#         try:
#             rule = Rule.objects.get(user=user, app=app)
#         except Rule.DoesNotExist:
#             raise serializers.ValidationError("Rule not found or you do not have permission to edit this rule.")
#         if rule.is_active:
#             raise serializers.ValidationError("You cannot delete an active rule.")
#         data['rule'] = rule
#         try:
#             rule_mod_request = RuleModificationRequest.objects.get(user=user, app=app)
#             data['rule_mod_request'] = rule_mod_request
#         except RuleModificationRequest.DoesNotExist:
#             data['rule_mod_request'] = None
#         return data

#     def delete(self):
#         rule = self.validated_data['rule']
#         rule_mod_request = self.validated_data['rule_mod_request']
#         if rule_mod_request:
#             rule_mod_request.delete()
#         rule.delete()
      
# class CreateRuleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Rule
#         fields = [
#             'app', 'app_display_name', 'is_active', 'daily_max_seconds', 'is_daily_max_seconds_enforced', 'hourly_max_seconds', 'is_hourly_max_seconds_enforced',
#             'session_max_seconds', 'is_session_max_seconds_enforced', 'daily_reset', 'intervention_type', 'is_startup_delay_enabled'
#         ]

#     def validate(self, data):
#         user = self.context['request'].user
#         app = data.get('app')
#         try:
#             duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)))
#         except Duo.DoesNotExist:
#             raise serializers.ValidationError("No confirmed duo found.")
#         if Rule.objects.filter(user=user, app=app).exists():
#             raise serializers.ValidationError("Rule already exists.")
#         return data

#     def create(self, validated_data):
#         if validated_data.get('app_display_name') is None or validated_data.get('app_display_name') == '':
#             validated_data['app_display_name'] = validated_data['app']
#         user = self.context['request'].user
#         rule = Rule.objects.create(user=user, **validated_data)
#         return rule

# class UpdateRuleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Rule
#         fields = [
#             'app', 'is_active', 'daily_max_seconds', 'hourly_max_seconds',
#             'session_max_seconds', 'daily_reset', 'intervention_type',
#             'is_daily_max_seconds_enforced', 'is_hourly_max_seconds_enforced',
#             'is_session_max_seconds_enforced', 'is_startup_delay_enabled'
#         ]

#     def validate(self, data):
#         rule = self.instance
#         self.check_if_rule_disabled(data, rule)
#         self.check_if_rule_modified(data, rule)
#         self.check_if_max_seconds_increased(data, rule)
#         self.check_if_max_seconds_removed(data, rule)
#         self.check_if_intervention_relaxed(data, rule)
#         self.check_if_daily_reset_changed(data, rule)
#         self.check_if_startup_delay_disabled(data, rule)
#         return data
    
#     def check_if_startup_delay_disabled(self, new_rule, old_rule):
#         if not new_rule.get('is_startup_delay_enabled') and old_rule.is_startup_delay_enabled:
#             raise serializers.ValidationError("You cannot disable the startup delay.")
    
#     def check_if_daily_reset_changed(self, new_rule, old_rule):
#         if new_rule.get('daily_reset') != old_rule.daily_reset:
#             raise serializers.ValidationError("You cannot change the daily reset time.")
    
#     def check_if_intervention_relaxed(self, new_rule, old_rule):
#         if new_rule.get('intervention_type') == 'PARTIAL' and old_rule.intervention_type == 'FULL':
#             raise serializers.ValidationError("You cannot relax the intervention type.")
    
#     def check_if_rule_disabled(self, new_rule, old_rule):
#         if not new_rule.get('is_active') and old_rule.is_active:
#             raise serializers.ValidationError("You cannot disable an active rule.")
    
#     def check_if_rule_modified(self, new_rule, old_rule):
#         if new_rule.get('is_active') != old_rule.is_active:
#             return
#         if new_rule.get('daily_max_seconds') != old_rule.daily_max_seconds:
#             return
#         if new_rule.get('hourly_max_seconds') != old_rule.hourly_max_seconds:
#             return
#         if new_rule.get('session_max_seconds') != old_rule.session_max_seconds:
#             return
#         if new_rule.get('daily_reset') != old_rule.daily_reset:
#             return
#         if new_rule.get('intervention_type') != old_rule.intervention_type:
#             return
#         if new_rule.get('is_daily_max_seconds_enforced') != old_rule.is_daily_max_seconds_enforced:
#             return
#         if new_rule.get('is_hourly_max_seconds_enforced') != old_rule.is_hourly_max_seconds_enforced:
#             return
#         if new_rule.get('is_session_max_seconds_enforced') != old_rule.is_session_max_seconds_enforced:
#             return
#         if new_rule.get('is_startup_delay_enabled') != old_rule.is_startup_delay_enabled:
#             return
#         raise serializers.ValidationError("No changes detected.")
    
#     def check_if_max_seconds_increased(self, new_rule, old_rule):
#         if new_rule.get('daily_max_seconds') > old_rule.daily_max_seconds:
#             raise serializers.ValidationError("You cannot increase the daily max seconds.")
#         if new_rule.get('hourly_max_seconds') > old_rule.hourly_max_seconds:
#             raise serializers.ValidationError("You cannot increase the hourly max seconds.")
#         if new_rule.get('session_max_seconds') > old_rule.session_max_seconds:
#             raise serializers.ValidationError("You cannot increase the session max seconds.")
    
#     def check_if_max_seconds_removed(self, new_rule, old_rule):
#         if not new_rule.get('is_daily_max_seconds_enforced') and old_rule.is_daily_max_seconds_enforced:
#             raise serializers.ValidationError("You cannot remove the daily max seconds.")
#         if not new_rule.get('is_hourly_max_seconds_enforced') and old_rule.is_hourly_max_seconds_enforced:
#             raise serializers.ValidationError("You cannot remove the hourly max seconds.")
#         if not new_rule.get('is_session_max_seconds_enforced') and old_rule.is_session_max_seconds_enforced:
#             raise serializers.ValidationError("You cannot remove the session max seconds.")

#     def update(self, instance, validated_data):
#         instance.app = validated_data['app']
#         instance.is_active = validated_data['is_active']
#         instance.daily_max_seconds = validated_data['daily_max_seconds']
#         instance.hourly_max_seconds = validated_data['hourly_max_seconds']
#         instance.session_max_seconds = validated_data['session_max_seconds']
#         instance.is_daily_max_seconds_enforced = validated_data['is_daily_max_seconds_enforced']
#         instance.is_hourly_max_seconds_enforced = validated_data['is_hourly_max_seconds_enforced']
#         instance.is_session_max_seconds_enforced = validated_data['is_session_max_seconds_enforced']
#         instance.daily_reset = validated_data['daily_reset']
#         instance.intervention_type = validated_data['intervention_type']
#         instance.is_startup_delay_enabled = validated_data['is_startup_delay_enabled']
#         instance.save()
#         return instance
    

# class CreateRuleModificationRequestSerializer(serializers.ModelSerializer):
    # class Meta:
    #     model = RuleModificationRequest
    #     fields = [
    #         'app', 'is_active', 'daily_max_seconds', 'hourly_max_seconds',
    #         'session_max_seconds', 'daily_reset', 'intervention_type',
    #         'is_daily_max_seconds_enforced', 'is_hourly_max_seconds_enforced', 'is_session_max_seconds_enforced', 'is_startup_delay_enabled'
    #     ]

    # def validate(self, data):
    #     user = self.context['request'].user
    #     app = data.get('app')
    #     if not app:
    #         raise serializers.ValidationError("App is required.")
    #     try:
    #         duo = Duo.objects.get((models.Q(user1=user) | models.Q(user2=user)))
    #     except Duo.DoesNotExist:
    #         raise serializers.ValidationError("No confirmed duo found.")
    #     if RuleModificationRequest.objects.filter(user=user, app=app).exists():
    #         raise serializers.ValidationError("Rule modification request already exists.")
    #     try:
    #         rule = Rule.objects.get(app=app, user=user)
    #     except Rule.DoesNotExist:
    #         raise serializers.ValidationError("Rule not found or not owned by user.")
    #     self.check_if_rule_modified(data, rule)
    #     return data

    # def create(self, validated_data):
    #     user = self.context['request'].user
    #     rule_mod_request = RuleModificationRequest.objects.create(user=user, **validated_data)
    #     return rule_mod_request
    
    # def check_if_rule_modified(self, new_rule, old_rule):
    #     if new_rule.get('is_active') != old_rule.is_active:
    #         return
    #     if new_rule.get('daily_max_seconds') != old_rule.daily_max_seconds:
    #         return
    #     if new_rule.get('hourly_max_seconds') != old_rule.hourly_max_seconds:
    #         return
    #     if new_rule.get('session_max_seconds') != old_rule.session_max_seconds:
    #         return
    #     if new_rule.get('daily_reset') != old_rule.daily_reset:
    #         return
    #     if new_rule.get('intervention_type') != old_rule.intervention_type:
    #         return
    #     if new_rule.get('is_daily_max_seconds_enforced') != old_rule.is_daily_max_seconds_enforced:
    #         return
    #     if new_rule.get('is_hourly_max_seconds_enforced') != old_rule.is_hourly_max_seconds_enforced:
    #         return
    #     if new_rule.get('is_session_max_seconds_enforced') != old_rule.is_session_max_seconds_enforced:
    #         return
    #     if new_rule.get('is_startup_delay_enabled') != old_rule.is_startup_delay_enabled:
    #         return
    #     raise serializers.ValidationError("No changes detected.")