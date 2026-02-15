import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const PRESET_COLORS = [
    '#6C63FF', '#FF6584', '#43E97B', '#F7971E',
    '#00C9FF', '#FC5C7D', '#A18CD1', '#FF9A9E',
    '#667EEA', '#764BA2', '#F093FB', '#4FACFE',
];

export default function ColorPicker({ selected, onSelect }) {
    return (
        <View style={styles.grid}>
            {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                    key={color}
                    onPress={() => onSelect(color)}
                    activeOpacity={0.7}
                    style={[
                        styles.swatch,
                        { backgroundColor: color },
                        selected === color && styles.selected,
                        selected === color && { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
                    ]}
                >
                    {selected === color && <View style={styles.check} />}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginVertical: SPACING.sm,
    },
    swatch: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selected: {
        borderWidth: 2.5,
        borderColor: COLORS.white,
    },
    check: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
});
