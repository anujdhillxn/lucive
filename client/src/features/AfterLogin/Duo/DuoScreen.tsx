import React from 'react';
import MyDuo from './MyDuo';
import { useAppContext } from '../../../hooks/useAppContext';
import { NoDuoFoundView } from './NoDuoFoundView';

const DuoScreen: React.FC = () => {
    const { myDuo } = useAppContext();
    return myDuo ? <MyDuo /> : <NoDuoFoundView />;
};
export default DuoScreen;