import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../../../hooks/useAppContext';
import { Button } from 'react-native';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../contexts/NotificationContext';
import Colors from '../../../styles/colors';
import { CustomButton } from '../../../components/CustomButton';

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
                const newUser = { ...user, invitationToken: resp };
                setMyDuo(null);
                setRules([]);
                setUser(newUser);
                showNotification('Duo deleted successfully', 'success');
            })
            .catch((err) => {
                showNotification('Error deleting duo', 'failure');
                console.log('Error deleting duo:', err);
            });
    };

    const { confirm } = useConfirm(handleDeleteDuo, "Are you sure you want to delete your Duo? All rules will be disabled");

    return (
        <View>
            <Text style={styles.text}>
                {`You and `}
                <Text style={{ fontWeight: 'bold' }}>{partner}</Text>
                {` have been a Duo since `}
                <Text style={{ fontStyle: 'italic' }}>{new Date(myDuo.createdAt!).toLocaleDateString()}</Text>
            </Text>
            <View style={styles.buttonContainer}>
                <CustomButton style={styles.deleteButton} onPress={confirm}>
                    <Text style={styles.buttonText}>Delete Duo</Text>
                </CustomButton>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.Background1,
    },
    text: {
        fontSize: 20,
        color: Colors.Text2,
    },
    buttonContainer: {
        marginTop: 20,
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.Danger,
    },
    buttonText: {
        color: Colors.Text1,
        fontSize: 16,
    }
});

export default MyDuo;