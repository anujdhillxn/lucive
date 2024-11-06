import { Rule } from "../types/state";

export const hasAChange = (newRule: Rule, rule: Rule): boolean => {
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

export const isApprovalRequired = (newRule: Rule, rule: Rule): boolean => {
    const dailyMaxSecondsRemoved =
        rule.isDailyMaxSecondsEnforced && !newRule.isDailyMaxSecondsEnforced;
    const hourlyMaxSecondsRemoved =
        rule.isHourlyMaxSecondsEnforced && !newRule.isHourlyMaxSecondsEnforced;
    const sessionMaxSecondsRemoved =
        rule.isSessionMaxSecondsEnforced &&
        !newRule.isSessionMaxSecondsEnforced;
    const dailyResetChanged = rule.dailyReset !== newRule.dailyReset;
    const isActiveChanged = rule.isActive !== newRule.isActive;
    const dailyMaxSecondsIncreased =
        rule.dailyMaxSeconds < newRule.dailyMaxSeconds;
    const hourlyMaxSecondsIncreased =
        rule.hourlyMaxSeconds < newRule.hourlyMaxSeconds;
    const sessionMaxSecondsIncreased =
        rule.sessionMaxSeconds < newRule.sessionMaxSeconds;
    const startupDelayDisabled =
        rule.isStartupDelayEnabled && !newRule.isStartupDelayEnabled;
    return (
        dailyMaxSecondsRemoved ||
        hourlyMaxSecondsRemoved ||
        sessionMaxSecondsRemoved ||
        dailyResetChanged ||
        isActiveChanged ||
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
