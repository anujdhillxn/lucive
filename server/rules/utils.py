from rest_framework import serializers

# Model field names
FIELD_USER = 'user'
FIELD_APP = 'app'
FIELD_APP_DISPLAY_NAME = 'app_display_name'
FIELD_IS_ACTIVE = 'is_active'
FIELD_DAILY_RESET = 'daily_reset'
FIELD_INTERVENTION_TYPE = 'intervention_type'
FIELD_CREATED_AT = 'created_at'
FIELD_DAILY_MAX_SECONDS = 'daily_max_seconds'
FIELD_IS_DAILY_MAX_SECONDS_ENFORCED = 'is_daily_max_seconds_enforced'
FIELD_HOURLY_MAX_SECONDS = 'hourly_max_seconds'
FIELD_IS_HOURLY_MAX_SECONDS_ENFORCED = 'is_hourly_max_seconds_enforced'
FIELD_SESSION_MAX_SECONDS = 'session_max_seconds'
FIELD_IS_SESSION_MAX_SECONDS_ENFORCED = 'is_session_max_seconds_enforced'
FIELD_IS_STARTUP_DELAY_ENABLED = 'is_startup_delay_enabled'
FIELD_VALID_TILL = 'valid_till'
FIELD_IS_TEMPORARY = 'is_temporary'
FIELD_VERSION = 'version'

RULE_CONSTRAINT_FIELDS = [
    FIELD_APP,
    FIELD_IS_ACTIVE,
    FIELD_DAILY_MAX_SECONDS,
    FIELD_IS_DAILY_MAX_SECONDS_ENFORCED,
    FIELD_DAILY_RESET,
    FIELD_HOURLY_MAX_SECONDS,
    FIELD_IS_HOURLY_MAX_SECONDS_ENFORCED,
    FIELD_SESSION_MAX_SECONDS,
    FIELD_IS_SESSION_MAX_SECONDS_ENFORCED,
    FIELD_IS_STARTUP_DELAY_ENABLED,
    FIELD_INTERVENTION_TYPE,
]

RULE_FIELDS = RULE_CONSTRAINT_FIELDS + [
    FIELD_APP_DISPLAY_NAME,
    FIELD_CREATED_AT,
    FIELD_VALID_TILL,
    FIELD_IS_TEMPORARY,
    FIELD_VERSION,
]

RULE_MODIFICATION_REQUEST_FIELDS = RULE_CONSTRAINT_FIELDS

# Serialized field names (camelCase)
SERIAL_APP = 'app'
SERIAL_APP_DISPLAY_NAME = 'appDisplayName'
SERIAL_IS_ACTIVE = 'isActive'
SERIAL_DAILY_RESET = 'dailyReset'
SERIAL_INTERVENTION_TYPE = 'interventionType'
SERIAL_CREATED_AT = 'createdAt'
SERIAL_IS_MY_RULE = 'isMyRule'
SERIAL_IS_DAILY_MAX_SECONDS_ENFORCED = 'isDailyMaxSecondsEnforced'
SERIAL_IS_HOURLY_MAX_SECONDS_ENFORCED = 'isHourlyMaxSecondsEnforced'
SERIAL_IS_SESSION_MAX_SECONDS_ENFORCED = 'isSessionMaxSecondsEnforced'
SERIAL_DAILY_MAX_SECONDS = 'dailyMaxSeconds'
SERIAL_HOURLY_MAX_SECONDS = 'hourlyMaxSeconds'
SERIAL_SESSION_MAX_SECONDS = 'sessionMaxSeconds'
SERIAL_IS_STARTUP_DELAY_ENABLED = 'isStartupDelayEnabled'
SERIAL_VALID_TILL = 'validTill'
SERIAL_IS_TEMPORARY = 'isTemporary'
SERIAL_VERSION = 'version'

def is_rule_relaxed(new_data, current_rule=None):
    """
    Compare new rule data with current rule to determine if changes are relaxing the constraints.
    If current_rule is None, considers it as a new rule (not relaxation).
    
    Args:
        new_data: dict containing the new rule data
        current_rule: Rule model instance or None
        
    Returns:
        bool: True if any constraint is relaxed, False otherwise
    """
    if current_rule is None:
        return False
        
    if is_startup_delay_disabled(new_data, current_rule):
        return True
    if is_daily_reset_changed(new_data, current_rule):
        return True
    if is_intervention_relaxed(new_data, current_rule):
        return True
    if is_rule_disabled(new_data, current_rule):
        return True
    if is_max_seconds_increased(new_data, current_rule):
        return True
    if is_max_seconds_removed(new_data, current_rule):
        return True
    return False

def is_startup_delay_disabled(new_rule, old_rule):
    return not new_rule.get('is_startup_delay_enabled') and old_rule.is_startup_delay_enabled

def is_daily_reset_changed(new_rule, old_rule):
    return new_rule.get('daily_reset') != str(old_rule.daily_reset)

def is_intervention_relaxed(new_rule, old_rule):
    return new_rule.get('intervention_type') == 'PARTIAL' and old_rule.intervention_type == 'FULL'

def is_rule_disabled(new_rule, old_rule):
    return not new_rule.get('is_active') and old_rule.is_active

def is_rule_modified(new_rule, old_rule):
    if not old_rule:
        return True
    if new_rule.get('is_active') != old_rule.is_active:
        return True
    if new_rule.get('daily_max_seconds') != old_rule.daily_max_seconds:
        return True
    if new_rule.get('hourly_max_seconds') != old_rule.hourly_max_seconds:
        return True
    if new_rule.get('session_max_seconds') != old_rule.session_max_seconds:
        return True
    if new_rule.get('daily_reset') != old_rule.daily_reset:
        return True
    if new_rule.get('intervention_type') != old_rule.intervention_type:
        return True
    if new_rule.get('is_daily_max_seconds_enforced') != old_rule.is_daily_max_seconds_enforced:
        return True
    if new_rule.get('is_hourly_max_seconds_enforced') != old_rule.is_hourly_max_seconds_enforced:
        return True
    if new_rule.get('is_session_max_seconds_enforced') != old_rule.is_session_max_seconds_enforced:
        return True
    if new_rule.get('is_startup_delay_enabled') != old_rule.is_startup_delay_enabled:
        return True
    return False

def is_max_seconds_increased(new_rule, old_rule):
    if new_rule.get('daily_max_seconds') > old_rule.daily_max_seconds:
        return True
    if new_rule.get('hourly_max_seconds') > old_rule.hourly_max_seconds:
        return True
    if new_rule.get('session_max_seconds') > old_rule.session_max_seconds:
        return True
    return False

def is_max_seconds_removed(new_rule, old_rule):
    if not new_rule.get('is_daily_max_seconds_enforced') and old_rule.is_daily_max_seconds_enforced:
        return True
    if not new_rule.get('is_hourly_max_seconds_enforced') and old_rule.is_hourly_max_seconds_enforced:
        return True
    if not new_rule.get('is_session_max_seconds_enforced') and old_rule.is_session_max_seconds_enforced:
        return True
    return False