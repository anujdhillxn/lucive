import React from "react";
import { ApiContext } from "../hooks/useApi";
import { createApi } from "./createApi";
import useRemote from "../hooks/useRemote";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../../config";
import LoadingScreen from "../features/LoadingScreen";

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestToken, setRequestToken] = React.useState<string | null | undefined>(undefined);
    const baseUrl = config.apiUrl;

    const fetchToken = async () => {
        const token = await AsyncStorage.getItem("requestToken");
        setRequestToken(token);
    };

    React.useEffect(() => {
        fetchToken();
    }, []);

    // Always call hooks unconditionally
    const remote = useRemote(requestToken, baseUrl);
    const api = createApi(remote);

    if (requestToken === undefined) {
        return <LoadingScreen />;
    }

    return (
        <ApiContext.Provider value={{ api, requestToken, setRequestToken }}>
            {children}
        </ApiContext.Provider>
    );
};