import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

const CustomText: React.FC<TextProps> = (props) => {
    return (
        <Text style={[props.style, styles.customFontText]} {...props}>
            {props.children}
        </Text>
    );
};

const styles = StyleSheet.create({
    customFontText: {
        fontFamily: 'monospace', // Use the font family name here
    },
});

export default CustomText;