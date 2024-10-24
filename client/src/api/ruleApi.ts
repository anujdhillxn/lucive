import { Remote } from "../types/api";
import { Rule } from "../types/state";

export const createRuleApi = (remote: Remote) => {
    const { get, post, put, del } = remote;

    const getRules = (): Promise<Rule[]> => {
        return get("rules/user-rules");
    };

    const createRule = (rule: Rule) => {
        return post("rules/create-rule", {
            app: rule.app,
            app_display_name: rule.appDisplayName,
            daily_max_seconds: rule.dailyMaxSeconds,
            hourly_max_seconds: rule.hourlyMaxSeconds,
            session_max_seconds: rule.sessionMaxSeconds,
            intervention_type: rule.interventionType,
            daily_reset: rule.dailyReset,
            is_active: rule.isActive,
        });
    };

    const updateRule = (rule: Rule) => {
        return put("rules/update-rule", {
            app: rule.app,
            daily_max_seconds: rule.dailyMaxSeconds,
            hourly_max_seconds: rule.hourlyMaxSeconds,
            session_max_seconds: rule.sessionMaxSeconds,
            intervention_type: rule.interventionType,
            daily_reset: rule.dailyReset,
            is_active: rule.isActive,
        });
    };

    const approveRuleModificationRequest = (app: string) => {
        return post(`rules/approve-rule-modification-request`, { app });
    };

    const deleteRule = (app: string) => {
        return del("rules/delete-rule", { app });
    };

    const deleteRuleModificationRequest = (app: string) => {
        return del("rules/delete-rule-modification-request", {
            app,
        });
    };

    return {
        getRules,
        createRule,
        updateRule,
        deleteRule,
        approveRuleModificationRequest,
        deleteRuleModificationRequest,
    };
};
