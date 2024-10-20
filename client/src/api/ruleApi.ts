import { Remote } from "../types/api";
import { Rule, RuleType } from "../types/state";

export const createRuleApi = (remote: Remote) => {
    const { get, post, put, del } = remote;

    const getRules = (): Promise<Rule<RuleType>[]> => {
        return get("rules/user-rules");
    };

    const createRule = (rule: Partial<Rule<RuleType>>) => {
        return post("rules/create-rule", {
            app: rule.app,
            ruletype: rule.ruleType,
            rule_details: JSON.stringify(rule.details),
        });
    };

    const updateRule = (rule: Partial<Rule<RuleType>>) => {
        return put("rules/update-rule", {
            app: rule.app,
            ruletype: rule.ruleType,
            rule_details: JSON.stringify(rule.details),
            is_active: rule.isActive,
        });
    };

    const allowChange = (rule: Partial<Rule<RuleType>>) => {
        return put(`rules/allow-change-to-rule`, {
            app: rule.app,
            ruletype: rule.ruleType,
        });
    };

    const deleteRule = (rule: Partial<Rule<RuleType>>) => {
        return del("rules/delete-rule", {
            app: rule.app,
            ruletype: rule.ruleType,
        });
    };

    return { getRules, createRule, updateRule, allowChange, deleteRule };
};
