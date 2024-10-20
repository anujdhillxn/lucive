import React from 'react';
import { View, StyleSheet } from 'react-native';

const Separator: React.FC = () => {
    return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
    separator: {
        marginVertical: 10,
        height: 1,
        backgroundColor: '#E0E0E0',
        alignSelf: 'stretch',
    },
});

export default Separator;