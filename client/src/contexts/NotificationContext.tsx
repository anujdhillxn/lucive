import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import Colors from '../styles/colors';
import messaging from '@react-native-firebase/messaging';
import { useApi } from '../hooks/useApi';
interface Notification {
    message: string;
    type: 'success' | 'failure';
}

interface NotificationContextProps {
    showNotification: (message: string, type: 'success' | 'failure') => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [slideAnim] = useState(new Animated.Value(300)); // Initial position off the screen to the right
    const { requestToken } = useApi();
    useEffect(() => {
        if (notifications.length > 0 && !currentNotification) {
            setCurrentNotification(notifications[0]);
            setNotifications((prev) => prev.slice(1));
        }
    }, [notifications, currentNotification]);

    useEffect(() => {
        if (currentNotification) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(slideAnim, {
                        toValue: 300,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        setCurrentNotification(null);
                        slideAnim.setValue(300); // Reset position for next notification
                    });
                }, 3000); // Show for 3 seconds
            });
        }
    }, [currentNotification, slideAnim]);

    const showNotification = (message: string, type: 'success' | 'failure') => {
        setNotifications((prev) => [...prev, { message, type }]);
    };
    const { api } = useApi();

    useEffect(() => {
        messaging().getToken().then(api.userApi.setFCMToken);
        const unsubscribe = messaging().onTokenRefresh(api.userApi.setFCMToken);
        return unsubscribe;
    }, [requestToken]);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            showNotification(remoteMessage.notification?.body || 'New notification', 'success');
        });
        return unsubscribe;
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {currentNotification && (
                <View style={styles.safeArea}>
                    <Animated.View style={[styles.notification, styles[currentNotification.type], { transform: [{ translateX: slideAnim }] }]}>
                        <Text style={styles.notificationText}>{currentNotification.message}</Text>
                    </Animated.View>
                </View>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 1000,
    },
    notification: {
        padding: 15,
        alignItems: 'center',
        borderRadius: 5,
        margin: 10,
    },
    success: {
        backgroundColor: Colors.Accent1, // Green background for success
    },
    failure: {
        backgroundColor: Colors.Danger, // Red background for failure
    },
    notificationText: {
        color: Colors.Text1,
        fontSize: 16,
    },
});