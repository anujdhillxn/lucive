import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, NativeModules, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScreenTimeRuleCreator } from './RuleCreators/ScreentimeRuleCreator';
import { useApi } from '../../../hooks/useApi';
import { useActions } from '../../../hooks/useActions';
import { RootStackParamList } from '../../AppScreenStack';
import { RuleDetailsMap, RuleType } from '../../../types/state';
const { InstalledApps } = NativeModules;

export type AppInfo = {
    displayName: string;
    packageName: string;
    icon: string;
}

export const RuleCreatorComponents = {
    [RuleType.SCREENTIME]: ScreenTimeRuleCreator,
};


const ruleTypes = Object.keys(RuleType).map((key) => ({
    label: key,
    value: RuleType[key as keyof typeof RuleType],
}));

const AppItem: React.FC<AppInfo> = ({ displayName, packageName, icon }) => (
    <View style={styles.appItem}>
        <Image source={{ uri: icon }} style={styles.appIcon} />
        <View>
            <Text style={styles.appName}>{displayName}</Text>
            <Text style={styles.appPackage}>{packageName}</Text>
        </View>
    </View>
);

export const RuleCreatorScreen: React.FC = () => {
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(null);
    const RuleDetailsComponent = selectedApp && selectedRuleType ? RuleCreatorComponents[selectedRuleType] : null;
    const { api } = useApi();
    const { ruleApi } = api;
    const { setRules } = useActions();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);

    const fetchInstalledApps = async () => {
        try {
            const apps = await InstalledApps.getInstalledApps();
            setInstalledApps(apps);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchInstalledApps();
    }
        , []);

    const onSave = (ruleDetails: RuleDetailsMap[RuleType]) => {
        ruleApi.createRule({ app: selectedApp!, ruleType: selectedRuleType!, details: ruleDetails })
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
            <Text>Select App:</Text>
            <Picker
                selectedValue={selectedApp}
                onValueChange={(itemValue) => setSelectedApp(itemValue)}
            >
                <Picker.Item label="Select App" value={null} style={styles.placeholder} />
                {installedApps.map((app) => (
                    <Picker.Item key={app.packageName} label={app.displayName} value={app.packageName} />
                ))}
            </Picker>

            <Text>Select Rule Type:</Text>
            <Picker
                selectedValue={selectedRuleType}
                onValueChange={(itemValue) => setSelectedRuleType(itemValue)}
            >
                <Picker.Item style={styles.placeholder} label="Select Rule Type" value={null} />
                {ruleTypes.map((ruleType) => (
                    <Picker.Item key={ruleType.value} label={ruleType.label} value={ruleType.value} />
                ))}
            </Picker>

            {RuleDetailsComponent && <RuleDetailsComponent onSave={onSave} />}
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
});
