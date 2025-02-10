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
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../contexts/NotificationContext';
import Colors from '../../../styles/colors';
import { CustomTextButton } from '../../../components/CustomButton';

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
    const { showNotification } = useNotification();
    const navigateToRuleEditor = () => {
        navigation.navigate('RuleCreator', props.rule);
    };

    const onDelete = () => {
        ruleApi.deleteRule(props.rule.app).then(() => {
            setRules((rules) => rules.filter((r) => !(r.app === props.rule.app && r.isMyRule)));
            showNotification("Rule deleted successfully", "success");
        }).catch((e) => {
            console.error(e);
            showNotification("Failed to delete rule", "failure");
        });
    }

    const onCancelChange = () => { // weird behaviour?
        ruleApi.deleteRuleModificationRequest(props.rule.app).then((updatedRule) => {
            setRules((rules) => rules.map((r) => r.app === updatedRule.app && r.isMyRule ? updatedRule : r));
            showNotification("Change cancelled successfully", "success");
        }).catch((e) => {
            console.error(e);
            showNotification("Failed to cancel change", "failure");
        });
    }

    const { confirm: onDeleteConfirm } = useConfirm(onDelete, "Are you sure you want to delete this rule?");
    const { confirm: onCancelChangeConfirm } = useConfirm(onCancelChange, "Are you sure you want to cancel this change?");

    return <Menu>
        <MenuTrigger>
            <Icon name="more-vert" color={Colors.Text2} size={24} />
        </MenuTrigger>
        <MenuOptions>
            {!Boolean(props.rule.modificationData) && <MenuOption onSelect={navigateToRuleEditor} text="Edit" />}
            {Boolean(props.rule.modificationData) && <MenuOption onSelect={onCancelChangeConfirm} text="Cancel Change" />}
            <MenuOption disabled={props.rule.isActive} onSelect={onDeleteConfirm} text="Delete" />
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
    const { showNotification } = useNotification();

    const onApprove = (validTill: string, isTemporary: boolean) => {
        ruleApi.approveRuleModificationRequest(props.rule.app, validTill, isTemporary).then((updatedRule) => {
            setRules((rules) => rules.map((r) => r.app === updatedRule.app && !r.isMyRule ? updatedRule : r));
            showNotification("Change approved successfully", "success");
        }).catch((e) => {
            showNotification("Failed to approve change", "failure");
            console.error(e);
        });
    }
    const now = new Date();
    const oneHour = new Date(now.getTime() + 1 * 3600 * 1000).toISOString();
    const threeHours = new Date(now.getTime() + 3 * 3600 * 1000).toISOString();
    const twentyFourHours = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    // For permanent approval, validTill remains empty.
    const permanently = "";
    return Boolean(props.rule.modificationData) ? (
        <Menu>
            <MenuTrigger>
                <Icon name="more-vert" color={Colors.Text2} size={24} />
            </MenuTrigger>
            <MenuOptions>
                <MenuOption onSelect={() => onApprove(oneHour, true)} text="Approve for 1 hour" />
                <MenuOption onSelect={() => onApprove(threeHours, true)} text="Approve for 3 hours" />
                <MenuOption onSelect={() => onApprove(twentyFourHours, true)} text="Approve for 24 hours" />
                <MenuOption onSelect={() => onApprove(permanently, false)} text="Approve permanently" />
            </MenuOptions>
        </Menu>
    ) : null;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        backgroundColor: Colors.Background2, //
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
        marginVertical: 1,
    },
});
export default RuleCardContainer;