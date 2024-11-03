import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MyRulesHeaderRenderer, PartnerRulesHeaderRenderer } from '../../../components/RuleMenuHeader';
import { useAppContext } from '../../../hooks/useAppContext';
import RuleCardContainer from './RuleCardContainer';
import { RootStackParamList } from '../../AppScreenStack';
import { HideableView } from '../../../components/HideableView';
import { ScrollView } from 'react-native-gesture-handler';
import { useActions } from '../../../hooks/useActions';

export const AllRulesView: React.FC = () => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [refreshing, setRefreshing] = React.useState(false);
    const { fetchData } = useActions();
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };
    const navigateToRuleCreator = () => {
        navigation.navigate('RuleCreator');
    };

    const { rules } = useAppContext();
    const MyRuleComponents = rules.filter(rule => rule.isMyRule).map((rule) => {
        return () => <RuleCardContainer rule={rule} />;
    });

    const PartnerRuleComponents = rules.filter(rule => !rule.isMyRule).map((rule) => {
        return () => <RuleCardContainer rule={rule} />;
    });
    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <TouchableOpacity style={styles.createButton} onPress={navigateToRuleCreator}>
                <Text style={styles.createButtonText}>Create New Rule</Text>
                <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
            <HideableView

                Header={MyRulesHeaderRenderer}
                Components={MyRuleComponents}
            />
            <HideableView
                Header={PartnerRulesHeaderRenderer}
                Components={PartnerRuleComponents}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
    },
    createButton: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
    }
});
