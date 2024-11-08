import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useApi } from '../../hooks/useApi';
import { RootStackParamList } from '../AppScreenStack';
import { GoogleLoginButton } from './GoogleSignIn';
import { useNotification } from '../../contexts/NotificationContext';
import { config } from '../../config';
import Colors from '../../styles/colors';

const LoginScreen: React.FC = () => {
    const [identifier, setIdentifer] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { api, setRequestToken } = useApi();
    const { showNotification } = useNotification();
    const handleLogin = () => {
        api.userApi.login({ identifier, password }).then((resp) => {
            setRequestToken(resp.token);
        }).catch((error) => {
            console.error('Error logging in', error);
            showNotification('Error logging in', 'failure');
        });
    };

    return (
        <View style={styles.container}>
            {config.showUsernameLoginBlock && <><Text style={styles.title}>Login</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Username/Email"
                    value={identifier}
                    onChangeText={setIdentifer}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={Colors.Text3}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={Colors.Text3}
                />
                <Button color={Colors.Primary1} title="Login" onPress={handleLogin} />
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.link}>Don't have an account? Sign up</Text>
                </TouchableOpacity></>}
            <View style={styles.googleContainer}><GoogleLoginButton /></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: Colors.Background1,
    },
    googleContainer: {
        marginTop: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        color: Colors.Primary1,
    },
    input: {
        height: 40,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: Colors.Background2,
        color: Colors.Text2,
    },
    link: {
        marginTop: 16,
        color: Colors.Accent1,
        textAlign: 'center',
    },
});

export default LoginScreen;