import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, RefreshControl, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MyRulesHeaderRenderer, PartnerRulesHeaderRenderer } from '../../../components/RuleMenuHeader';
import { useAppContext } from '../../../hooks/useAppContext';
import RuleCardContainer from './RuleCardContainer';
import { RootStackParamList } from '../../AppScreenStack';
import { HideableView } from '../../../components/HideableView';
import Colors from '../../../styles/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { useActions } from '../../../hooks/useActions';
import { useUserKnowledgeActions } from '../../../hooks/useUserKnowledge';
import { CustomButton } from '../../../components/CustomButton';
export const AllRulesView: React.FC = () => {

    const { rules, user, myDuo } = useAppContext();
    const partner = user?.username === myDuo?.user1 ? myDuo?.user2 : myDuo?.user1;
    const MyRuleComponents = rules.filter(rule => rule.isMyRule).map((rule) => {
        return () => <RuleCardContainer rule={rule} />;
    });
    const PartnerRuleComponents = rules.filter(rule => !rule.isMyRule).map((rule) => {
        return () => <RuleCardContainer rule={rule} />;
    });

    return (
        <ScrollView style={styles.container}>
            <View style={styles.createButtonContainer}>
                <CreateRuleButton />
            </View>
            <HideableView
                openedInitially
                Header={MyRulesHeaderRenderer}
                Components={MyRuleComponents}
                title={'My Rules'}
            />
            <HideableView
                Header={PartnerRulesHeaderRenderer}
                Components={PartnerRuleComponents}
                title={`${partner}'s Rules`}
            />
        </ScrollView>
    );
};

const CreateRuleButton: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const navigateToRuleCreator = () => {
        navigation.navigate('RuleCreator');
        rememberHasTriedToCreateARule();
    };
    const { rememberHasTriedToCreateARule } = useUserKnowledgeActions();
    return (
        <CustomButton style={styles.createButton} onPress={navigateToRuleCreator}>
            <Text style={styles.createButtonText}>Create New Rule</Text>
            <Icon name="add" size={20} color={Colors.Text1} />
        </CustomButton>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Background1,
        paddingHorizontal: 20,
    },
    createButton: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.Primary1,
    },

    createButtonContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },

    createButtonText: {
        color: Colors.Text1,
        fontSize: 16,
    }
});
