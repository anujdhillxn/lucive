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
import { ConfigProvider } from './contexts/ConfigContext';

GoogleSignin.configure({
    webClientId: '437935332203-n66ssb26co1452gnk6v1qe1hh0duv0ql.apps.googleusercontent.com',
});

export default function App() {
    return (
        <ConfigProvider>
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
        </ConfigProvider>
    );
}

