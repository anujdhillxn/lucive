import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../../../hooks/useAppContext';
import { Button } from 'react-native';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../contexts/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
const MyDuo: React.FC = () => {
    const myDuo = useAppContext().myDuo!;
    const user = useAppContext().user!;
    const { setMyDuo, setRules, setUser } = useActions();
    const { api } = useApi();
    const { duoApi } = api;
    const partner = user.username === myDuo.user1 ? myDuo.user2 : myDuo.user1;
    const { showNotification } = useNotification();

    const handleDeleteDuo = () => {
        duoApi.deleteDuo()
            .then((resp) => {
                setMyDuo(null);
                setRules([]);
                setUser({ ...user, invitationToken: resp })
                AsyncStorage.removeItem('myDuo');
                AsyncStorage.setItem('rules', JSON.stringify([]));
                AsyncStorage.setItem('user', JSON.stringify({ ...user, invitationToken: resp }));
                showNotification('Duo deleted successfully', 'success');
            })
            .catch((err) => {
                showNotification('Error deleting duo', 'failure');
                console.log('Error deleting duo:', err);
            });
    };

    const { confirm } = useConfirm(handleDeleteDuo, "Are you sure you want to delete your Duo?");

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {`You and `}
                <Text style={{ fontWeight: 'bold' }}>{partner}</Text>
                {` have been a Duo since `}
                <Text style={{ fontStyle: 'italic' }}>{new Date(myDuo.createdAt!).toLocaleDateString()}</Text>
            </Text>
            <View style={styles.buttonContainer}>
                <Button title="Delete Duo" onPress={confirm} color="#ff5c5c" /></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
    buttonContainer: {
        marginTop: 20,
    }
});

export default MyDuo;