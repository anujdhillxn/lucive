import React from "react";
import { ApiContext } from "../hooks/useApi";
import { createApi } from "./createApi";
import useRemote from "../hooks/useRemote";
import LoadingScreen from "../features/LoadingScreen";
import { NativeModules } from 'react-native';
const { BuildConfigModule, LocalStorageModule } = NativeModules;
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestToken, setRequestToken] = React.useState<string | null | undefined>(undefined);
    const [baseUrl, setBaseUrl] = React.useState<string>("");
    const fetchToken = async () => {
        const token = await LocalStorageModule.getRequestToken();
        setRequestToken(token);
    };

    React.useEffect(() => {
        fetchToken();
        BuildConfigModule.getApiUrl((url: string) => {
            setBaseUrl(url);
        });
    }, []);

    // Always call hooks unconditionally
    const remote = useRemote(requestToken, setRequestToken, baseUrl);
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