import React from 'react';
import { View, Text, StyleSheet, Button, NativeModules } from 'react-native';
import { Rule } from '../../../types/state';
import { convertHHMMSSToDate, formatTime } from '../../../utils/time';
import StrikeThroughText from '../../../components/StrikeThroughText';
import Colors from '../../../styles/colors';
const { UsageTracker } = NativeModules;

interface RuleCardProps {
    rule: Rule;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule }) => {

    const [currentDailyUsage, setCurrentDailyUsage] = React.useState<string>("");
    const [currentHourlyUsage, setCurrentHourlyUsage] = React.useState<string>("");
    const fetchHourlyScreenTime = async () => {
        try {
            const hourlyScreenTime = await UsageTracker.getHourlyScreenTime(rule.app);
            setCurrentHourlyUsage(formatTime(hourlyScreenTime));
        }
        catch (e: any) {
            setCurrentHourlyUsage(e.message);
        }
    };

    const fetchDailyScreenTime = async () => {
        try {
            const dailyScreenTime = await UsageTracker.getDailyScreenTime(rule.app);
            setCurrentDailyUsage(formatTime(dailyScreenTime));
        }
        catch (e: any) {
            setCurrentDailyUsage(e.message);
        }
    }

    React.useEffect(() => {
        const interval = setInterval(() => {
            fetchHourlyScreenTime();
            fetchDailyScreenTime();
        });
        return () => clearInterval(interval);
    }, []);
    return <View style={styles.card}>
        <Text style={styles.title}>
            {rule.appDisplayName} (<StrikeThroughText new={rule.modificationData?.isActive ? "Active" : "Inactive"} old={rule.isActive ? "Active" : "Inactive"} changed={Boolean(rule.modificationData && rule.isActive !== rule.modificationData?.isActive)} />)
        </Text>
        {rule.isHourlyMaxSecondsEnforced &&
            <Text style={styles.timeLimit}>
                {'Hourly: '}
                {rule.isMyRule && <Text>
                    {currentHourlyUsage}/
                </Text>}
                <StrikeThroughText new={rule.modificationData ? (rule.modificationData.isHourlyMaxSecondsEnforced ? formatTime(rule.modificationData.hourlyMaxSeconds) : 'N/A') : ''} old={rule.isHourlyMaxSecondsEnforced ? formatTime(rule.hourlyMaxSeconds) : 'N/A'} changed={Boolean(rule.modificationData) && (rule.isHourlyMaxSecondsEnforced !== rule.modificationData?.isHourlyMaxSecondsEnforced || rule.hourlyMaxSeconds !== rule.modificationData.hourlyMaxSeconds)} />
            </Text>}
        {rule.isDailyMaxSecondsEnforced &&
            <>
                <Text style={styles.timeLimit}>
                    {"Daily: "}
                    {rule.isMyRule && <Text>
                        {currentDailyUsage}/
                    </Text>}
                    <StrikeThroughText new={rule.modificationData ? (rule.modificationData.isDailyMaxSecondsEnforced ? formatTime(rule.modificationData.dailyMaxSeconds) : 'N/A') : ''} old={rule.isDailyMaxSecondsEnforced ? formatTime(rule.dailyMaxSeconds) : 'N/A'} changed={Boolean(rule.modificationData) && (rule.isDailyMaxSecondsEnforced !== rule.modificationData?.isDailyMaxSecondsEnforced || rule.dailyMaxSeconds !== rule.modificationData.dailyMaxSeconds)} />
                </Text>
                <Text style={styles.timeLimit}>
                    <Text>Resets at: </Text>
                    <StrikeThroughText new={rule.modificationData ? convertHHMMSSToDate(rule.modificationData?.dailyReset!).toLocaleTimeString() : ''} old={convertHHMMSSToDate(rule.dailyReset).toLocaleTimeString()} changed={Boolean(rule.modificationData && rule.dailyReset !== rule.modificationData.dailyReset)} />
                </Text>
            </>
        }
        {rule.isSessionMaxSecondsEnforced &&
            <>
                <Text style={styles.timeLimit}>
                    {"Session Limit: "}
                    <StrikeThroughText new={rule.modificationData ? (rule.modificationData.isSessionMaxSecondsEnforced ? formatTime(rule.modificationData.sessionMaxSeconds) : 'N/A') : ''} old={rule.isSessionMaxSecondsEnforced ? formatTime(rule.sessionMaxSeconds) : 'N/A'} changed={Boolean(rule.modificationData) && (rule.isSessionMaxSecondsEnforced !== rule.modificationData?.isSessionMaxSecondsEnforced || rule.sessionMaxSeconds !== rule.modificationData.sessionMaxSeconds)} />
                </Text>
            </>}
        {rule.isStartupDelayEnabled &&
            <Text style={styles.timeLimit}>
                {"Startup Delay: "}
                <StrikeThroughText new={rule.modificationData ? rule.modificationData?.isStartupDelayEnabled ? "Enabled" : "Disabled" : ''} old={rule.isStartupDelayEnabled ? "Enabled" : "Disabled"} changed={Boolean(rule.modificationData && rule.isStartupDelayEnabled !== rule.modificationData.isStartupDelayEnabled)} />
            </Text>
        }
        {rule.isTemporary &&
            <Text style={styles.timeLimit}>
                {`\nValid till: ${new Date(rule.validTill).toLocaleTimeString()}`}
            </Text>
        }
    </View>
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.Text2,
    },
    description: {
        fontSize: 14,
        marginBottom: 10,
    },
    timeLimit: {
        fontSize: 12,
        color: Colors.Text3,
    },
});