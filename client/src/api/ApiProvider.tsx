import React from "react";
import { ApiContext } from "../hooks/useApi";
import { createApi } from "./createApi";
import useRemote from "../hooks/useRemote";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "../features/LoadingScreen";
import { NativeModules } from 'react-native';

const { BuildConfigModule } = NativeModules;
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestToken, setRequestToken] = React.useState<string | null | undefined>(undefined);
    const [baseUrl, setBaseUrl] = React.useState<string>("");
    const fetchToken = async () => {
        const token = await AsyncStorage.getItem("requestToken");
        setRequestToken(token);
    };

    React.useEffect(() => {
        fetchToken();
        BuildConfigModule.getApiUrl((url: string) => {
            setBaseUrl(url);
        });
    }, []);

    // Always call hooks unconditionally
    const remote = useRemote(requestToken, baseUrl);
    const api = createApi(remote);

    if (requestToken === undefined || baseUrl === "") {
        return <LoadingScreen />;
    }
    return (
        <ApiContext.Provider value={{ api, requestToken, setRequestToken }}>
            {children}
        </ApiContext.Provider>
    );
};