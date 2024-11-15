import React from 'react';
import { Button, Alert, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';
import Colors from '../../styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CustomButton } from '../../components/CustomButton';

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

    return (
        <View style={styles.container}>
            <CustomButton style={styles.customButton} onPress={signIn}>
                <Icon name="google" size={20} color={Colors.Text1} style={styles.icon} />
                <Text style={styles.buttonText}>Sign in with Google</Text>
            </CustomButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    customButton: {
        flexDirection: 'row',
        width: '100%',
        height: 48,
        backgroundColor: Colors.Primary1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 10,
    },
    buttonText: {
        color: Colors.Text1,
        fontSize: 16,
        fontWeight: 'bold',
    },
});