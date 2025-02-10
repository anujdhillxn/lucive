import { Rule, RuleModificationRequest } from "../types/state";

export const hasAChange = (
    newRule: RuleModificationRequest,
    rule?: Rule
): boolean => {
    if (!rule) {
        return true;
    }
    return (
        newRule.dailyMaxSeconds !== rule.dailyMaxSeconds ||
        newRule.hourlyMaxSeconds !== rule.hourlyMaxSeconds ||
        newRule.dailyReset !== rule.dailyReset ||
        newRule.isActive !== rule.isActive ||
        newRule.sessionMaxSeconds !== rule.sessionMaxSeconds ||
        newRule.isDailyMaxSecondsEnforced !== rule.isDailyMaxSecondsEnforced ||
        newRule.isHourlyMaxSecondsEnforced !==
            rule.isHourlyMaxSecondsEnforced ||
        newRule.isSessionMaxSecondsEnforced !==
            rule.isSessionMaxSecondsEnforced ||
        newRule.isStartupDelayEnabled !== rule.isStartupDelayEnabled
    );
};

export const isApprovalRequired = (
    newRule: RuleModificationRequest,
    rule?: Rule
): boolean => {
    if (!rule) {
        return false;
    }
    const dailyMaxSecondsRemoved =
        rule.isDailyMaxSecondsEnforced && !newRule.isDailyMaxSecondsEnforced;
    const hourlyMaxSecondsRemoved =
        rule.isHourlyMaxSecondsEnforced && !newRule.isHourlyMaxSecondsEnforced;
    const sessionMaxSecondsRemoved =
        rule.isSessionMaxSecondsEnforced &&
        !newRule.isSessionMaxSecondsEnforced;
    const dailyResetChanged = rule.dailyReset !== newRule.dailyReset;
    const isDeactivated = rule.isActive && !newRule.isActive;
    const dailyMaxSecondsIncreased =
        rule.isDailyMaxSecondsEnforced &&
        newRule.isDailyMaxSecondsEnforced &&
        rule.dailyMaxSeconds < newRule.dailyMaxSeconds;
    const hourlyMaxSecondsIncreased =
        rule.isHourlyMaxSecondsEnforced &&
        newRule.isHourlyMaxSecondsEnforced &&
        rule.hourlyMaxSeconds < newRule.hourlyMaxSeconds;
    const sessionMaxSecondsIncreased =
        rule.isSessionMaxSecondsEnforced &&
        newRule.isSessionMaxSecondsEnforced &&
        rule.sessionMaxSeconds < newRule.sessionMaxSeconds;
    const startupDelayDisabled =
        rule.isStartupDelayEnabled && !newRule.isStartupDelayEnabled;
    return (
        dailyMaxSecondsRemoved ||
        hourlyMaxSecondsRemoved ||
        sessionMaxSecondsRemoved ||
        dailyResetChanged ||
        isDeactivated ||
        dailyMaxSecondsIncreased ||
        hourlyMaxSecondsIncreased ||
        sessionMaxSecondsIncreased ||
        startupDelayDisabled
    );
};

export const isValidUsername = (username: string): boolean => {
    const regex = /^[a-zA-Z0-9_.]+$/;
    return regex.test(username);
};

export const isPasswordValid = (password: string): boolean => {
    return password.length >= 8;
};
