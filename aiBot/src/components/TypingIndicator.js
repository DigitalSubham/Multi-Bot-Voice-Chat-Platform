import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export default function TypingIndicator() {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnimation = (dot, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );

        const anim1 = createAnimation(dot1, 0);
        const anim2 = createAnimation(dot2, 150);
        const anim3 = createAnimation(dot3, 300);

        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, []);

    const getDotStyle = (dot) => ({
        transform: [
            {
                translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                }),
            },
        ],
        opacity: dot.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
        }),
    });

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
                <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
                <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        paddingHorizontal: SPACING.md,
        marginVertical: 4,
    },
    bubble: {
        flexDirection: 'row',
        backgroundColor: COLORS.messageBotBg,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        gap: 5,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
});
