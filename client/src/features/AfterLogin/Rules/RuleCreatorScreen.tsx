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
import { convertHHMMSSToDate, formatTime, getTodayMidnight } from '../../../utils/time';
import { useConfirm } from '../../../hooks/useConfirm';
import { useNotification } from '../../../contexts/NotificationContext';
import { hasAChange, isApprovalRequired } from '../../../utils/validation';
import { useAppContext } from '../../../hooks/useAppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Separator from '../../../components/Separator';
import Colors from '../../../styles/colors'
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
    const { rules } = useAppContext();
    const { setRules } = useActions();

    const [selectedApp, setSelectedApp] = useState<string>(rule?.app || '');
    const [dailyMaxMinutes, setDailyMaxMinutes] = useState(rule?.dailyMaxSeconds ? Math.floor(rule.dailyMaxSeconds / 60) : 30);
    const [hourlyMaxMinutes, setHourlyMaxMinutes] = useState(rule?.hourlyMaxSeconds ? Math.floor(rule.hourlyMaxSeconds / 60) : 5);
    const [sessionMaxMinutes, setSessionMaxMinutes] = useState(rule?.sessionMaxSeconds ? Math.floor(rule.sessionMaxSeconds / 60) : 5);
    const [isDailyMaxSecondsEnforced, setIsDailyMaxSecondsEnforced] = useState(rule?.isDailyMaxSecondsEnforced ?? true);
    const [isHourlyMaxSecondsEnforced, setIsHourlyMaxSecondsEnforced] = useState(rule?.isHourlyMaxSecondsEnforced ?? false);
    const [isSessionMaxSecondsEnforced, setIsSessionMaxSecondsEnforced] = useState(rule?.isSessionMaxSecondsEnforced ?? false);
    const [dailyReset, setDailyReset] = useState<Date>(rule?.dailyReset ? convertHHMMSSToDate(rule.dailyReset) : getTodayMidnight());
    const [isRuleActive, setIsRuleActive] = useState(rule?.isActive ?? true);
    const [isStartupDelayEnabled, setIsStartupDelayEnabled] = useState(rule?.isStartupDelayEnabled ?? false);
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

    const getNewRule = (): Rule => {
        return {
            app: selectedApp,
            appDisplayName: selectedApp in installedApps ? installedApps[selectedApp].displayName : selectedApp,
            isActive: isRuleActive,
            isMyRule: true,
            dailyMaxSeconds: dailyMaxMinutes * 60,
            hourlyMaxSeconds: hourlyMaxMinutes * 60,
            sessionMaxSeconds: sessionMaxMinutes * 60,
            isDailyMaxSecondsEnforced,
            isHourlyMaxSecondsEnforced,
            isSessionMaxSecondsEnforced,
            interventionType: 'FULL',
            dailyReset: dailyReset.toTimeString().split(' ')[0],
            isStartupDelayEnabled
        }
    }

    const handleSave = () => {
        const newRule = getNewRule();
        if (rule) {
            api.ruleApi.updateRule(newRule).then((updatedRule) => {
                const newRules = rules.map((r) => r.app === updatedRule.app && r.isMyRule ? updatedRule : r);
                setRules(newRules);
                AsyncStorage.setItem('rules', JSON.stringify(newRules));
                showNotification('Rule updated successfully', 'success');
                navigation.navigate('Home');
            }).catch((e) => {
                console.error(e);
                showNotification('Failed to update rule', 'failure');
            })
        }
        else {
            api.ruleApi.createRule(newRule).then((createdRule) => {
                const newRules = [...rules, createdRule];
                setRules(newRules);
                AsyncStorage.setItem('rules', JSON.stringify(newRules));
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
            <View style={styles.touchable}>
                <Picker
                    enabled={!Boolean(rule)}
                    selectedValue={selectedApp}
                    onValueChange={(itemValue) => setSelectedApp(itemValue)}
                >
                    <Picker.Item label="Select App" value={''} style={styles.placeholder} />
                    {Object.keys(installedApps).map((packageName) => (
                        <Picker.Item key={packageName} style={styles.text} label={installedApps[packageName].displayName} value={packageName} />
                    ))}
                </Picker>
            </View>
            <View style={styles.touchable}>
                <View style={styles.switchContainer}>
                    <Text style={styles.text}>Active</Text>
                    <Switch
                        thumbColor={isRuleActive ? Colors.Accent1 : Colors.Text3}
                        trackColor={{ false: Colors.Background1, true: Colors.Accent2 }}
                        value={isRuleActive}
                        onValueChange={(value) => setIsRuleActive(value)}
                        style={styles.switch}
                    />
                </View>
                <Separator />
                <Text style={styles.textSmall}>Rule will be applied when this switch is on</Text>
            </View>
            <View style={styles.touchable}>
                <View style={styles.switchContainer}>
                    <Text style={styles.text}>Delay Startup</Text>
                    <Switch
                        thumbColor={isStartupDelayEnabled ? Colors.Accent1 : Colors.Text3}
                        trackColor={{ false: Colors.Background1, true: Colors.Accent2 }}
                        value={isStartupDelayEnabled}
                        onValueChange={(value) => setIsStartupDelayEnabled(value)}
                        style={styles.switch}
                    />
                </View>
                <Separator />
                <Text style={styles.textSmall}>Enforce a 10 seconds pause before the app opens up</Text>
            </View>
            <CustomTimePicker editable={isDailyMaxSecondsEnforced} onConfirm={(hh, mm) => setDailyMaxMinutes(Number(hh) * 60 + Number(mm))}>
                <View style={styles.touchable}>
                    <View style={styles.switchContainer}>
                        <View>
                            <Text style={styles.text}>Daily Max Screen Time</Text>
                            <Text style={styles.textSmall}>{isDailyMaxSecondsEnforced ? formatTime(dailyMaxMinutes * 60) : 'N/A'}</Text>
                        </View>
                        <Switch
                            thumbColor={isDailyMaxSecondsEnforced ? Colors.Accent1 : Colors.Text3}
                            trackColor={{ false: Colors.Background1, true: Colors.Accent2 }}
                            value={isDailyMaxSecondsEnforced}
                            onValueChange={(value) => setIsDailyMaxSecondsEnforced(value)}
                            style={styles.switch}
                        />
                    </View>
                    <Separator />
                    <Text style={styles.textSmall}>{isDailyMaxSecondsEnforced ? "Tap to set daily limit" : "Enforce a daily limit"}</Text>
                </View>
            </CustomTimePicker>
            {isDailyMaxSecondsEnforced && <TouchableOpacity onPress={showDatePicker} style={styles.touchable}>
                <Text style={styles.text}>Daily Limit Reset</Text>
                <Text style={styles.textSmall}>{isDailyMaxSecondsEnforced ? dailyReset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</Text>
                <Separator />
                <Text style={styles.textSmall}>Tap to set when the daily limit resets</Text>
            </TouchableOpacity>}
            <CustomTimePicker editable={isHourlyMaxSecondsEnforced} hideHours onConfirm={(hh, mm) => setHourlyMaxMinutes(Number(hh) * 60 + Number(mm))}>
                <View style={styles.touchable}>
                    <View style={styles.switchContainer}>
                        <View>
                            <Text style={styles.text}>Hourly Max Screen Time</Text>
                            <Text style={styles.textSmall}>{isHourlyMaxSecondsEnforced ? formatTime(hourlyMaxMinutes * 60) : 'N/A'}</Text>
                        </View>
                        <Switch
                            thumbColor={isHourlyMaxSecondsEnforced ? Colors.Accent1 : Colors.Text3}
                            trackColor={{ false: Colors.Background1, true: Colors.Accent2 }}
                            value={isHourlyMaxSecondsEnforced}
                            onValueChange={(value) => setIsHourlyMaxSecondsEnforced(value)}
                            style={styles.switch}
                        />
                    </View>
                    <Separator />
                    <Text style={styles.textSmall}>{isHourlyMaxSecondsEnforced ? "Tap to set hourly limit" : "Enforce an hourly limit"}</Text>
                </View>
            </CustomTimePicker>
            <CustomTimePicker editable={isSessionMaxSecondsEnforced} onConfirm={(hh, mm) => setSessionMaxMinutes(Number(hh) * 60 + Number(mm))}>
                <View style={styles.touchable}>
                    <View style={styles.switchContainer}>
                        <View>
                            <Text style={styles.text}>Session Max Screen Time</Text>
                            <Text style={styles.textSmall}>{isSessionMaxSecondsEnforced ? formatTime(sessionMaxMinutes * 60) : 'N/A'}</Text>
                        </View>
                        <Switch
                            thumbColor={isSessionMaxSecondsEnforced ? Colors.Accent1 : Colors.Text3}
                            trackColor={{ false: Colors.Background1, true: Colors.Accent2 }}
                            value={isSessionMaxSecondsEnforced}
                            onValueChange={(value) => setIsSessionMaxSecondsEnforced(value)}
                            style={styles.switch}
                        />
                    </View>
                    <Separator />
                    <Text style={styles.textSmall}>{isSessionMaxSecondsEnforced ? "Tap to set session limit" : "Enforce a session limit"}</Text>
                </View>
            </CustomTimePicker>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
            <View>
                <Button color={Colors.Primary1} title={rule && isApprovalRequired(getNewRule(), rule) ? 'Request Changes' : 'Save Changes'} disabled={selectedApp === '' || (rule && !hasAChange(getNewRule(), rule))} onPress={confirm} />
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: Colors.Background1,
    },
    text: {
        fontSize: 18,
        color: Colors.Text2,
        marginBottom: 10,
    },
    ruleDetailsContainer: {
        marginTop: 20,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    placeholderText: {
        fontSize: 16,
        color: Colors.Text3,
        textAlign: 'center',
        marginTop: 20,
    },
    placeholder: {
        color: Colors.Text3,
    },
    appList: {
        paddingBottom: 20,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: Colors.Text1,
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    touchable: {
        marginTop: 10,
        marginBottom: 10,
        padding: 10, // Add padding for better touch area
        borderRadius: 5, // Optional: Add border radius for rounded corners
        backgroundColor: Colors.Background2,
    },
    textSmall: {
        fontSize: 14,
        color: Colors.Text3,
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
