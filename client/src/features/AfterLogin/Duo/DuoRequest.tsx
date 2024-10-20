import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
interface DuoRequestProps {
    sender: string;
}

const DuoRequest: React.FC<DuoRequestProps> = ({ sender }) => {

    const { api } = useApi();
    const { duoApi } = api;
    const { setMyDuo, setDuoRequests } = useActions();

    const acceptRequest = () => {
        duoApi.confirmDuo(sender)
            .then(() => {
                duoApi.getDuos().then((duoResp) => {
                    setMyDuo(duoResp.myDuo.length ? duoResp.myDuo[0] : null);
                    setDuoRequests(duoResp.requestsSent.filter((duo) => !duo.isConfirmed));
                }).catch((err) => {
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log('Error confirming duo:', err);
            });
    }

    const rejectRequest = () => {
        duoApi.deleteDuo(sender)
            .then(() => {
                console.log('Duo request rejected successfully');
            })
            .catch((err) => {
                console.log('Error rejecting duo request:', err);
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.message}>{sender}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={acceptRequest}>
                    <Icon name="checkmark-circle" size={30} />
                </TouchableOpacity>
                <TouchableOpacity onPress={rejectRequest}>
                    <Icon name="close-circle" size={30} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#fff',
        flexDirection: 'row', // Align items in a row
        justifyContent: 'space-between', // Space between message and buttons
    },
    message: {
        fontSize: 18,
        color: '#333',
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
});
export default DuoRequest;