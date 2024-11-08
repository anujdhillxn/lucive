import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../styles/colors';

const LoadingScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.Primary1} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.Background1,
    },
});

export default LoadingScreen;