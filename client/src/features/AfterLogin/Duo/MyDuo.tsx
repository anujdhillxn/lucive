import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../../../hooks/useAppContext';
import { Button } from 'react-native';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
const MyDuo: React.FC = () => {
    const myDuo = useAppContext().myDuo!;
    const user = useAppContext().user!;
    const { setMyDuo, setRules } = useActions();
    const { api } = useApi();
    const { duoApi } = api;
    const partner = user.username === myDuo.user1 ? myDuo.user2 : myDuo.user1;
    const handleDeleteDuo = () => {
        duoApi.deleteDuo(partner)
            .then(() => {
                setMyDuo(null);
                setRules([]);
            })
            .catch((err) => {
                console.log('Error deleting duo:', err);
            });
    };


    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {`You and `}
                <Text style={{ fontWeight: 'bold' }}>{partner}</Text>
                {` have been a Duo since `}
                <Text style={{ fontStyle: 'italic' }}>{new Date(myDuo.confirmedAt!).toLocaleDateString()}</Text>
            </Text>
            <View style={styles.buttonContainer}>
                <Button title="Delete Duo" onPress={handleDeleteDuo} color="#ff5c5c" /></View>
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