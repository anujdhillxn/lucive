import * as React from "react";
import {
    UserKnowledge,
    UserKnowledgeActions,
} from "../contexts/UserKnowledgeContext";

export const useUserKnowledge = () => {
    const context = React.useContext(UserKnowledge);
    if (!context) {
        throw new Error(
            "useUserKnowledge must be used within a UserKnowledgeProvider"
        );
    }
    return context;
};

export const useUserKnowledgeActions = () => {
    const context = React.useContext(UserKnowledgeActions);
    if (!context) {
        throw new Error(
            "useUserKnowledgeActions must be used within a UserKnowledgeProvider"
        );
    }
    return context;
};
