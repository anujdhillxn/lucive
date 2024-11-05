// PermissionsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { NativeModules } from 'react-native';
import { useAppContext } from '../../hooks/useAppContext';
import { useActions } from '../../hooks/useActions';
import { useNativeContext } from '../../hooks/useNativeContext';
const { PermissionsModule } = NativeModules;

export const PermissionsScreen: React.FC = () => {
    const { permissions, requestOverlayPermission, requestUsageStatsPermission, checkPermissions } = useNativeContext();

    React.useEffect(() => {
        const timeout = setInterval(checkPermissions, 1000);
        return () => {
            clearInterval(timeout);
        };
    }, []);

    if (permissions.hasUsageStatsPermission !== true) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    {permissions.hasUsageStatsPermission === undefined ? "Checking for usage stats permissions..." : permissions.hasUsageStatsPermission === false
                        ? "Lucive needs Usage Stats Permissions to monitor your screentime. Please enable them to continue."
                        : null}
                </Text>
                {permissions.hasUsageStatsPermission === false && (
                    <Button title="Grant Usage Stats Permission" onPress={() => requestUsageStatsPermission()} />
                )}
            </View>
        );
    }

    if (permissions.hasOverlayPermission !== true) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    {permissions.hasOverlayPermission === undefined ? "Checking for overlay permissions..." : permissions.hasOverlayPermission === false
                        ? "Lucive needs Overlay Permissions to show you the screen time limit. Please enable them to continue." : null}
                </Text>
                {permissions.hasOverlayPermission === false && (
                    <Button title="Grant Overlay Permissions" onPress={() => requestOverlayPermission()} />
                )}
            </View>
        );
    }
    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
        marginTop: 20,
        textAlign: 'center',
    },
});
