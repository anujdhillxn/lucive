import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, NativeModules, Image, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { RootStackParamList } from '../../AppScreenStack';
import { ScrollView, Switch, TouchableOpacity } from 'react-native-gesture-handler';
import CustomTimePicker from '../../../components/CustomTimePicker';
import { Rule } from '../../../types/state';
import { useNativeContext } from '../../../hooks/useNativeContext';
import { convertHHMMSSToDate, formatTime } from '../../../utils/time';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../contexts/NotificationContext';

// const AppItem: React.FC<AppInfo> = ({ displayName, packageName, icon }) => (
//     <View style={styles.appItem}>
//         <Image source={{ uri: icon }} style={styles.appIcon} />
//         <View>
//             <Text style={styles.appName}>{displayName}</Text>
//             <Text style={styles.appPackage}>{packageName}</Text>
//         </View>
//     </View>
// );

type RuleEditorRouteProp = RouteProp<RootStackParamList, 'RuleCreator'>;


export const RuleCreatorScreen: React.FC = () => {
    const route = useRoute<RuleEditorRouteProp>();
    const rule = route.params;
    const { api } = useApi();
    const { setRules } = useActions();
    const [selectedApp, setSelectedApp] = useState<string>(rule?.app || '');
    const [dailyMaxMinutes, setDailyMaxMinutes] = useState(rule?.dailyMaxSeconds ? Math.floor(rule.dailyMaxSeconds / 60) : 30);
    const [hourlyMaxMinutes, setHourlyMaxMinutes] = useState(rule?.hourlyMaxSeconds ? Math.floor(rule.hourlyMaxSeconds / 60) : 5);
    const [dailyReset, setDailyReset] = useState<Date>(rule?.dailyReset ? convertHHMMSSToDate(rule.dailyReset) : new Date());
    const [isRuleActive, setIsRuleActive] = useState(rule?.isActive ?? true);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const { installedApps } = useNativeContext();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { showNotification } = useNotification();

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        setDailyReset(date);
        hideDatePicker();
    };

    const handleSave = () => {
        const newRule: Rule = {
            app: selectedApp,
            appDisplayName: installedApps[selectedApp].displayName,
            isActive: isRuleActive,
            isMyRule: true,
            dailyMaxSeconds: dailyMaxMinutes * 60,
            hourlyMaxSeconds: hourlyMaxMinutes * 60,
            interventionType: 'FULL',
            createdAt: new Date().toISOString(),
            lastModifiedAt: new Date().toISOString(),
            dailyReset: dailyReset.toTimeString().split(' ')[0],
        }
        if (rule) {
            api.ruleApi.updateRule(newRule).then((updatedRule) => {
                setRules((rules) => rules.map((r) => r.app === updatedRule.app && r.isMyRule ? updatedRule : r));
                showNotification('Rule updated successfully', 'success');
                navigation.navigate('Home');
            }).catch((e) => {
                console.error(e);
                showNotification('Failed to update rule', 'failure');
            })
        }
        else {
            api.ruleApi.createRule(newRule).then((createdRule) => {
                setRules((rules) => [...rules, createdRule]);
                showNotification('Rule created successfully', 'success');
                navigation.navigate('Home');
            }).catch((e) => {
                console.error(e);
                showNotification('Failed to create rule', 'failure');
            })
        }
    }

    const { confirm } = useConfirm(handleSave, "Are you sure you want to save this rule?");

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <Text>Select App:</Text>
            <Picker
                enabled={!Boolean(rule)}
                selectedValue={selectedApp}
                onValueChange={(itemValue) => setSelectedApp(itemValue)}
            >
                <Picker.Item label="Select App" value={''} style={styles.placeholder} />
                {Object.keys(installedApps).map((packageName) => (
                    <Picker.Item key={packageName} label={installedApps[packageName].displayName} value={packageName} />
                ))}
            </Picker>
            <View style={styles.touchable}>
                <View style={styles.switchContainer}>
                    <Text style={styles.text}>Active</Text>
                    <Switch
                        value={isRuleActive}
                        onValueChange={(value) => setIsRuleActive(value)}
                        style={styles.switch}
                    />
                </View>

            </View>
            <TouchableOpacity onPress={showDatePicker} style={styles.touchable}>
                <Text style={styles.text}>Daily Limit Reset</Text>
                <Text style={styles.textSmall}>{dailyReset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            <CustomTimePicker onConfirm={(hh, mm) => setDailyMaxMinutes(Number(hh) * 60 + Number(mm))}>
                <View style={styles.touchable}>
                    <Text style={styles.text}>Daily Max Screen Time</Text>
                    <Text style={styles.textSmall}>{formatTime(dailyMaxMinutes * 60)}</Text>
                </View>
            </CustomTimePicker>
            <CustomTimePicker hideHours onConfirm={(hh, mm) => setHourlyMaxMinutes(Number(hh) * 60 + Number(mm))}>
                <View style={styles.touchable}>
                    <Text style={styles.text}>Hourly Max Screen Time</Text>
                    <Text style={styles.textSmall}>{formatTime(hourlyMaxMinutes * 60)}</Text>
                </View>
            </CustomTimePicker>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
            <Button title="Save" onPress={confirm} />
        </ScrollView>
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
        marginBottom: 10,
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
    appList: {
        paddingBottom: 20,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    appIcon: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
    appName: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    appPackage: {
        fontSize: 12,
        color: '#999',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    touchable: {
        marginBottom: 20,
        borderWidth: 1, // Add border width
        borderColor: '#ccc', // Add light border color
        padding: 10, // Add padding for better touch area
        borderRadius: 5, // Optional: Add border radius for rounded corners
    },
    textSmall: {
        fontSize: 14,
        color: '#777',
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
});
