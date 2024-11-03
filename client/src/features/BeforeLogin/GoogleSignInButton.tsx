import React from 'react';
import { Button, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';

export const GoogleLoginButton = () => {

    const { api, setRequestToken } = useApi();
    const { showNotification } = useNotification();
    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const resp = await GoogleSignin.signIn();
            const signInResp = await api.userApi.googleLogin(resp.data?.idToken || '')
            setRequestToken(signInResp.token);
        } catch (error) {
            console.error(error);
            showNotification('Error logging in with Google', 'failure');
        }
    };

    return <Button title="Sign in with Google" onPress={signIn} />;
};