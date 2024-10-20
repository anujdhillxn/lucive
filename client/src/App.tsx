import * as React from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationContainer } from '@react-navigation/native';
import { AppContextProvider } from './state/AppContext';
import { AppScreenStack } from './features/AppScreenStack';
import { ApiProvider } from './api/ApiProvider';
import { NativeStateHandler } from './state/NativeStateHandler';

export default function App() {
    return (
        <MenuProvider>
            <NavigationContainer>
                <ApiProvider>
                    <AppContextProvider>
                        <NativeStateHandler>
                            <AppScreenStack />
                        </NativeStateHandler>
                    </AppContextProvider>
                </ApiProvider>
            </NavigationContainer>
        </MenuProvider>
    );
}

