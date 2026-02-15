import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';

export default function MessageBubble({ message }) {
    const isUser = message.sender === 'user';

    return (
        <View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.botContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.botBubble,
                    isUser ? SHADOWS.small : null,
                ]}
            >
                <Text style={[styles.text, isUser && styles.userText]}>
                    {message.text}
                </Text>
                <Text style={[styles.time, isUser && styles.userTime]}>
                    {message.time || ''}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 3,
        paddingHorizontal: SPACING.md,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    botContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '78%',
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        borderRadius: RADIUS.lg,
    },
    userBubble: {
        backgroundColor: COLORS.messageUserBg,
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: COLORS.messageBotBg,
        borderBottomLeftRadius: 4,
    },
    text: {
        color: COLORS.text,
        fontSize: 15,
        lineHeight: 21,
    },
    userText: {
        color: COLORS.white,
    },
    time: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTime: {
        color: 'rgba(255,255,255,0.6)',
    },
});
