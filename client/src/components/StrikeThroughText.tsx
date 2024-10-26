import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

type StrikeThroughTextProps = {
    old: string;
    new: string;
    changed: boolean;
};

const StrikeThroughText: React.FC<StrikeThroughTextProps> = ({ old, new: newText, changed }) => {
    return (
        <>
            {changed ? (
                <>
                    <Text style={styles.strikethroughText}>{old}</Text>
                    <Text> {newText}</Text>
                </>
            ) : (
                <Text>{old}</Text>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strikethroughText: {
        textDecorationLine: 'line-through',
    }
});

export default StrikeThroughText;