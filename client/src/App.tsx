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

GoogleSignin.configure({
    webClientId: '475461642402-n1tnkr22469tn5qdgj3qgiuth582up1u.apps.googleusercontent.com',
});

export default function App() {
    return (
        <MenuProvider>
            <NavigationContainer>
                <NotificationProvider>
                    <ConfirmModalProvider>
                        <ApiProvider>
                            <AppContextProvider>
                                <NativeContextProvider>
                                    <AppScreenStack />
                                </NativeContextProvider>
                            </AppContextProvider>
                        </ApiProvider>
                    </ConfirmModalProvider>
                </NotificationProvider>
            </NavigationContainer>
        </MenuProvider>
    );
}

