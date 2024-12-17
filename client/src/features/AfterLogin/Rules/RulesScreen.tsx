import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { AllRulesView } from './AllRulesView';
import { NoDuoFoundView } from '../User/NoDuoFoundView';
import { useAppContext } from '../../../hooks/useAppContext';
import { NativeModules } from 'react-native';
import { PermissionsScreen } from '../PermissionsScreen';
import { useNativeContext } from '../../../hooks/useNativeContext';
import { useActions } from '../../../hooks/useActions';
import UserScreen from '../User/UserScreen';

const RulesScreen: React.FC = () => {
    const { fetchData } = useActions();
    const { permissions } = useNativeContext();
    const [refreshing, setRefreshing] = React.useState(false);
    if (!permissions.hasUsageStatsPermission || !permissions.hasOverlayPermission) {
        return <PermissionsScreen />
    }
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };
    return <AllRulesView />
}
export default RulesScreen;