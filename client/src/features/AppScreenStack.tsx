import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SignupScreen from './BeforeLogin/SignupScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
import { MenuProvider } from 'react-native-popup-menu';
import { useAppContext } from '../hooks/useAppContext';
import HomeScreen from './AfterLogin/HomeScreen';
import UserScreen from './AfterLogin/User/UserScreen';
import { RuleCreatorScreen } from './AfterLogin/Rules/RuleCreatorScreen';
import DuoScreen from './AfterLogin/Duo/DuoScreen';
import RuleEditorScreen from './AfterLogin/Rules/RuleEditorScreen';
import LoginScreen from './BeforeLogin/LoginScreen';
import { Rule, RuleType } from '../types/state';

const Stack = createStackNavigator();
export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    User: undefined;
    Home: undefined;
    RuleCreator: undefined;
    RuleEditor: Rule<RuleType>;
    Duo: undefined;
};


export const AppScreenStack: React.FC = () => {

    const { user } = useAppContext();

    return <View style={styles.container}>
        {user ? <Stack.Navigator initialRouteName={"Home"}>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Duo')}>
                                <Icon5 name="user-friends" size={30} color="#000" style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('User')}>
                                <Icon name="user" size={30} color="#000" style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    ),
                })}
            />
            <Stack.Screen name="User" component={UserScreen} />
            <Stack.Screen name="RuleCreator" component={RuleCreatorScreen} />
            <Stack.Screen name="Duo" component={DuoScreen} />
            <Stack.Screen name="RuleEditor" component={RuleEditorScreen} />
        </Stack.Navigator> : <Stack.Navigator initialRouteName={"Login"} >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>}

        <StatusBar style="auto" />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    navigatorContainer: {
        flex: 1,
    },
});
