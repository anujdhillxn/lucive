import React from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import { UserDetails } from './UserDetails';
import { View } from 'react-native';
import MyDuo from './MyDuo';
import { NoDuoFoundView } from './NoDuoFoundView';
import Separator from '../../../components/Separator';
import Colors from '../../../styles/colors';

const UserScreen: React.FC = () => {
    const { myDuo } = useAppContext();

    return <View style={styles.container}>
        <UserDetails />
        <Separator />
        <View>{myDuo ? <MyDuo /> : <NoDuoFoundView />}</View>
    </View>
};

const styles = {
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.Background1,
    },
};


export default UserScreen;