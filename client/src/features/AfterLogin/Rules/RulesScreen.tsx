import React from 'react';
import { AllRulesView } from './AllRulesView';
import { useActions } from '../../../hooks/useActions';

const RulesScreen: React.FC = () => {
    const { fetchData } = useActions();
    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };
    return <AllRulesView />
}
export default RulesScreen;