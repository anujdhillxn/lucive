import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../../hooks/useAppContext';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useConfirm } from '../../../hooks/useConfirm';
const UserScreen: React.FC = () => {
    const { user } = useAppContext();
    const { setRequestToken, api } = useApi();
    const { setUser } = useActions();
    const handleLogout = () => {
        try {
            api.userApi.logout().then(() => {
                setUser(null);
                setRequestToken(null);
                AsyncStorage.removeItem('userToken');
            }).catch((err) => {
                console.log('Error logging out:', err);
            });
        }
        catch (e) {
            console.log(e);
        }
    };

    const { confirm } = useConfirm(handleLogout, "Are you sure you want to logout?");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{`Hi ${user?.username}`}</Text>
            <Button title="Logout" onPress={confirm} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default UserScreen;