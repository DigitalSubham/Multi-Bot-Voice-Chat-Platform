import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axiosInstance';
import BotAvatar from '../../components/BotAvatar';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme';

export default function BotListScreen({ navigation }) {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBots = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await api.get('/bots');
            setBots(res.data?.data || res.data || []);
        } catch (error) {
            console.warn('Fetch bots error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBots();
        }, [])
    );

    const renderBot = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Chat', { bot: item })}
            activeOpacity={0.7}
        >
            <BotAvatar name={item.name} color={item.avatarColor} size={52} />
            <View style={styles.cardInfo}>
                <Text style={styles.botName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.botDesc} numberOfLines={2}>
                    {item.personalityPrompt || 'Start a conversation'}
                </Text>
            </View>
            <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No bots available</Text>
            <Text style={styles.emptySubtitle}>
                Check back later for new AI bots
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={bots}
                    keyExtractor={(item) => String(item._id || item.id)}
                    renderItem={renderBot}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={EmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchBots(true)}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        padding: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    cardInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    botName: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
        marginBottom: 2,
    },
    botDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 17,
    },
    arrow: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowText: {
        color: COLORS.textSecondary,
        fontSize: 20,
        fontWeight: '300',
        marginTop: -2,
    },
    empty: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyEmoji: {
        fontSize: 56,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: '700',
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});
