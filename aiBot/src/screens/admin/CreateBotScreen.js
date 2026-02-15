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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/axiosInstance';
import InputField from '../../components/InputField';
import ColorPicker from '../../components/ColorPicker';
import BotAvatar from '../../components/BotAvatar';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function CreateBotScreen({ navigation, route }) {
    const editBot = route.params?.bot;
    const isEditing = !!editBot;

    const [name, setName] = useState(editBot?.name || '');
    const [personalityPrompt, setPersonalityPrompt] = useState(editBot?.personality_prompt || '');
    const [knowledge, setKnowledge] = useState(editBot?.knowledge_base || '');
    const [avatarColor, setAvatarColor] = useState(editBot?.avatarColor || '#6C63FF');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Bot name is required.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: name.trim(),
                personality_prompt: personalityPrompt.trim(),
                knowledge_base: knowledge.trim(),
                avatarColor,
            };

            if (isEditing) {
                await api.put(`/bots/${editBot._id || editBot.id}`, payload);
                Alert.alert('Success', 'Bot updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                await api.post('/bots', payload);
                Alert.alert('Success', 'Bot created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || `Failed to ${isEditing ? 'update' : 'create'} bot`;
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Preview */}
                    <View style={styles.preview}>
                        <BotAvatar name={name || '?'} color={avatarColor} size={72} />
                        <Text style={styles.previewName}>{name || 'Bot Name'}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <InputField
                            label="Bot Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Coach, Tutor, Therapist"
                        />

                        <InputField
                            label="Personality Prompt"
                            value={personalityPrompt}
                            onChangeText={setPersonalityPrompt}
                            placeholder="Describe the bot's personality and behavior..."
                            multiline
                            numberOfLines={4}
                        />

                        <InputField
                            label="Knowledge Base"
                            value={knowledge}
                            onChangeText={setKnowledge}
                            placeholder="Paste or type any knowledge the bot should have..."
                            multiline
                            numberOfLines={5}
                        />

                        <View style={styles.colorSection}>
                            <Text style={styles.label}>AVATAR COLOR</Text>
                            <ColorPicker selected={avatarColor} onSelect={setAvatarColor} />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isEditing ? 'Update Bot' : 'Create Bot'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    preview: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingVertical: SPACING.lg,
    },
    previewName: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '600',
        marginTop: SPACING.sm,
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.medium,
    },
    colorSection: {
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
});
