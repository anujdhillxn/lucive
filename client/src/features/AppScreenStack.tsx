import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import SignupScreen from './BeforeLogin/SignupScreen';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useAppContext } from '../hooks/useAppContext';
import RulesScreen from './AfterLogin/Rules/RulesScreen';
import UserScreen from './AfterLogin/User/UserScreen';
import { RuleCreatorScreen } from './AfterLogin/Rules/RuleCreatorScreen';
import LoginScreen from './BeforeLogin/LoginScreen';
import { Rule } from '../types/state';
import LoadingScreen from './LoadingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActions } from '../hooks/useActions';
import Colors from '../styles/colors';
import ScoresScreen from './AfterLogin/Scores/ScoresScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import VerticalSeparator from '../components/VerticalSeparator';
import { useNativeContext } from '../hooks/useNativeContext';
import { PermissionsScreen } from './AfterLogin/PermissionsScreen';
const Stack = createStackNavigator();
export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    User: undefined;
    Rules: undefined;
    RuleCreator: Rule | undefined;
    Duo: undefined;
    Scores: undefined;
};


export const AppScreenStack: React.FC = () => {

    const { user, myDuo, appLoading } = useAppContext();
    const { fetchData } = useActions();
    const hasCreatedRule = useAppContext().rules.filter(rule => rule.isMyRule).length > 0;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { permissions } = useNativeContext();
    if (appLoading) {
        return <LoadingScreen />
    }
    if (!permissions.hasUsageStatsPermission || !permissions.hasOverlayPermission) {
        return <PermissionsScreen />
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

    if (!myDuo) {
        return <SafeAreaView style={styles.container}>
            <Stack.Navigator initialRouteName={"User"} >
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
            </Stack.Navigator>
        </SafeAreaView>
    }
    return <View style={styles.container}>
        <Stack.Navigator initialRouteName={hasCreatedRule ? "Rules" : "RuleCreator"}
            screenOptions={{
                cardStyle: { backgroundColor: Colors.Background1 }, // Set the background color of the card during transition
                ...TransitionPresets.SlideFromRightIOS, // Use a transition preset
            }}>
            <Stack.Screen
                name="Rules"
                component={RulesScreen}
                options={() => ({
                    title: 'Lucive',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={fetchData}>
                                <Icon name="sync" size={24} solid={false} color={Colors.Text1} style={{ marginRight: 20 }} />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: {
                        backgroundColor: Colors.Primary2,
                    },
                    headerTintColor: Colors.Text1,

                })}
            />
            <Stack.Screen
                name="Scores"
                component={ScoresScreen}
                options={() => ({
                    title: 'Lucive',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={fetchData}>
                                <Icon name="sync" size={24} solid={false} color={Colors.Text1} style={{ marginRight: 20 }} />
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
                        headerRight: () => (
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={fetchData}>
                                    <Icon name="sync" size={24} solid={false} color={Colors.Text1} style={{ marginRight: 20 }} />
                                </TouchableOpacity>
                            </View>
                        ),
                    }
                )
            } />
            <Stack.Screen name="RuleCreator" component={RuleCreatorScreen} options={
                ({ route }) => ({
                    title: route.params ? `Edit ${(route.params as Rule).appDisplayName}'s rule` : (hasCreatedRule ? 'Create New Rule' : 'Create Your First Rule'), headerStyle: {
                        backgroundColor: Colors.Primary2,
                    },
                    headerTintColor: Colors.Text1,
                })
            } />
        </Stack.Navigator>
        <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Rules')}>
                <Icon name="list" size={24} color={Colors.Text3} />
            </TouchableOpacity>
            <VerticalSeparator />
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Scores')}>
                <Icon name="trophy" size={24} color={Colors.Text3} />
            </TouchableOpacity>
            <VerticalSeparator />
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('User')}>
                <Icon name="user" size={24} solid={false} color={Colors.Text3} style={{ marginRight: 20 }} />
            </TouchableOpacity>
        </View>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 5,
        backgroundColor: Colors.Background1,
    },
    button: {
        padding: 10,
    },
});
