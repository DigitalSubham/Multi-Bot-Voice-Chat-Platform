import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BotListScreen from '../screens/user/BotListScreen';
import ChatScreen from '../screens/user/ChatScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function UserStack() {
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
                name="BotList"
                component={BotListScreen}
                options={{
                    title: 'AI Bots',
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
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                    // headerShown: false,
                    title: route.params?.bot?.name || 'Chat',
                })}
            />
        </Stack.Navigator>
    );
}
