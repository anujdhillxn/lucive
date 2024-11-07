import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Share, Linking } from 'react-native';
import { RootStackParamList } from '../../AppScreenStack';
import { AnimatedSequence } from '../../../components/AnimatedComponentSequence';
import { useAppContext } from '../../../hooks/useAppContext';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useNotification } from '../../../contexts/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../../../config';

export const NoDuoFoundView: React.FC = () => {
    const { user } = useAppContext();
    const { setMyDuo } = useActions();
    const appUrl = config.apiUrl + 'duos/deeplink/' + user?.invitationToken + '/';
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me on Lucive: ${appUrl}`,
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { showNotification } = useNotification();
    const { api } = useApi();

    const handleOpenURL = (event: { url: string }) => {
        const url = event.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const invitationToken = params.get('invitationToken');
        console.log(url);
        if (invitationToken) {
            api.duoApi.createDuo(invitationToken).then((duo) => {
                setMyDuo(duo);
                AsyncStorage.setItem('myDuo', JSON.stringify(duo));
                navigation.navigate('Duo');
                showNotification('Duo created successfully', 'success');
            }).catch((error) => {
                console.error('Error creating duo', error);
                showNotification('Error creating duo', 'failure');
            });
        }
    };

    React.useEffect(() => {
        const subscription = Linking.addEventListener('url', handleOpenURL);

        // Check if the app was opened with a URL initially
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleOpenURL({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.noDuoText1}>You have not formed a Duo</Text>
                <TouchableOpacity style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonText}>Invite a Friend</Text>
                </TouchableOpacity>
            </View>
            <AnimatedSequence>
                <Text style={styles.noDuoText2}>You can start your digital detox journey after forming a Duo</Text>
                <Text style={styles.noDuoText2}>Set various rules to keep your phone usage in check</Text>
                <Text style={styles.noDuoText2}>Once a rule is set, it can be relaxed/disabled only after the change is approved by the other member of the Duo</Text>
            </AnimatedSequence>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: '100%',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        alignSelf: 'center'
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    createButtonIcon: {
        marginRight: 10, // Add margin to the left of the icon
    },
    noDuoText1: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    noDuoText2: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});