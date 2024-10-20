import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../AppScreenStack';
import { RuleCreatorComponents } from './RuleCreatorScreen';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { RuleDetailsMap, RuleType } from '../../../types/state';

type RuleEditorRouteProp = RouteProp<RootStackParamList, 'RuleEditor'>;


const RuleEditorScreen: React.FC = () => {
    const route = useRoute<RuleEditorRouteProp>();
    const { app, ruleType, isActive, details } = route.params;
    const RuleDetailsComponent = RuleCreatorComponents[ruleType];
    const { api } = useApi();
    const { ruleApi } = api;
    const { setRules } = useActions();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const onSave = (ruleDetails: RuleDetailsMap[RuleType]) => {
        ruleApi.updateRule({ app, ruleType, details: ruleDetails, isActive })
            .then(() => {
                ruleApi.getRules().then((rulesResp) => {
                    setRules(rulesResp);
                    navigation.navigate('Home');
                })
                    .catch((err) => {
                        console.log(err);
                    })
            })
            .catch((err) => {
                console.log('Error creating rule:', err);
            })
    }

    return (
        <View style={styles.container}>
            <Picker
                enabled={false}
                selectedValue={null}
                onValueChange={() => { }}
            >
                <Picker.Item label={app} value={null} style={styles.placeholder} />
            </Picker>
            <Picker

                enabled={false}
                selectedValue={null}
                onValueChange={() => { }}
            >
                <Picker.Item style={styles.placeholder} label={ruleType} value={null} />
            </Picker>

            {RuleDetailsComponent && <RuleDetailsComponent onSave={onSave} initialDetails={details} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    ruleDetailsContainer: {
        marginTop: 20,
    },
    selectedAppText: {
        fontSize: 18,
        color: '#007BFF',
        textAlign: 'center',
        marginTop: 20,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    placeholder: {
        color: '#888', // Grey color for the placeholder text
    },
});

export default RuleEditorScreen;