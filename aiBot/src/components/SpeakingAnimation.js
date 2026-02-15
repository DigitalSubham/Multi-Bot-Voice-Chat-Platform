import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/**
 * Pulsing ring animation around the bot avatar to indicate speaking.
 *
 * Props:
 *   color  – accent color for the rings
 *   size   – diameter of the avatar (rings expand beyond this)
 *   active – whether the animation is playing
 */
export default function SpeakingAnimation({ color = '#6C63FF', size = 48, active = false }) {
    const pulse1 = useRef(new Animated.Value(0)).current;
    const pulse2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!active) {
            pulse1.setValue(0);
            pulse2.setValue(0);
            return;
        }

        const createPulse = (val, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(val, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(val, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );

        const a1 = createPulse(pulse1, 0);
        const a2 = createPulse(pulse2, 400);
        a1.start();
        a2.start();

        return () => {
            a1.stop();
            a2.stop();
        };
    }, [active]);

    const ringStyle = (pulse) => ({
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        opacity: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 0],
        }),
        transform: [
            {
                scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.8],
                }),
            },
        ],
    });

    if (!active) return null;

    return (
        <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
            <Animated.View style={ringStyle(pulse1)} />
            <Animated.View style={ringStyle(pulse2)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
