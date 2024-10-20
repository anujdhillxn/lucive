import * as React from "react";
import { ApiContextType, IApi } from "../types/api";

export const ApiContext = React.createContext<ApiContextType | undefined>(
    undefined
);
export const useApi = (): ApiContextType => {
    const context = React.useContext(ApiContext);
    if (!context) {
        throw new Error("useApi must be used within a ApiProvider");
    }
    return context;
};
