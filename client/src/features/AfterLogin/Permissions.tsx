// PermissionsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { NativeModules } from 'react-native';
import { useAppContext } from '../../hooks/useAppContext';
import { useActions } from '../../hooks/useActions';

const { PermissionsModule } = NativeModules;

export const PermissionsScreen: React.FC = () => {
    const { permissions } = useAppContext();
    const { setPermissions } = useActions();

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        const hasUsageStatsPermission = await PermissionsModule.hasUsageStatsPermission();
        setPermissions((current) => { return { ...current, hasUsageStatsPermission } });
        const hasOverlayPermission = await PermissionsModule.hasOverlayPermission();
        setPermissions((current) => { return { ...current, hasOverlayPermission } });
        const hasAccessibilityPermission = await PermissionsModule.hasAccessibilityPermission();
        setPermissions((current) => { return { ...current, hasAccessibilityPermission } });
    };

    const handleRequestUsageStatsPermission = async () => {
        const hasUsageStatsPermission = await PermissionsModule.requestUsageStatsPermission();
        setPermissions((current) => { return { ...current, hasUsageStatsPermission } });
    };

    const handleRequestOverlayPermission = async () => {
        const hasOverlayPermission = await PermissionsModule.requestOverlayPermission();
        setPermissions((current) => { return { ...current, hasOverlayPermission } });
    };

    const handleRequestAccessibilityPermission = async () => {
        const hasAccessibilityPermission = await PermissionsModule.requestAccessibilityPermission();
        setPermissions((current) => { return { ...current, hasAccessibilityPermission } });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {permissions.hasUsageStatsPermission === false
                    ? "Zenvia needs Usage Stats Permissions to monitor your screentime. Please enable them to continue."
                    : "Checking for usage stats permissions..."}
            </Text>
            {permissions.hasUsageStatsPermission === false && (
                <Button title="Grant Usage Stats Permission" onPress={handleRequestUsageStatsPermission} />
            )}
            <Text style={styles.title}>
                {permissions.hasOverlayPermission === false
                    ? "Zenvia needs Overlay Permissions to prevent you from excess screentime. Please enable them to continue."
                    : "Checking for overlay permissions..."}
            </Text>
            {permissions.hasOverlayPermission === false && (
                <Button title="Grant Overlay Permissions" onPress={handleRequestOverlayPermission} />
            )}
            <Text style={styles.title}>
                {permissions.hasAccessibilityPermission === false
                    ? "Zenvia needs Accessibility Permissions to monitor your app usage. Please enable them to continue."
                    : "Checking for accessibility permissions..."}
            </Text>
            {permissions.hasAccessibilityPermission === false && (
                <Button title="Grant Accessibility Permissions" onPress={handleRequestAccessibilityPermission} />
            )}
        </View>
    );
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
        textAlign: 'center',
    },
});
