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
    myScores: IScoreData;
};

export type AppActionsProps = {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setMyDuo: React.Dispatch<React.SetStateAction<Duo | null>>;
    setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
    fetchData: () => Promise<void>;
    setMyScores: React.Dispatch<React.SetStateAction<IScoreData>>;
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
    const [myScores, setMyScores] = React.useState<IScoreData>({ scoresByDate: {}, currentStreak: 0, longestStreak: 0 });
    const [localStorageLoaded, setLocalStorageLoaded] = React.useState(false);

    const { api, requestToken } = useApi();

    const [appLoading, setAppLoading] = React.useState(true);
    const { showNotification } = useNotification();
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
            setMyDuo(duoResp);
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

    const updateScores = async () => {
        try {
            const scores: Score[] = [];
            for (let i = 7; i >= 1; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateISO = getDateISO(date);
                try {
                    const { points, uninterruptedTracking } = await UsageTracker.getUsageTrackingPoints(dateISO);
                    scores.push({ date: dateISO, points, uninterruptedTracking });
                }
                catch (e) {
                    console.log(e);
                }
            }
            const resp = await api.scoresApi.updateScores(scores);
            setMyScores(curr => ({ ...curr, longestStreak: resp.longestStreak, currentStreak: resp.currentStreak, scoresByDate: { ...curr?.scoresByDate, ...resp.scoresByDate } }));
        }
        catch (e) {
            console.log(e);
            showNotification('Error updating scores. Please reopen the app.', 'failure');
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
            updateScores();
            AsyncStorage.setItem('myDuo', JSON.stringify(myDuo));
        }
        else {
            AsyncStorage.removeItem('myDuo');
        }
    }, [myDuo]);

    useDeepCompareEffect(() => {
        LocalStorageModule.setRules(rules);
    }, [rules]);

    useDeepCompareEffect(() => {
        if (myScores) {
            AsyncStorage.setItem('myScores', JSON.stringify(myScores));
        }
        else {
            AsyncStorage.removeItem('myScores');
        }
    }, [myScores]);

    React.useEffect(() => {
        fetchData();
        if (requestToken)
            AsyncStorage
                .setItem('requestToken', requestToken);
        else {
            AsyncStorage
                .removeItem('requestToken');
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
            const localResp = await AsyncStorage.getItem('myScores');
            if (localResp) {
                setMyScores(JSON.parse(localResp));
            }
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
    return <AppContext.Provider value={{ user, myDuo, rules, appLoading, myScores }}>
        <AppActions.Provider value={{ setUser, setMyDuo, setRules, fetchData, setMyScores }}>
            {children}
        </AppActions.Provider>
    </AppContext.Provider>

}