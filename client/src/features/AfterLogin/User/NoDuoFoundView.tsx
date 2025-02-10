import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Share, Linking } from 'react-native';
import { RootStackParamList } from '../../AppScreenStack';
import { AnimatedSequence } from '../../../components/AnimatedComponentSequence';
import { useAppContext } from '../../../hooks/useAppContext';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { useNotification } from '../../../contexts/NotificationContext';
import { config } from '../../../../config';
import Colors from '../../../styles/colors'
import { CustomButton } from '../../../components/CustomButton';
export const NoDuoFoundView: React.FC = () => {
    const { user } = useAppContext();
    const { setMyDuo, fetchAndSetDuo } = useActions();
    const appUrl = config.apiUrl + 'duos/deeplink/' + user?.invitationToken;
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me on Lucive: ${appUrl}`,
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    React.useEffect(() => {
        const interval = setInterval(fetchAndSetDuo, 1000);
        return () => clearInterval(interval);
    }, []);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { showNotification } = useNotification();
    const { api } = useApi();

    const handleOpenURL = (event: { url: string }) => {
        const url = event.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const invitationToken = params.get('invitationToken');
        if (invitationToken) {
            api.duoApi.createDuo(invitationToken).then((duo) => {
                setMyDuo(duo);
                navigation.navigate('Rules');
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
            console.log('handleOpenURL', url);
            if (url) {
                handleOpenURL({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [user]);

    return (
        <View>
            <View>
                <Text style={styles.noDuoText1}>Form a Duo to start</Text>
                <CustomButton style={styles.button} onPress={handleShare}>
                    <Text style={styles.buttonText}>Invite a Friend</Text>
                </CustomButton>
            </View>
            <AnimatedSequence>
                <Text style={styles.noDuoText2}>You can start your digital detox journey after forming a Duo</Text>
                <Text style={styles.noDuoText2}>Select an app and set rules to keep the screentime in check</Text>
                <Text style={styles.noDuoText2}>Once a rule is set, it can be relaxed/disabled only after the change is approved by the other member of the Duo</Text>
            </AnimatedSequence>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Background1,
        paddingHorizontal: 20,
    },
    noDuoText1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.Text2,
    },
    noDuoText2: {
        fontSize: 16,
        color: Colors.Text3,
        marginTop: 20,
    },
    button: {
        backgroundColor: Colors.Primary1,
        padding: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: Colors.Text1,
        fontSize: 16,
    },
});