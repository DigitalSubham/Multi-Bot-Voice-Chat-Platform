import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../constants/theme';

export default function BotAvatar({ name, color, size = 48 }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const bgColor = color || COLORS.primary;

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: bgColor,
                },
            ]}
        >
            <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initial: {
        color: COLORS.white,
        fontWeight: '700',
    },
});
