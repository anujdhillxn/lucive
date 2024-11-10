import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../hooks/useAppContext';

export type UserKnowledgeProps = {
    hasInvitedFriend: boolean;
    hasTriedToCreateARule: boolean;
};

export type UserKnowledgeActionsProps = {
    rememberHasInvitedFriend: () => void;
    rememberHasTriedToCreateARule: () => void;
};

export const UserKnowledge = React.createContext<UserKnowledgeProps | undefined>(
    undefined
);

export const UserKnowledgeActions = React.createContext<UserKnowledgeActionsProps | undefined>(
    undefined
);

export const UserKnowledgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { rules } = useAppContext();

    const [hasInvitedFriend, setHasInvitedFriend] = React.useState(false);
    const [hasTriedToCreateARule, setHasTriedToCreateARule] = React.useState(false);


    const fetchHasTriedToCreateARule = async () => {
        try {
            const hasTriedToCreateARule = await AsyncStorage.getItem('hasTriedToCreateARule');
            if (hasTriedToCreateARule || rules.filter(rule => rule.isMyRule).length > 0) {
                setHasTriedToCreateARule(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const fetchHasInvitedFriend = async () => {
        try {
            const hasInvitedFriend = await AsyncStorage.getItem('hasInvitedFriend');
            if (hasInvitedFriend) {
                setHasInvitedFriend(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const rememberHasInvitedFriend = async () => {
        try {
            await AsyncStorage.setItem('hasInvitedFriend', 'true');
            setHasInvitedFriend(true);
        } catch (e) {
            console.log(e);
        }
    }

    const rememberHasTriedToCreateARule = async () => {
        try {
            await AsyncStorage.setItem('hasTriedToCreateARule', 'true');
            setHasTriedToCreateARule(true);
        } catch (e) {
            console.log(e);
        }
    }


    React.useEffect(() => {
        fetchHasTriedToCreateARule();
        fetchHasInvitedFriend();
    }, [rules]);

    return <UserKnowledge.Provider value={{ hasInvitedFriend, hasTriedToCreateARule }}>
        <UserKnowledgeActions.Provider value={{ rememberHasInvitedFriend, rememberHasTriedToCreateARule }}>
            {children}
        </UserKnowledgeActions.Provider>
    </UserKnowledge.Provider>

}