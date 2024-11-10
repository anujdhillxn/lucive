import React from 'react';
import { Text, StyleSheet, Linking, View } from 'react-native';
import Colors from '../styles/colors';

const FooterText: React.FC = () => {
    const handleLinkPress = () => {
        Linking.openURL('https://anujdhillxn.github.io');
    };

    return (
        <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
                Created by <Text style={styles.link} onPress={handleLinkPress}>anujdhillxn</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    footerContainer: {
        bottom: 0,
        width: '100%',
        position: 'absolute',
        padding: 10,
    },
    footerText: {
        marginLeft: '50%',
        transform: [{ translateX: -50 }],
        color: Colors.Text3,
    },
    link: {
        color: Colors.Primary1,
    },
});

export default FooterText;