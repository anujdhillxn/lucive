import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import Colors from '../styles/colors';

interface CustomButtonProps {
    onPress: () => void | Promise<void>;
    children: React.ReactNode;
    style?: object;
    activityIndicatorColor?: string;
    isDisabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = (props: CustomButtonProps) => {

    const [isPressed, setIsPressed] = React.useState(false);

    const onPress = async () => {
        setIsPressed(true);
        await props.onPress();
        setIsPressed(false);
    }

    return (
        <TouchableOpacity style={[props.style || defaultStyles]} disabled={props.isDisabled} onPress={onPress}>
            {isPressed ? <ActivityIndicator style={defaultStyles.loader} color={props.activityIndicatorColor || Colors.Text1} /> : props.children}
        </TouchableOpacity>
    );
};

interface CustomButtonTextProps {
    title: string;
    onPress: () => void | Promise<void>;
    backgroundColor?: string;
    textColor?: string;
    isDisabled?: boolean;
}

export const CustomTextButton: React.FC<CustomButtonTextProps> = (props: CustomButtonTextProps) => {
    return <CustomButton style={[textButtonStyles.button, props.isDisabled && textButtonStyles.disabledButton]} onPress={props.onPress} isDisabled={props.isDisabled}>
        <Text style={[textButtonStyles.buttonText, props.isDisabled && textButtonStyles.disabledButtonText]}>{props.title}</Text>
    </CustomButton>
}

const defaultStyles = StyleSheet.create({
    button: {
        backgroundColor: Colors.Primary1,
        padding: 10,
    },
    loader: {
        marginLeft: 10,
    },
});

const textButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: Colors.Primary1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: Colors.Text1,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: Colors.Text1,
    },
    disabledButtonText: {
        color: Colors.Text3,
    }
})