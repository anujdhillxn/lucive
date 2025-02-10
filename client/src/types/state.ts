export type User = {
    username: string;
    email: string;
    invitationToken: string;
    dateJoinedSeconds: string;
};

export type Duo = {
    user1: string;
    user2: string;
    createdAt: string;
};

export interface RuleConstraint {
    app: string;
    interventionType: string;
    dailyReset: string;
    isActive: boolean;
    dailyMaxSeconds: number;
    hourlyMaxSeconds: number;
    sessionMaxSeconds: number;
    isDailyMaxSecondsEnforced: boolean;
    isHourlyMaxSecondsEnforced: boolean;
    isSessionMaxSecondsEnforced: boolean;
    isStartupDelayEnabled: boolean;
}

export interface RuleModificationData extends RuleConstraint {}

export interface Rule extends RuleConstraint {
    appDisplayName: string;
    createdAt: string;
    isMyRule: boolean;
    modificationData?: RuleModificationData;
    isTemporary: boolean;
    validTill: string;
    version: number;
}

export interface RuleModificationRequest extends RuleModificationData {
    appDisplayName: string;
}

export type Score = {
    date: string;
    points: number;
    uninterruptedTracking: boolean;
};

export type IntervalScore = {
    minuteOfDay: number;
    points: number;
    serviceRunning: boolean;
    deviceRunning: boolean;
};

export interface IScoreDataAgg {
    currentStreak: number;
    longestStreak: number;
}

export interface IScoreData extends IScoreDataAgg {
    scoresByDate: Record<string, Score>;
}
