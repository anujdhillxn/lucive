import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';
import Colors from '../../styles/colors';

const SignupScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setRequestToken, api } = useApi();
    const { showNotification } = useNotification();
    const handleSignup = async () => {
        api.userApi.register({ username, email, password }).then((resp) => {
            setRequestToken(resp.token);
        }).catch((error) => {
            console.error('Error signing up', error);
            showNotification('Error signing up', 'failure');
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor={Colors.Text3}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
            <Button color={Colors.Primary1} title="Sign Up" onPress={handleSignup} />

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
});

export default SignupScreen;