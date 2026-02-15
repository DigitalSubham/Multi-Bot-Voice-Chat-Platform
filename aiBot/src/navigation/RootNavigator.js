import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import UserStack from './UserStack';
import { COLORS } from '../constants/theme';

export default function RootNavigator() {
    const { user, role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: COLORS.primary,
                    background: COLORS.background,
                    card: COLORS.surface,
                    text: COLORS.text,
                    border: COLORS.border,
                    notification: COLORS.accent,
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' },
                    medium: { fontFamily: 'System', fontWeight: '500' },
                    bold: { fontFamily: 'System', fontWeight: '700' },
                    heavy: { fontFamily: 'System', fontWeight: '800' },
                },
            }}
        >
            {!user ? (
                <AuthStack />
            ) : role === 'admin' ? (
                <AdminStack />
            ) : (
                <UserStack />
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
