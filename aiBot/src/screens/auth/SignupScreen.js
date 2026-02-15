import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme';

const ROLES = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
];

export default function SignupScreen({ navigation }) {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [showRolePicker, setShowRolePicker] = useState(false);

    const handleSignup = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await signup(email.trim(), password, role);
            Alert.alert('Success', 'Account created! Please sign in.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || 'Signup failed';
            Alert.alert('Signup Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const selectedLabel = ROLES.find((r) => r.value === role)?.label || 'User';

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>✨</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join the AI Chat platform
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <InputField
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                        />
                        <InputField
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />

                        {/* Role Selector */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>ROLE</Text>
                            <TouchableOpacity
                                style={styles.roleSelector}
                                onPress={() => setShowRolePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.roleSelectorText}>{selectedLabel}</Text>
                                <Text style={styles.chevron}>▼</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.link}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Role Picker Modal */}
            <Modal
                visible={showRolePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRolePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowRolePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Role</Text>
                        {ROLES.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={[
                                    styles.roleOption,
                                    role === item.value && styles.roleOptionSelected,
                                ]}
                                onPress={() => {
                                    setRole(item.value);
                                    setShowRolePicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.roleOptionText,
                                        role === item.value && styles.roleOptionTextSelected,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {role === item.value && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: { flex: 1 },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logo: {
        fontSize: 56,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 32,
        color: COLORS.text,
        fontWeight: '800',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.medium,
    },
    fieldContainer: {
        marginBottom: SPACING.md,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 11,
        fontWeight: '600',
    },
    roleSelector: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roleSelectorText: {
        color: COLORS.text,
        fontSize: 15,
    },
    chevron: {
        color: COLORS.textMuted,
        fontSize: 10,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: SPACING.sm,
        ...SHADOWS.glow,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.lg,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    link: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        width: '75%',
        ...SHADOWS.medium,
    },
    modalTitle: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.xs,
    },
    roleOptionSelected: {
        backgroundColor: COLORS.primaryDark + '30',
    },
    roleOptionText: {
        color: COLORS.text,
        fontSize: 16,
    },
    roleOptionTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    checkmark: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: '700',
    },
});
