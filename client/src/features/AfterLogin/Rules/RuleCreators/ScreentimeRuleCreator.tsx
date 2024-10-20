import React, { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomTimePicker from "../../../../components/CustomTimePicker";
import { ScreenTimeRuleDetails } from "../../../../types/state";

export type ScreentimeRuleCreatorProps = {
    onSave: (details: ScreenTimeRuleDetails) => void;
    initialDetails?: ScreenTimeRuleDetails;
};

export const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const secondsLeft = totalSeconds % 3600;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = Math.trunc(secondsLeft % 60);
    let formattedTime = '';

    if (hours > 0) {
        formattedTime += `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    if (minutes > 0) {
        if (formattedTime) {
            formattedTime += ', ';
        }
        formattedTime += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    if (seconds > 0) {
        if (formattedTime) {
            formattedTime += ', ';
        }
        formattedTime += `${seconds} second${seconds > 1 ? 's' : ''}`;
    }

    return formattedTime || '0 seconds';
};

export const ScreenTimeRuleCreator = (props: ScreentimeRuleCreatorProps): React.ReactNode => {
    console.log(props.initialDetails);
    const [dailyMaxMinutes, setDailyMaxMinutes] = useState(props.initialDetails ? Math.floor(props.initialDetails.dailyMaxSeconds / 60) : 30);
    const [hourlyMaxMinutes, setHourlyMaxMinutes] = useState(props.initialDetails ? Math.floor(props.initialDetails.hourlyMaxSeconds / 60) : 5);
    const [dailyStartsAt, setStartsAt] = useState<Date>(props.initialDetails ? new Date(props.initialDetails.dailyStartsAt) : new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const handleSave = () => {
        props.onSave({ dailyMaxSeconds: dailyMaxMinutes * 60, hourlyMaxSeconds: hourlyMaxMinutes * 60, dailyStartsAt: dailyStartsAt.toISOString() });
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date: Date) => {
        setStartsAt(date);
        hideDatePicker();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Screen Time Details</Text>
            <TouchableOpacity onPress={showDatePicker} style={styles.touchable}>
                <Text style={styles.text}>Daily Limit Reset</Text>
                <Text style={styles.textSmall}>{dailyStartsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
            <Button title="Save" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1,
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
    text: {
        fontSize: 18,
    },
    textSmall: {
        fontSize: 16,
        color: '#777',
    }
});