import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Colors from '../../../styles/colors';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useConfirm } from '../../../hooks/useConfirm';
import { useAppContext } from '../../../hooks/useAppContext';
import { useApi } from '../../../hooks/useApi';
import { doNothing, getDateISO } from '../../../utils/time';
import { useActions } from '../../../hooks/useActions';
import { useNotification } from '../../../contexts/NotificationContext';
import { IntervalScore } from '../../../types/state';
import { NativeModules } from "react-native";
const { UsageTracker } = NativeModules;

const getBackgroundColor = (score: IntervalScore) => {
    if (!score.deviceRunning) {
        return Colors.Background2;
    }
    if (score.serviceRunning) {
        return Colors.Accent1;
    }
    return Colors.Danger;
}

const ScoresScreen = () => {
    const { myScores } = useAppContext();
    const { setMyScores } = useActions();
    const { api } = useApi();
    const { showNotification } = useNotification();
    const currentStreak = myScores?.currentStreak || 0;
    const longestStreak = myScores?.longestStreak || 0;
    const [loadingScoreAggs, setLoadingScoreAggs] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<string>(getDateISO(new Date()));
    const [intervalScores, setIntervalScores] = React.useState<IntervalScore[]>([]);
    const totalWidth = Dimensions.get('window').width;
    const intervalWidth = totalWidth / 1440;
    const getMarkedDates = () => {
        const markedDates: { [date: string]: any } = {};
        if (myScores) {
            for (const date in myScores.scoresByDate) {
                if (myScores.scoresByDate[date].uninterruptedTracking) {
                    markedDates[date] = { marked: true, dotColor: Colors.Accent1 };
                }
            }
        }
        return markedDates;
    }

    const handleMonthChange = async (event: any) => {
        const month = event.month - 1;
        const year = event.year;
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const today = new Date();
        const endDate = today < monthEnd ? today : monthEnd;
        if (monthStart > endDate) {
            return;
        }
        setLoadingScoreAggs(true);
        try {
            const resp = await api.scoresApi.getScoresData(getDateISO(monthStart), getDateISO(endDate));
            setMyScores(curr => ({ ...curr, scoresByDate: { ...curr.scoresByDate, ...resp } }));
        }
        catch (e) {
            showNotification("Failed to fetch scores", 'failure');
            console.log(e);
        } finally {
            setLoadingScoreAggs(false);
        }
    }

    const handleDayPress = (event: any) => {
        const date = event.dateString;
        setSelectedDate(date);
    };

    const fetchIntervalScores = async () => {
        try {
            const intervalScores = await UsageTracker.getIntervalScores(selectedDate);
            setIntervalScores(intervalScores);
        }
        catch (e) {
            setIntervalScores([]);
            console.log(e);
        }
    }

    React.useEffect(() => {
        fetchIntervalScores();
    }, [selectedDate]);

    const { confirm } = useConfirm(doNothing, "A day will be added to your streak if Lucive background service runs throughout the day with atleast one active rule.\n If you miss a day, your streak will reset to 0.\n Streaks are updated when Lucive is opened and it must be done once in a week to not lose any progress.", true, "Got it");

    return (
        <View style={styles.container}>
            <View style={styles.totalScoreContainer}>
                <View style={styles.streakContainer}>
                    <Text style={styles.totalScoreText}>Streak: {currentStreak}, Longest: {longestStreak}</Text>
                    <TouchableOpacity onPress={confirm}>
                        <Icon name="info-circle" size={20} color={Colors.Text2} style={styles.infoIcon} />
                    </TouchableOpacity>
                </View>
            </View>
            <Calendar
                markedDates={{
                    ...getMarkedDates(),
                    [selectedDate]: { selected: true, selectedColor: Colors.Accent1 },
                }}
                onMonthChange={handleMonthChange}
                onDayPress={handleDayPress}
                theme={{
                    calendarBackground: Colors.Background1,
                    textSectionTitleColor: Colors.Text1,
                    selectedDayBackgroundColor: Colors.Accent1,
                    selectedDayTextColor: Colors.Text1,
                    dayTextColor: Colors.Text1,
                    dotColor: Colors.Accent1,
                    selectedDotColor: Colors.Text1,
                    arrowColor: Colors.Primary1,
                    monthTextColor: Colors.Primary1,
                    indicatorColor: Colors.Primary1,
                    todayTextColor: Colors.Accent1,
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16,
                }}
            />
            {loadingScoreAggs && (
                <ActivityIndicator
                    size="small"
                    color={Colors.Primary2}
                    style={styles.loader}
                />
            )}
            <View style={styles.trackingHistoryContainer}>
                <Text style={styles.trackingHistoryTitle}>Lucive Tracking History</Text>
                <Text style={styles.selectedDateText}>{selectedDate}</Text>
                <View style={styles.intervalScoresContainer}>
                    {intervalScores.map((score, index) => (
                        <View
                            key={index}
                            style={[
                                styles.intervalScorePoint,
                                { backgroundColor: getBackgroundColor(score), width: intervalWidth },
                            ]}
                        />
                    ))}
                </View>
            </View>
            {/* <View style={styles.lineGraphContainer}>
                <View style={styles.lineGraph}>
                    {intervalScores.map((score, index) => (
                        <View
                            key={index}
                            style={[
                                styles.lineGraphPoint,
                                { bottom: score.points, left: index * intervalWidth, width: intervalWidth, height: intervalWidth },
                            ]}
                        />
                    ))}
                </View>
            </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Background1,
    },
    streakContainer: {
        flexDirection: 'row',
    },
    totalScoreContainer: {
        paddingTop: 20,
        backgroundColor: Colors.Background1,
        alignItems: 'center',
    },
    totalScoreText: {
        fontSize: 20,
        color: Colors.Text1,
        fontWeight: 'bold',
    },
    infoIcon: {
        marginLeft: 10,
    },
    lastUpdatedContainer: {
        padding: 20,
        alignItems: 'center',
    },
    lastUpdatedText: {
        fontSize: 16,
        color: Colors.Text2,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -10,
        marginLeft: -10,
    },
    trackingHistoryContainer: {
        padding: 20,
        alignItems: 'center',
    },
    trackingHistoryTitle: {
        fontSize: 20,
        color: Colors.Text1,
        fontWeight: 'bold',
    },
    selectedDateText: {
        fontSize: 16,
        color: Colors.Text1,
        marginTop: 10,
    },
    intervalScoresContainer: {
        flexDirection: 'row',
        marginTop: 10,
        width: '100%',
        justifyContent: 'center',
        marginHorizontal: 20, // Add margin to the container of the strip
    },
    intervalScorePoint: {
        height: 10,
        borderRadius: 5,
    },
    lineGraphContainer: {
        height: 200,
        marginTop: 20,
        position: 'relative',
    },
    lineGraph: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
    },
    lineGraphPoint: {
        position: 'absolute',
        backgroundColor: Colors.Accent1,
    },
});

export default ScoresScreen;