import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MyRulesHeaderRenderer, PartnerRulesHeaderRenderer } from '../../../components/RuleMenuHeader';
import { useAppContext } from '../../../hooks/useAppContext';
import RuleCardContainer from './RuleCardContainer';
import { RootStackParamList } from '../../AppScreenStack';
import { HideableView } from '../../../components/HideableView';
import Colors from '../../../styles/colors';
import { ScrollView } from 'react-native-gesture-handler';
export const AllRulesView: React.FC = () => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.createButton} onPress={navigateToRuleCreator}>
                <Text style={styles.createButtonText}>Create New Rule</Text>
                <Icon name="add" size={20} color={Colors.Text1} />
            </TouchableOpacity>
            <HideableView
                openedInitially
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
        backgroundColor: Colors.Background1,
        paddingHorizontal: 20,
    },
    createButton: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.Primary1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    createButtonText: {
        color: Colors.Text1,
        fontSize: 16,
    }
});
