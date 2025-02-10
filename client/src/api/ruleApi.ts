import { Remote } from "../types/api";
import {
    Rule,
    RuleModificationData,
    RuleModificationRequest,
} from "../types/state";

export const createRuleApi = (remote: Remote) => {
    const { get, post, del } = remote;

    const getRules = (): Promise<Rule[]> => {
        return get("rules/user-rules");
    };

    const updateRule = (rule: RuleModificationRequest): Promise<Rule> => {
        return post("rules/update-rule", {
            app: rule.app,
            app_display_name: rule.appDisplayName,
            daily_max_seconds: rule.dailyMaxSeconds,
            hourly_max_seconds: rule.hourlyMaxSeconds,
            session_max_seconds: rule.sessionMaxSeconds,
            is_daily_max_seconds_enforced: rule.isDailyMaxSecondsEnforced,
            is_hourly_max_seconds_enforced: rule.isHourlyMaxSecondsEnforced,
            is_session_max_seconds_enforced: rule.isSessionMaxSecondsEnforced,
            intervention_type: rule.interventionType,
            daily_reset: rule.dailyReset,
            is_active: rule.isActive,
            is_startup_delay_enabled: rule.isStartupDelayEnabled,
        });
    };

    const approveRuleModificationRequest = (
        app: string,
        validTill: string,
        isTemporary: boolean
    ): Promise<Rule> => {
        return post(`rules/approve-rule-modification-request`, {
            app,
            valid_till: validTill,
            is_temporary: isTemporary,
        });
    };

    const deleteRule = (app: string): Promise<Rule> => {
        return del("rules/delete-rule", { app });
    };

    const deleteRuleModificationRequest = (app: string): Promise<Rule> => {
        return del("rules/delete-rule-modification-request", {
            app,
        });
    };

    return {
        getRules,
        updateRule,
        deleteRule,
        approveRuleModificationRequest,
        deleteRuleModificationRequest,
    };
};
