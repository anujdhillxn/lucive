import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Separator from './Separator';

export type HeaderProps = {
    menuVisible: boolean;
    toggleMenu: () => void;
    itemCount: number;
};

interface MenuProps {
    Header: (props: HeaderProps) => React.ReactNode;
    Components: (() => React.ReactNode)[];
    openedInitially?: boolean
}

export const HideableView: React.FC<MenuProps> = ({ Header, Components, openedInitially }) => {
    const [menuVisible, setMenuVisible] = useState(openedInitially || false);

    // Ensure animations array always reflects the number of Components
    const animations = useMemo(() => Components.map(() => new Animated.Value(0)), [Components]);

    const toggleMenu = () => {
        setMenuVisible((prev) => !prev);
    };

    useEffect(() => {
        const animationsArray = animations.map((anim: any) =>
            Animated.timing(anim, {
                toValue: menuVisible ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            })
        );

        // Use staggered animation based on menu visibility
        Animated.stagger(100, menuVisible ? animationsArray : [...animationsArray].reverse()).start();
    }, [menuVisible, animations]);

    return (
        <View>
            <Header menuVisible={menuVisible} toggleMenu={toggleMenu} itemCount={Components.length} />
            {menuVisible && <View style={styles.menu}>
                {Components.map((Component, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.menuItem,
                            {
                                opacity: animations[index],
                                transform: [
                                    {
                                        scale: animations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.9, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Component />
                    </Animated.View>
                ))}
            </View>}
        </View>
    );
};


const styles = StyleSheet.create({
    menu: {
        overflow: 'hidden',
    },
    menuItem: {
        marginBottom: 10,
    },
});