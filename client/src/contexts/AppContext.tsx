import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from '../hooks/useApi';
import { AppActionsType, AppContextType, Duo, Permissions, Rule, User } from '../types/state';

export const AppContext = React.createContext<AppContextType | undefined>(
    undefined
);

export const AppActions = React.createContext<AppActionsType | undefined>(
    undefined
);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [myDuo, setMyDuo] = React.useState<Duo | null>(null);
    const [rules, setRules] = React.useState<Rule[]>([]);
    const [loadingCount, setLoadingCount] = React.useState(0);
    const [permissions, setPermissions] = React.useState<Permissions>({});
    const { api, requestToken, setRequestToken } = useApi();

    const fetchAndSetUser = async () => {
        setLoadingCount((prev) => prev + 1);
        try {
            const userResp = await api.userApi.getUser();
            setUser(userResp);
        }
        catch (e) {
            console.log(e);
            setRequestToken(null);
        }
        setLoadingCount((prev) => prev - 1);
    }

    const fetchAndSetDuo = async () => {
        setLoadingCount((prev) => prev + 1);
        try {
            const duoResp = await api.duoApi.getDuo();
            setMyDuo(duoResp);
        }
        catch (e) {
            console.log(e);
        }
        setLoadingCount((prev) => prev - 1);
    }

    const fetchAndSetRules = async () => {
        setLoadingCount((prev) => prev + 1);
        try {
            const rulesResp = await api.ruleApi.getRules();
            setRules(rulesResp);
        }
        catch (e) {
            console.log(e);
        }
        setLoadingCount((prev) => prev - 1);
    }

    React.useEffect(() => {
        if (requestToken) {
            fetchAndSetUser();
            AsyncStorage
                .setItem('userToken', requestToken);
        }
    }, [requestToken]);

    React.useEffect(() => {
        if (user) {
            fetchAndSetDuo();
        }
    }, [user]);

    React.useEffect(() => {
        if (myDuo) {
            fetchAndSetRules();
        }
    }, [myDuo])

    return <AppContext.Provider value={{ user, myDuo, rules, permissions }}>
        <AppActions.Provider value={{ setUser, setMyDuo, setRules, setPermissions }}>
            {children}
        </AppActions.Provider>
    </AppContext.Provider>

}