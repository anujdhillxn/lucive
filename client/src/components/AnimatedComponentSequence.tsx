import * as React from 'react';
import { Animated, View } from 'react-native';

interface AnimatedSequenceProps {
    children: React.ReactNode[];
}

export const AnimatedSequence: React.FC<AnimatedSequenceProps> = ({ children }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const animateComponent = () => {
            // Fade in and reset translateY to 0
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // After fade-in, move downwards slightly
                Animated.timing(translateY, {
                    toValue: 20, // Moves the element 10 units downwards
                    duration: 5000,
                    useNativeDriver: true,
                }).start(() => {
                    // Fade out and reset translateY to 0 for the next iteration
                    Animated.parallel([
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateY, {
                            toValue: 0, // Reset the position for the next child
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        // Move to the next component after fade out
                        const nextIndex = (currentIndex + 1) % children.length;
                        setCurrentIndex(nextIndex);
                    });
                });
            });
        };

        animateComponent(); // Start the animation

        return () => {
            opacity.setValue(0);
            translateY.setValue(0); // Reset translateY when component unmounts or re-renders
        };
    }, [currentIndex, opacity, translateY]);

    return (
        <View>
            <Animated.View
                style={{
                    opacity,
                    transform: [{ translateY }],
                }}
            >
                {children[currentIndex]}
            </Animated.View>
        </View>
    );
};