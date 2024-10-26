export type AppInfo = {
    displayName: string;
    packageName: string;
    icon: string;
};
export type Permissions = {
    hasUsageStatsPermission?: boolean;
    hasOverlayPermission?: boolean;
};

export type NativeContextType = {
    installedApps: Record<string, AppInfo>;
    permissions: Permissions;
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>;
};
