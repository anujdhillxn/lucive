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

GoogleSignin.configure({
    webClientId: '517721570590-tt54mso1lts163bib4j3ibrrseibr347.apps.googleusercontent.com',
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

                                    <StatusBar backgroundColor={Colors.Primary2} barStyle="light-content" />
                                </NativeContextProvider>
                            </AppContextProvider>
                        </ApiProvider>
                    </ConfirmModalProvider>
                </NotificationProvider>
            </NavigationContainer>
        </MenuProvider>
    );
}

