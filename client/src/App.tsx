import * as React from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationContainer } from '@react-navigation/native';
import { AppContextProvider } from './contexts/AppContext';
import { AppScreenStack } from './features/AppScreenStack';
import { ApiProvider } from './api/ApiProvider';
import { NativeContextProvider } from './contexts/NativeContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ConfirmModalProvider } from './contexts/ConfirmModalContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { StatusBar } from 'react-native';
import Colors from './styles/colors';
import { UserKnowledgeProvider } from './contexts/UserKnowledgeContext';
import { config } from './config';

GoogleSignin.configure({
    webClientId: config.googleWebClientId,
});

export default function App() {
    return (
        <MenuProvider>
            <NavigationContainer>
                <ApiProvider>
                    <NotificationProvider>
                        <ConfirmModalProvider>
                            <AppContextProvider>
                                <NativeContextProvider>
                                    <UserKnowledgeProvider>
                                        <AppScreenStack />
                                    </UserKnowledgeProvider>
                                    <StatusBar backgroundColor={Colors.Primary2} barStyle="light-content" />
                                </NativeContextProvider>
                            </AppContextProvider>
                        </ConfirmModalProvider>
                    </NotificationProvider>
                </ApiProvider>
            </NavigationContainer>
        </MenuProvider>
    );
}

