import * as React from "react";
import { ConfigContext } from "../contexts/ConfigContext";

export const useConfig = () => {
    const context = React.useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
};
