import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../styles/colors';

const VerticalSeparator = () => {
    return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
    separator: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
        backgroundColor: Colors.Text3,
        opacity: 0.5,
    },
});

export default VerticalSeparator;