import { NativeModules } from "react-native";
import { useAppContext } from "../hooks/useAppContext";
import React from "react";
import { AppInfo, NativeContextType, Permissions } from "../types/native";
import { useApi } from "../hooks/useApi";
import messaging from '@react-native-firebase/messaging';

const { InstalledApps, PermissionsModule, LocalStorageModule } = NativeModules;
const { requestUsageStatsPermission, requestOverlayPermission } = PermissionsModule;
type NativeStateHandlerProps = {
    children: React.ReactNode;
};

export const NativeContext = React.createContext<NativeContextType | undefined>(
    undefined
);

import { PermissionsAndroid, Platform } from 'react-native';
import { useActions } from "../hooks/useActions";

async function requestNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
        } else {
            console.log('Notification permission denied');
        }
    }
}

async function checkNotificationPermission() {
    if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
            // Check POST_NOTIFICATIONS permission for Android 13+
            const granted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            return granted;
        } else {
            // For Android < 13, check if Firebase messaging permissions are enabled
            const enabled = await messaging().hasPermission();
            return enabled;
        }
    } else {
        console.log('This function is specific to Android.');
        return false;
    }
}

export const NativeContextProvider = (props: NativeStateHandlerProps) => {

    const [installedApps, setInstalledApps] = React.useState<Record<string, AppInfo>>({});
    const [permissions, setPermissions] = React.useState<Permissions>({});
    const { requestToken } = useApi();
    const { rules } = useAppContext();
    const { setRules } = useActions();
    const { api } = useApi();

    const setWords = async () => {
        try {
            const words = await api.contentApi.getWords(100);
            LocalStorageModule.setWords(words);
        }
        catch (e) {
            console.log(e);
        }
    }

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
        checkNotificationPermission().then((hasNotificationPermission) => {
            if (!hasNotificationPermission) {
                requestNotificationPermission();
            };
        });
    };

    React.useEffect(() => {
        fetchInstalledApps();
        checkPermissions();
    }, []);

    React.useEffect(() => {
        setWords();
    }, [requestToken]);

    React.useEffect(() => {
        LocalStorageModule.setRules(rules);
    }, [rules])

    return <NativeContext.Provider value={{ installedApps, permissions, requestUsageStatsPermission, requestOverlayPermission, checkPermissions }}>{props.children}</NativeContext.Provider>;
}