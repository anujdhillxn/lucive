import * as React from "react";
import { AppContext } from "../contexts/AppContext";
import { AppContextType } from "../types/state";

export const useAppContext = (): AppContextType => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error(
            "useAppContext must be used within a AppContextProvider"
        );
    }
    return context;
};
