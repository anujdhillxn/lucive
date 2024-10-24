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

export type RuleModificationData = {
    app: string;
    interventionType: string;
    dailyReset: string;
    dailyMaxSeconds?: number;
    hourlyMaxSeconds?: number;
    sessionMaxSeconds?: number;
};

export type Rule = {
    app: string;
    appDisplayName: string;
    isActive: boolean;
    isMyRule: boolean;
    interventionType: string;
    dailyReset: string;
    dailyMaxSeconds?: number;
    hourlyMaxSeconds?: number;
    sessionMaxSeconds?: number;
    createdAt?: string;
    lastModifiedAt?: string;
    modificationData?: RuleModificationData;
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
    rules: Rule[];
    permissions: Permissions;
};

export type AppActionsType = {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setMyDuo: React.Dispatch<React.SetStateAction<Duo | null>>;
    setDuoRequests: React.Dispatch<React.SetStateAction<Duo[]>>;
    setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>;
};
