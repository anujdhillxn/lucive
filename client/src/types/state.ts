import React from "react";

export type User = {
    username: string;
    email: string;
};

export type Duo = {
    user1: string;
    user2: string;
    isConfirmed: boolean;
    confirmedAt: Date | null;
};

export enum RuleType {
    SCREENTIME = "SCREENTIME",
}

export type Rule<T extends RuleType> = {
    app: string;
    ruleType: T;
    changeAllowed: boolean;
    isActive: boolean;
    isMyRule: boolean;
    details: RuleDetailsMap[T];
};

export type ScreenTimeRuleDetails = {
    dailyMaxSeconds: number;
    hourlyMaxSeconds: number;
    dailyStartsAt: string;
};

export type RuleDetailsMap = {
    [RuleType.SCREENTIME]: ScreenTimeRuleDetails;
    // Add more mappings as needed
};

export type Permissions = {
    hasUsageStatsPermission?: boolean;
    hasOverlayPermission?: boolean;
    hasAccessibilityPermission?: boolean;
};

export type AppContextType = {
    user: User | null;
    myDuo: Duo | null;
    duoRequests: Duo[];
    rules: Rule<RuleType>[];
    permissions: Permissions;
};

export type AppActionsType = {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setMyDuo: React.Dispatch<React.SetStateAction<Duo | null>>;
    setDuoRequests: React.Dispatch<React.SetStateAction<Duo[]>>;
    setRules: React.Dispatch<React.SetStateAction<Rule<RuleType>[]>>;
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>;
};
