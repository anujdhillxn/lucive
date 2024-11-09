import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import SignupScreen from './BeforeLogin/SignupScreen';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useAppContext } from '../hooks/useAppContext';
import HomeScreen from './AfterLogin/HomeScreen';
import UserScreen from './AfterLogin/User/UserScreen';
import { RuleCreatorScreen } from './AfterLogin/Rules/RuleCreatorScreen';
import LoginScreen from './BeforeLogin/LoginScreen';
import { Rule } from '../types/state';
import LoadingScreen from './LoadingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActions } from '../hooks/useActions';
import Colors from '../styles/colors';
const Stack = createStackNavigator();
export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    User: undefined;
    Home: undefined;
    RuleCreator: Rule | undefined;
    Duo: undefined;
};


export const AppScreenStack: React.FC = () => {

    const { user, myDuo, appLoading } = useAppContext();
    const { fetchData } = useActions();
    if (appLoading) {
        return <LoadingScreen />
    }
    if (!user) {
        return <SafeAreaView style={styles.container}>
            <Stack.Navigator initialRouteName={"Login"} >
                <Stack.Screen name="Login" component={LoginScreen} options={
                    () => (
                        {
                            headerShown: false

                        }
                    )
                } />
                <Stack.Screen name="Signup" component={SignupScreen} options={
                    () => (
                        {
                            title: 'Lucive', headerStyle: {
                                backgroundColor: Colors.Primary2,
                            },
                            headerTintColor: Colors.Text1,
                        }
                    )
                } />
            </Stack.Navigator>
        </SafeAreaView>
    }

    return <View style={styles.container}>
        <Stack.Navigator initialRouteName={user && myDuo ? "Home" : "User"}
            screenOptions={{
                cardStyle: { backgroundColor: Colors.Background1 }, // Set the background color of the card during transition
                ...TransitionPresets.SlideFromRightIOS, // Use a transition preset
            }}>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    title: 'Lucive',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={fetchData}>
                                <Icon name="sync" size={24} solid={false} color={Colors.Text1} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => navigation.navigate('User')}>
                                <Icon name="user" size={24} solid={false} color={Colors.Text1} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: {
                        backgroundColor: Colors.Primary2,
                    },
                    headerTintColor: Colors.Text1,

                })}
            />

            <Stack.Screen name="User" component={UserScreen} options={
                () => (
                    {
                        title: 'Lucive', headerStyle: {
                            backgroundColor: Colors.Primary2,
                        },
                        headerTintColor: Colors.Text1,
                    }
                )
            } />
            <Stack.Screen name="RuleCreator" component={RuleCreatorScreen} options={
                ({ route }) => ({
                    title: route.params ? 'Edit Rule' : 'Create Rule', headerStyle: {
                        backgroundColor: Colors.Primary2,
                    },
                    headerTintColor: Colors.Text1,
                })
            } />
        </Stack.Navigator></View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
