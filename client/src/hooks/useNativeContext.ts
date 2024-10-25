import React from "react";
import { NativeContext } from "../contexts/NativeContext";
export const useNativeContext = () => {
    const context = React.useContext(NativeContext);
    if (!context) {
        throw new Error(
            "useNativeContext must be used within a NativeContextProvider"
        );
    }
    return context;
};
