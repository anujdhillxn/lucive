import React from "react";
import { ApiContext } from "../hooks/useApi";
import { createApi } from "./createApi";
import useRemote from "../hooks/useRemote";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConfig } from "../hooks/useConfig";

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestToken, setRequestToken] = React.useState<string | null>(null);
    const config = useConfig();
    const baseUrl = config.apiUrl;
    React.useEffect(() => {
        AsyncStorage.getItem("requestToken").then((token) => {
            token && setRequestToken(token);
        });
    }, []);
    const remote = useRemote(requestToken, baseUrl);
    const api = createApi(remote);

    return <ApiContext.Provider value={{ api, requestToken, setRequestToken }}>{children}</ApiContext.Provider>;
}