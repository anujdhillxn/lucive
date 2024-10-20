import React, { useState } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Using React Native Picker
import ModalPicker from 'react-native-modal';

export type CustomTimePickerProps = {
    hideHours?: boolean;
    hideMinutes?: boolean;
    onConfirm: (hour: string, minute: string) => void;
    children: React.ReactNode;
}

const CustomTimePicker = (props: CustomTimePickerProps) => {
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [selectedHour, setSelectedHour] = useState('00');
    const [selectedMinute, setSelectedMinute] = useState('00');

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')); // "00" to "23"
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')); // "00" to "59"

    const showPicker = () => {
        setPickerVisible(true);
    };

    const hidePicker = () => {
        setPickerVisible(false);
    };

    const handleConfirm = () => {
        hidePicker();
        props.onConfirm(selectedHour, selectedMinute);
    };

    return (
        <View >
            <TouchableOpacity onPress={showPicker}>
                {props.children}
            </TouchableOpacity>
            {/* Custom Modal Picker */}
            <ModalPicker
                isVisible={isPickerVisible}
                onBackdropPress={hidePicker}
                style={styles.modalStyle}
            >
                <View style={styles.pickerContainer}>
                    {/* Hours Picker */}
                    <View style={styles.pickersContainer}>
                        {!Boolean(props.hideHours) && <Picker
                            selectedValue={selectedHour}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedHour(itemValue)}
                        >
                            {hours.map((hour) => (
                                <Picker.Item key={hour} label={hour} value={hour} />
                            ))}
                        </Picker>}

                        {/* Minutes Picker */}
                        {!Boolean(props.hideMinutes) && <Picker
                            selectedValue={selectedMinute}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                        >
                            {minutes.map((minute) => (
                                <Picker.Item key={minute} label={minute} value={minute} />
                            ))}
                        </Picker>}
                    </View>
                    {/* Confirm Button */}
                    <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                        <Text style={styles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </ModalPicker>
        </View>
    );
};

const styles = StyleSheet.create({
    selectedTime: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    pickersContainer: {

        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    picker: {
        width: 100,
    },
    modalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        alignSelf: 'center',
    },
});

export default CustomTimePicker;
