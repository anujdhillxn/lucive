import * as React from 'react';
import { NativeModules } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from '../hooks/useApi';
import { Duo, IScoreData, Rule, Score, User } from '../types/state';
import LoadingScreen from '../features/LoadingScreen';
import useDeepCompareEffect from '../hooks/useDeepCompareEffect';
import { getDateISO } from '../utils/time';
import { useNotification } from './NotificationContext';
const { LocalStorageModule, UsageTracker } = NativeModules;
export type AppContextProps = {
    user: User | null;
    myDuo: Duo | null;
    rules: Rule[];
    appLoading: boolean;
    currentScreen: string;
};

export type AppActionsProps = {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setMyDuo: React.Dispatch<React.SetStateAction<Duo | null>>;
    setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
    setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
    fetchData: () => Promise<void>;
    fetchAndSetDuo: () => Promise<void>;
};

export const AppContext = React.createContext<AppContextProps | undefined>(
    undefined
);

export const AppActions = React.createContext<AppActionsProps | undefined>(
    undefined
);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [myDuo, setMyDuo] = React.useState<Duo | null>(null);
    const [rules, setRules] = React.useState<Rule[]>([]);
    const [currentScreen, setCurrentScreen] = React.useState<string>('Rules');
    const [localStorageLoaded, setLocalStorageLoaded] = React.useState(false);

    const { api, requestToken } = useApi();

    const [appLoading, setAppLoading] = React.useState(true);

    const fetchData = async () => {
        setAppLoading(true);
        if (requestToken) {
            await Promise.all([fetchAndSetUser(), fetchAndSetDuo(), fetchAndSetRules()]);
        }
        setAppLoading(false);
    };

    const fetchAndSetUser = async () => {
        try {
            const userResp = await api.userApi.getUser();
            setUser(userResp);
        }
        catch (e) {
            console.log(e);
        }
    }

    const fetchAndSetDuo = async () => {
        try {
            const duoResp = await api.duoApi.getDuo();
            setMyDuo(duoResp.found ? duoResp.duo : null);
        }
        catch (e) {
            console.log(e);
        }
    }

    const fetchAndSetRules = async () => {
        try {
            const rulesResp = await api.ruleApi.getRules();
            setRules(rulesResp);
        }
        catch (e) {
            console.log(e);
        }
    }

    useDeepCompareEffect(() => {
        if (user) {
            fetchAndSetDuo();
            LocalStorageModule.setUser(user);
        }
        else {
            LocalStorageModule.clearUser();
        }
    }, [user]);

    useDeepCompareEffect(() => {
        if (myDuo) {
            fetchAndSetRules();
            AsyncStorage.setItem('myDuo', JSON.stringify(myDuo));
        }
        else {
            AsyncStorage.removeItem('myDuo');
        }
    }, [myDuo]);

    useDeepCompareEffect(() => {
        LocalStorageModule.setRules(rules);
    }, [rules]);

    React.useEffect(() => {
        fetchData();
        if (requestToken)
            LocalStorageModule.setRequestToken(requestToken);
        else {
            LocalStorageModule.clearRequestToken();
        }
    }, [requestToken]);

    const fetchLocalData = async () => {
        try {
            const localResp = await LocalStorageModule.getRules();
            setRules(localResp);
        }
        catch (e) {
            console.log(e);
        }
        try {
            const localResp = await AsyncStorage.getItem('myDuo');
            if (localResp) {
                setMyDuo(JSON.parse(localResp));
            }
        }
        catch (e) {
            console.log(e);
        }
        try {
            const localResp = await LocalStorageModule.getUser();
            setUser(localResp)
        }
        catch (e) {
            console.log(e);
        }
        setLocalStorageLoaded(true);
    }

    React.useEffect(() => {
        fetchLocalData();
    }, []);

    if (!localStorageLoaded) {
        return <LoadingScreen />;
    }
    return <AppContext.Provider value={{ user, myDuo, rules, appLoading, currentScreen }}>
        <AppActions.Provider value={{ setUser, setMyDuo, setRules, fetchData, fetchAndSetDuo, setCurrentScreen }}>
            {children}
        </AppActions.Provider>
    </AppContext.Provider>

}