import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../styles/colors';

const Separator: React.FC = () => {
    return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
    separator: {
        marginVertical: 10,
        height: 1,
        backgroundColor: Colors.Text3,
        alignSelf: 'stretch',
    },
});

export default Separator;