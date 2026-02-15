import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Green pulsing rings around the bot avatar to indicate listening.
 * Similar to SpeakingAnimation but with different color/timing.
 */
export default function ListeningAnimation({ size = 46, active = false }) {
    const pulse1 = useRef(new Animated.Value(0)).current;
    const pulse2 = useRef(new Animated.Value(0)).current;
    const pulse3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!active) {
            pulse1.setValue(0);
            pulse2.setValue(0);
            pulse3.setValue(0);
            return;
        }

        const createPulse = (val, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(val, {
                        toValue: 1,
                        duration: 1500,
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
        const a2 = createPulse(pulse2, 500);
        const a3 = createPulse(pulse3, 1000);

        a1.start();
        a2.start();
        a3.start();

        return () => {
            a1.stop();
            a2.stop();
            a3.stop();
        };
    }, [active]);

    const ringStyle = (pulse) => ({
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: COLORS.success,
        opacity: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 0],
        }),
        transform: [
            {
                scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.6],
                }),
            },
        ],
    });

    if (!active) return null;

    return (
        <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
            <Animated.View style={ringStyle(pulse1)} />
            <Animated.View style={ringStyle(pulse2)} />
            <Animated.View style={ringStyle(pulse3)} />
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
