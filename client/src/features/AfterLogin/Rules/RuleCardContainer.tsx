import React from 'react';
import { View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { RuleCard } from './RuleCard';
import { RootStackParamList } from '../../AppScreenStack';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { Rule } from '../../../types/state';

type RuleCardContainerProps = {
    rule: Rule;
}


const RuleCardContainer: React.FC<RuleCardContainerProps> = (props: RuleCardContainerProps) => {

    return (
        <View style={styles.container}>
            <View style={styles.detailsSection}>
                <RuleCard rule={props.rule} />
            </View>
            <View style={styles.buttonsSection}>
                {props.rule.isMyRule ? <MyRuleActions rule={props.rule} /> : <PartnerRuleActions rule={props.rule} />}
            </View>
        </View>
    );
};

type MyRuleActionsProps = {
    rule: Rule;
}

const MyRuleActions: React.FC<MyRuleActionsProps> = (props: MyRuleActionsProps) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { api } = useApi();
    const { ruleApi } = api;
    const { setRules } = useActions();

    const navigateToRuleEditor = () => {
        navigation.navigate('RuleCreator', props.rule);
    };

    const onDelete = () => {
        ruleApi.deleteRule(props.rule.app).then(() => {
            ruleApi.getRules().then((rules) => {
                setRules(rules);
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.error(e);
        });
    }

    const onCancelChange = () => {
        ruleApi.deleteRuleModificationRequest(props.rule.app).then(() => {
            ruleApi.getRules().then((rules) => {
                setRules(rules);
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.error(e);
        });
    }


    return <Menu>
        <MenuTrigger>
            <Icon name="more-vert" size={24} />
        </MenuTrigger>
        <MenuOptions>
            {!Boolean(props.rule.modificationData) && <MenuOption onSelect={navigateToRuleEditor} text="Edit" />}
            {Boolean(props.rule.modificationData) && <MenuOption onSelect={onCancelChange} text="Cancel Change" />}
            <MenuOption disabled={props.rule.isActive} onSelect={onDelete} text="Delete" />
        </MenuOptions>
    </Menu>
}

type PartnerRuleActionsProps = {
    rule: Rule;
}

const PartnerRuleActions: React.FC<PartnerRuleActionsProps> = (props: PartnerRuleActionsProps) => {

    const { api } = useApi();
    const { ruleApi } = api;
    const { setRules } = useActions();

    const onApproveChange = () => {
        ruleApi.approveRuleModificationRequest(props.rule.app).then(() => {
            ruleApi.getRules().then((rules) => {
                setRules(rules);
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.error(e);
        });
    }
    return Boolean(props.rule.modificationData) ? <Button title="Approve" onPress={onApproveChange} /> : null;
}

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