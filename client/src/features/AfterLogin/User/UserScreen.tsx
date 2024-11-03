import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../../types/state';
import { useAppContext } from '../../../hooks/useAppContext';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useNotification } from '../../../contexts/NotificationContext';
import { config } from '../../../config';

const UserScreen: React.FC = () => {
    const { user } = useAppContext();
    const { setRequestToken, api } = useApi();
    const { setUser } = useActions();
    const { showNotification } = useNotification();
    const [isChangingUsername, setIsChangingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    const handleLogout = () => {
        api.userApi.logout().then(() => {
            setUser(null);
            setRequestToken(null);
            AsyncStorage.removeItem('userToken');
            showNotification("Logged out successfully", "success");
        }).catch((err: any) => {
            console.log('Error logging out:', err);
            showNotification("Failed to logout", "failure");
        });
    };

    const handleChangeUsername = () => {
        api.userApi.changeUsername(newUsername).then((user: User) => {
            showNotification("Username changed successfully", "success");
            setUser(user);
            setIsChangingUsername(false);
        }).catch((err: any) => {
            console.log('Error changing username:', err);
            showNotification("Failed to change username", "failure");
        });
    };

    return user ? (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{`Hi ${user.username}`}</Text>
                {config.showLogoutButton && <Button title="Logout" onPress={handleLogout} />}
            </View>
            <TouchableOpacity onPress={() => setIsChangingUsername(!isChangingUsername)}>
                <Text style={styles.changeUsernameText}>Change Username</Text>
            </TouchableOpacity>
            {isChangingUsername && (
                <View style={styles.changeUsernameContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="New Username"
                        value={newUsername}
                        onChangeText={setNewUsername}
                    />
                    <Button title="Change" onPress={handleChangeUsername} />
                </View>
            )}
        </View>
    ) : (
        <View style={styles.container}>
            <Text style={styles.title}>User not found</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
    },
    changeUsernameText: {
        color: 'blue',
        marginTop: 16,
    },
    changeUsernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 8,
        marginRight: 8,
    },
});

export default UserScreen;