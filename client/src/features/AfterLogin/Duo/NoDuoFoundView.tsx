import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../AppScreenStack';
import { AnimatedSequence } from '../../../components/AnimatedComponentSequence';

export const NoDuoFoundView: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const navigateToDuoScreen = () => {
        navigation.navigate('Duo');
    };

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.noDuoText1}>You have not formed a Duo</Text>
                <TouchableOpacity style={styles.createButton} onPress={navigateToDuoScreen}>
                    <Icon name="add" size={20} color="#fff" style={styles.createButtonIcon} />
                    <Text style={styles.createButtonText}>Form Duo</Text>
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
});