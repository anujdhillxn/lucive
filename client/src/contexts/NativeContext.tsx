import { NativeModules } from "react-native";
import { useAppContext } from "../hooks/useAppContext";
import React from "react";
import { AppInfo, NativeContextType, Permissions } from "../types/native";
const { UsageTracker, InstalledApps, PermissionsModule } = NativeModules;
type NativeStateHandlerProps = {
    children: React.ReactNode;
};

export const NativeContext = React.createContext<NativeContextType | undefined>(
    undefined
);


export const NativeContextProvider = (props: NativeStateHandlerProps) => {

    const { rules } = useAppContext();
    const { requestUsageStatsPermission, requestOverlayPermission } = PermissionsModule;
    const setRules = () => {
        UsageTracker.setRules(rules?.filter(rule => rule.isMyRule));
    }
    const [installedApps, setInstalledApps] = React.useState<Record<string, AppInfo>>({});
    const [permissions, setPermissions] = React.useState<Permissions>({});
    React.useEffect(() => {
        fetchInstalledApps();
        checkPermissions();
    }, []);
    const fetchInstalledApps = async () => {
        try {
            const apps = await InstalledApps.getInstalledApps();
            const appsMap: Record<string, AppInfo> = {};
            apps.forEach((app: AppInfo) => {
                appsMap[app.packageName] = app;
            });
            setInstalledApps(appsMap);
        } catch (error) {
            console.error(error);
        }
    };

    const checkPermissions = () => {
        PermissionsModule.hasUsageStatsPermission().then((hasUsageStatsPermission: boolean) => {
            setPermissions((current) => { return { ...current, hasUsageStatsPermission } });
        });
        PermissionsModule.hasOverlayPermission().then((hasOverlayPermission: boolean) => {
            setPermissions((current) => { return { ...current, hasOverlayPermission } });
        });
    };

    React.useEffect(() => {
        setRules();
    }, [rules]);

    return <NativeContext.Provider value={{ installedApps, permissions, requestUsageStatsPermission, requestOverlayPermission, checkPermissions }}>{props.children}</NativeContext.Provider>;
}