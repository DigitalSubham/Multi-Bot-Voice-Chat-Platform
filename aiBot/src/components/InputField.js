import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';

export default function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    autoCapitalize = 'none',
    style,
    inputStyle,
}) {
    return (
        <View style={[styles.container, style]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    multiline && { height: numberOfLines * 24 + 24 },
                    inputStyle,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 11,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: 15,
    },
    multiline: {
        textAlignVertical: 'top',
        paddingTop: 14,
    },
});
