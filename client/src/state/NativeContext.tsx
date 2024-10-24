import { NativeModules, View } from "react-native";
import { useAppContext } from "../hooks/useAppContext";
import React from "react";
import { AppInfo, NativeContextType } from "../types/native";
const { UsageTracker, InstalledApps } = NativeModules;
type NativeStateHandlerProps = {
    children: React.ReactNode;
};

export const NativeContext = React.createContext<NativeContextType | undefined>(
    undefined
);


export const NativeContextProvider = (props: NativeStateHandlerProps) => {

    const { rules } = useAppContext();

    const setScreentimeRules = () => {
        // UsageTracker.setRules(rules);
    }
    const [installedApps, setInstalledApps] = React.useState<Record<string, AppInfo>>({});

    React.useEffect(() => {
        fetchInstalledApps();
    }
        , []);
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

    React.useEffect(() => {
        setScreentimeRules();
    }, [rules]);

    return <NativeContext.Provider value={{ installedApps }}>{props.children}</NativeContext.Provider>;
}