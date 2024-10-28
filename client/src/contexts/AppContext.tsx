import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from '../hooks/useApi';
import { Duo, Rule, User } from '../types/state';

export type AppContextProps = {
    user: User | null;
    myDuo: Duo | null;
    rules: Rule[];
    appLoading: boolean;
};

export type AppActionsProps = {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setMyDuo: React.Dispatch<React.SetStateAction<Duo | null>>;
    setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
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
    const { api, requestToken, setRequestToken } = useApi();
    const [appLoading, setAppLoading] = React.useState(true);
    const fetchData = async () => {
        setAppLoading(true);
        if (requestToken) {
            await fetchAndSetUser();
            await fetchAndSetDuo();
            await fetchAndSetRules();
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
            setRequestToken(null);
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

    React.useEffect(() => {
        if (requestToken) {
            fetchData();
            AsyncStorage
                .setItem('requestToken', requestToken);
        }
    }, [requestToken]);

    return <AppContext.Provider value={{ user, myDuo, rules, appLoading }}>
        <AppActions.Provider value={{ setUser, setMyDuo, setRules }}>
            {children}
        </AppActions.Provider>
    </AppContext.Provider>

}