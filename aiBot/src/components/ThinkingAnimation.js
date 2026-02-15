import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Animated thinking indicator with three pulsing dots.
 */
export default function ThinkingAnimation({ size = 46, color = COLORS.primary, active = false }) {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (!active) {
            dot1.setValue(0.3);
            dot2.setValue(0.3);
            dot3.setValue(0.3);
            return;
        }

        const animate = (val, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(val, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(val, {
                        toValue: 0.3,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const a1 = animate(dot1, 0);
        const a2 = animate(dot2, 200);
        const a3 = animate(dot3, 400);

        a1.start();
        a2.start();
        a3.start();

        return () => {
            a1.stop();
            a2.stop();
            a3.stop();
        };
    }, [active]);

    if (!active) return null;

    const dotStyle = (animation) => ({
        width: size / 4,
        height: size / 4,
        borderRadius: size / 8,
        backgroundColor: color,
        marginHorizontal: size / 12,
        opacity: animation,
        transform: [{
            scale: animation.interpolate({
                inputRange: [0.3, 1],
                outputRange: [0.8, 1.2],
            })
        }]
    });

    return (
        <View style={styles.container}>
            <Animated.View style={dotStyle(dot1)} />
            <Animated.View style={dotStyle(dot2)} />
            <Animated.View style={dotStyle(dot3)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
