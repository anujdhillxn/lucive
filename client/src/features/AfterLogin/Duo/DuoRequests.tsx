import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../../../hooks/useAppContext';
import { TextInput, Button } from 'react-native';
import { useApi } from '../../../hooks/useApi';
import { DuoRequestHeaderRenderer } from '../../../components/RuleMenuHeader';
import { HideableView } from '../../../components/HideableView';
import Separator from '../../../components/Separator';
import DuoRequest from './DuoRequest';

const DuoRequests: React.FC = () => {
    const { duoRequests, user } = useAppContext();
    const [username, setUsername] = useState('');
    const { api } = useApi()
    const { duoApi } = api;
    const handleSendRequest = () => {
        console.log(`Sending duo request to ${username}`);
        duoApi.createDuo(username)
            .then(() => {
                console.log('Duo request sent successfully');
            })
            .catch((err) => {
                console.log('Error sending duo request:', err);
            })
    };



    const DuoRequestComponents = duoRequests.map((duo) => {
        const sender = duo.user1 === user!.username ? duo.user2 : duo.user1;
        return () => <DuoRequest sender={sender} />;
    });

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
            />
            <Button title="Send Duo Request" onPress={handleSendRequest} />
            <Separator />
            <HideableView openedInitially Header={DuoRequestHeaderRenderer} Components={DuoRequestComponents} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginTop: 20,
        marginBottom: 20,
    },
});

export default DuoRequests;