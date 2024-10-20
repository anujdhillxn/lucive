import * as React from "react";
import { AppActions } from "../state/AppContext";
import { AppActionsType } from "../types/state";

export const useActions = (): AppActionsType => {
    const context = React.useContext(AppActions);
    if (!context) {
        throw new Error("useAppContext must be used within a UserProvider");
    }
    return context;
};
