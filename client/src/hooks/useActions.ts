import * as React from "react";
import { AppActions } from "../contexts/AppContext";

export const useActions = () => {
    const context = React.useContext(AppActions);
    if (!context) {
        throw new Error("useAppContext must be used within a UserProvider");
    }
    return context;
};
