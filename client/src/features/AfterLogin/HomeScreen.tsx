import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AllRulesView } from './Rules/AllRulesView';
import { NoDuoFoundView } from './Duo/NoDuoFoundView';
import { useAppContext } from '../../hooks/useAppContext';
import { NativeModules } from 'react-native';
import { PermissionsScreen } from './Permissions';
import { useNativeContext } from '../../hooks/useNativeContext';

const HomeScreen: React.FC = () => {
    const { myDuo } = useAppContext();
    const { permissions } = useNativeContext();

    if (!permissions.hasUsageStatsPermission || !permissions.hasOverlayPermission) {
        return <PermissionsScreen />
    }

    if (!myDuo) {
        return <NoDuoFoundView />
    }

    return <AllRulesView />
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
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
});

export default HomeScreen;