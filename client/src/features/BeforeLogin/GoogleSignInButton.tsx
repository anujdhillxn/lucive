import React from 'react';
import { Button, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useApi } from '../../hooks/useApi';

export const GoogleLoginButton = () => {

    const { api } = useApi();

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const resp = await GoogleSignin.signIn();
            await api.userApi.googleLogin(resp.data?.idToken || '');
            Alert.alert("Success", "User signed in successfully!");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Sign-in failed");
        }
    };

    return <Button title="Sign in with Google" onPress={signIn} />;
};