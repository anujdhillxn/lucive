import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { ScreentimeRuleCard } from './RuleCards/ScreentimeRuleCard';
import { RootStackParamList } from '../../AppScreenStack';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { Rule, RuleType } from '../../../types/state';

export const RuleCardComponents = {
    [RuleType.SCREENTIME]: ScreentimeRuleCard,
};


const RuleCardContainer: React.FC<{ rule: Rule<RuleType> }> = ({ rule }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { api } = useApi();
    const { ruleApi } = api;
    const { setRules } = useActions();
    const navigateToRuleEditor = () => {
        navigation.navigate('RuleEditor', rule);
    };

    const toggleEdit = () => {
        ruleApi.allowChange(rule)
            .then(() => {
                ruleApi.getRules().then((rulesResp) => {
                    setRules(rulesResp);
                })
                    .catch((err) => {
                        console.log(err);
                    })
            })
    };

    const toggleActive = () => {
        ruleApi.updateRule({ ...rule, isActive: !rule.isActive })
            .then(() => {
                ruleApi.getRules().then((rulesResp) => {
                    setRules(rulesResp);
                })
                    .catch((err) => {
                        console.log(err);
                    })
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteRule = () => {
        ruleApi.deleteRule(rule)
            .then(() => {
                ruleApi.getRules().then((rulesResp) => {
                    setRules(rulesResp);
                })
                    .catch((err) => {
                        console.log(err);
                    })
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const RuleCardDetails = RuleCardComponents[rule.ruleType];
    return (
        <View style={styles.container}>
            <View style={styles.detailsSection}>
                <RuleCardDetails rule={rule} />
            </View>
            <View style={styles.buttonsSection}>
                <Menu>
                    <MenuTrigger disabled={!rule.changeAllowed && !rule.isMyRule}>
                        <Icon name="more-vert" size={24} color={!rule.changeAllowed && !rule.isMyRule ? "#888" : "#000"} />
                    </MenuTrigger>
                    <MenuOptions>
                        {!rule.isMyRule && <MenuOption onSelect={navigateToRuleEditor} text="Edit" />}
                        {rule.isMyRule && <MenuOption onSelect={toggleEdit} text={`${rule.changeAllowed ? "Disable" : "Enable"} Edits by Partner`} />}
                        {!rule.isMyRule && <MenuOption onSelect={toggleActive} text={`${rule.isActive ? "Disable" : "Enable"}`} />}
                        {!rule.isMyRule && <MenuOption onSelect={deleteRule} text="Delete" />}
                    </MenuOptions>
                </Menu>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    detailsSection: {
        flex: 1,
    },
    buttonsSection: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    button: {
        marginVertical: 4,
    },
});
export default RuleCardContainer;