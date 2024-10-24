import React from 'react';
import { View, Text, StyleSheet, Button, NativeModules } from 'react-native';
import { Rule } from '../../../types/state';
import { convertHHMMSSToDate, formatTime } from '../../../utils/time';
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
        fetchHourlyScreenTime();
        fetchDailyScreenTime();
    }, []);

    return (
        <View style={styles.card}>
            <Text style={[styles.title, { color: rule.isActive ? '#000' : '#888' }]}>{rule.appDisplayName}</Text>
            {rule.hourlyMaxSeconds && <Text style={styles.timeLimit}>Hourly: {currentHourlyUsage}/{formatTime(rule.hourlyMaxSeconds)}</Text>}
            {rule.dailyMaxSeconds && <><Text style={styles.timeLimit}>Daily: {currentDailyUsage}/{formatTime(rule.dailyMaxSeconds)}</Text>
                <Text style={styles.timeLimit}>Resets at: {convertHHMMSSToDate(rule.dailyReset).toLocaleTimeString()}</Text></>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        marginBottom: 10,
    },
    timeLimit: {
        fontSize: 12,
        color: '#888',
    },
});