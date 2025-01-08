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
import { useUserKnowledge, useUserKnowledgeActions } from '../../../hooks/useUserKnowledge';
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
    const { rememberHasTriedToCreateARule } = useUserKnowledgeActions();
    const { hasTriedToCreateARule } = useUserKnowledge();
    const borderAnimation = React.useRef(new Animated.Value(0)).current;

    const navigateToRuleCreator = () => {
        navigation.navigate('RuleCreator');
        rememberHasTriedToCreateARule();
    };

    React.useEffect(() => {
        if (!hasTriedToCreateARule) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(borderAnimation, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(borderAnimation, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }
    }, [hasTriedToCreateARule, borderAnimation]);

    const borderColor = borderAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.Primary1, Colors.Danger],
    });

    return (
        <Animated.View style={[styles.createButtonContainer, !hasTriedToCreateARule && { borderColor, borderWidth: 2 }]}>
            <CustomButton style={styles.createButton} onPress={navigateToRuleCreator}>
                <Text style={styles.createButtonText}>Create New Rule</Text>
                <Icon name="add" size={20} color={Colors.Text1} />
            </CustomButton>
        </Animated.View>
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
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.Primary1,
    },

    createButtonContainer: {
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    createButtonText: {
        color: Colors.Text1,
        marginRight: 10,
    },
});
