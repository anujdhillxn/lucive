import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Color from '../styles/colors';
import { HeaderProps } from './HideableView';
import Colors from '../styles/colors';
export type RuleHeaderProps = {
    title: string;
    itemCount: number;
    menuVisible: boolean;
    toggleMenu: () => void;
};

const RuleHeader: React.FC<RuleHeaderProps> = ({ title, menuVisible, toggleMenu, itemCount }) => {

    const arrowRotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(arrowRotation, {
            toValue: menuVisible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [menuVisible]);

    const rotation = arrowRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuButtonText}>{`${title} (${itemCount})`}</Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Icon
                name="keyboard-arrow-right"
                size={24}
                color={Color.Text1}
            />
        </Animated.View>
    </TouchableOpacity>;
}

export const MyRulesHeaderRenderer: React.FC<HeaderProps> = (props: HeaderProps) => (
    <RuleHeader menuVisible={props.menuVisible} toggleMenu={props.toggleMenu} itemCount={props.itemCount} title={props.title} />
);

export const PartnerRulesHeaderRenderer: React.FC<HeaderProps> = (props: HeaderProps) => (
    <RuleHeader menuVisible={props.menuVisible} toggleMenu={props.toggleMenu} itemCount={props.itemCount} title={props.title} />
);

const styles = StyleSheet.create({
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.Primary1,
    },
    menuButtonText: {
        color: Colors.Text1,
        fontSize: 16,
        fontWeight: 'bold',
    }
});