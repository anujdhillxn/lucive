import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { AllRulesView } from './Rules/AllRulesView';
import { NoDuoFoundView } from './User/NoDuoFoundView';
import { useAppContext } from '../../hooks/useAppContext';
import { NativeModules } from 'react-native';
import { PermissionsScreen } from './PermissionsScreen';
import { useNativeContext } from '../../hooks/useNativeContext';
import { useActions } from '../../hooks/useActions';
import UserView from './User/UserView';

const HomeScreen: React.FC = () => {
    const { myDuo } = useAppContext();
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
    return myDuo ? <AllRulesView /> : <UserView />
}
export default HomeScreen;