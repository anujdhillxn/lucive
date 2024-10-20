import { NativeModules, View } from "react-native";
import { useAppContext } from "../hooks/useAppContext";
import React from "react";
const { UsageTracker } = NativeModules;
type NativeStateHandlerProps = {
    children: React.ReactNode;
};

export const NativeStateHandler = (props: NativeStateHandlerProps) => {

    const { rules } = useAppContext();

    const setScreentimeRules = () => {
        const screentimeRules = rules.filter(rule => rule.ruleType === "SCREENTIME");
        UsageTracker.setRules(screentimeRules);
    }

    React.useEffect(() => {
        setScreentimeRules();
    }, [rules]);

    return <>{props.children}</>
}