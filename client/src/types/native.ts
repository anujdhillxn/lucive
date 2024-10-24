export type AppInfo = {
    displayName: string;
    packageName: string;
    icon: string;
};

export type NativeContextType = {
    installedApps: Record<string, AppInfo>;
};
