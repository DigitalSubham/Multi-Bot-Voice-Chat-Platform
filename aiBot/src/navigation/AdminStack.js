import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import CreateBotScreen from '../screens/admin/CreateBotScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
    const { logout } = useAuth();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.text,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: COLORS.background },
                headerTitleStyle: { fontWeight: '600', fontSize: 17 },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{
                    title: 'Admin Dashboard',
                    headerRight: () => (
                        <TouchableOpacity onPress={logout} style={{ paddingHorizontal: SPACING.sm }}>
                            <Text style={{ color: COLORS.accent, fontWeight: '600', fontSize: 14 }}>
                                Logout
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="CreateBot"
                component={CreateBotScreen}
                options={({ route }) => ({
                    title: route.params?.bot ? 'Edit Bot' : 'Create Bot',
                })}
            />
        </Stack.Navigator>
    );
}
