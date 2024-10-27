import { Rule } from "../types/state";

export const hasAChange = (newRule: Rule, rule: Rule): boolean => {
    return (
        newRule.dailyMaxSeconds !== rule.dailyMaxSeconds ||
        newRule.hourlyMaxSeconds !== rule.hourlyMaxSeconds ||
        newRule.dailyReset !== rule.dailyReset ||
        newRule.isActive !== rule.isActive
    );
};

export const isApprovalRequired = (newRule: Rule, rule: Rule): boolean => {
    const dailyMaxSecondsRemoved =
        !!rule.dailyMaxSeconds && !newRule.dailyMaxSeconds;
    const hourlyMaxSecondsRemoved =
        !!rule.hourlyMaxSeconds && !newRule.hourlyMaxSeconds;
    const dailyResetChanged = rule.dailyReset !== newRule.dailyReset;
    const isActiveChanged = rule.isActive !== newRule.isActive;
    const dailyMaxSecondsIncreased =
        !!rule.dailyMaxSeconds &&
        !!newRule.dailyMaxSeconds &&
        rule.dailyMaxSeconds < newRule.dailyMaxSeconds;
    const hourlyMaxSecondsIncreased =
        !!rule.hourlyMaxSeconds &&
        !!newRule.hourlyMaxSeconds &&
        rule.hourlyMaxSeconds < newRule.hourlyMaxSeconds;
    return (
        dailyMaxSecondsRemoved ||
        hourlyMaxSecondsRemoved ||
        dailyResetChanged ||
        isActiveChanged ||
        dailyMaxSecondsIncreased ||
        hourlyMaxSecondsIncreased
    );
};

export const isValidUsername = (username: string): boolean => {
    const regex = /^[a-zA-Z0-9_.]+$/;
    return regex.test(username);
};

export const isPasswordValid = (password: string): boolean => {
    return password.length >= 8;
};
