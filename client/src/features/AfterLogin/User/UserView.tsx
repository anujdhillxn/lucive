import React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import MyDuo from './MyDuo';
import { NoDuoFoundView } from './NoDuoFoundView';
import { UserDetails } from './UserDetails';
import { View } from 'react-native';

const UserView: React.FC = () => {
    const { myDuo } = useAppContext();

    return <>
        <View style={styles.container}>{myDuo ? <MyDuo /> : <NoDuoFoundView />}</View>
        <UserDetails />
    </>
};

const styles = {
    container: {
        flex: 1,
    },
};

export default UserView;