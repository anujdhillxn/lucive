import * as React from 'react';
import { View, Button, TextInput, StyleSheet, Text } from 'react-native';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useNotification } from '../../../contexts/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../../../config';
import { User } from '../../../types/state';
import Colors from '../../../styles/colors';
import { useAppContext } from '../../../hooks/useAppContext';

export const UserDetails: React.FC = () => {

    const { setRequestToken, api } = useApi();
    const { setUser } = useActions();
    const { user } = useAppContext();
    const { showNotification } = useNotification();
    const [isChangingUsername, setIsChangingUsername] = React.useState(false);
    const [newUsername, setNewUsername] = React.useState('');

    const handleLogout = () => {
        api.userApi.logout().then(() => {
            setUser(null);
            setRequestToken(null);
            AsyncStorage.removeItem('requestToken');
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
    return (
        <View>
            <Text style={styles.text}>{`Hi ${user?.username}`}</Text>
            <Button color={Colors.Primary1} title="Change Username" onPress={() => setIsChangingUsername(true)} />

            {isChangingUsername && (
                <View style={styles.changeUsernameContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="New Username"
                        value={newUsername}
                        onChangeText={setNewUsername}
                        placeholderTextColor={Colors.Text3}
                    />
                    <Button color={Colors.Primary1} title="Change" onPress={handleChangeUsername} />
                </View>
            )}

            {config.showLogoutButton && <Button color={Colors.Danger} title="Logout" onPress={handleLogout} />}
        </View>
    )
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.Text2,
        marginBottom: 8,
    },
    changeUsernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: Colors.Background2,
        color: Colors.Text2,
        paddingHorizontal: 8,
        marginRight: 8,
    },
});