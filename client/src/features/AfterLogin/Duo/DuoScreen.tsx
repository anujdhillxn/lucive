import React from 'react';
import MyDuo from './MyDuo';
import DuoRequests from './DuoRequests';
import { useAppContext } from '../../../hooks/useAppContext';

const DuoScreen: React.FC = () => {
    const { myDuo } = useAppContext();
    return myDuo ? <MyDuo /> : <DuoRequests />;
};
export default DuoScreen;