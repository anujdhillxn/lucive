import React, { useState } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Using React Native Picker
import ModalPicker from 'react-native-modal';
import Colors from '../styles/colors';
import CustomText from './CustomText';

export type CustomTimePickerProps = {
    hideHours?: boolean;
    hideMinutes?: boolean;
    onConfirm: (hour: string, minute: string) => void;
    children: React.ReactNode;
    editable?: boolean;
}

const CustomTimePicker = (props: CustomTimePickerProps) => {
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [selectedHour, setSelectedHour] = useState('00');
    const [selectedMinute, setSelectedMinute] = useState('01');

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

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
            <TouchableOpacity onPress={showPicker} disabled={!props.editable}>
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
                    <View style={styles.selectorLabel}>
                        {!Boolean(props.hideHours) && <Picker
                            selectedValue={selectedHour}
                            style={styles.picker}
                            onValueChange={(itemValue) => {
                                setSelectedHour(itemValue)
                                if (itemValue === '00' && selectedMinute === '00') {
                                    setSelectedMinute('01')
                                }
                            }}
                        >
                            {hours.map((hour) => (
                                <Picker.Item key={hour} label={hour} value={hour} />
                            ))}
                        </Picker>}
                        <Text style={styles.labelText}>H</Text>
                    </View>
                    {/* Minutes Picker */}
                    <View style={styles.selectorLabel}>
                        {!Boolean(props.hideMinutes) && <Picker
                            selectedValue={selectedMinute}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                        >
                            {(selectedHour === '00' ? minutes.filter(minute => minute !== '00') : minutes).map((minute) => (
                                <Picker.Item key={minute} label={minute} value={minute} />
                            ))}
                        </Picker>}
                        <Text style={styles.labelText}>M</Text>
                    </View>
                    {/* Confirm Button */}
                    <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                        <CustomText style={styles.confirmText}>Confirm</CustomText>
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
    picker: {
        width: 100,
    },
    modalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: Colors.Accent1,
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
    selectorLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    labelText: {
        fontSize: 18,
    }
});

export default CustomTimePicker;
