import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axiosInstance';
import BotAvatar from '../../components/BotAvatar';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme';

export default function AdminDashboardScreen({ navigation }) {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBots = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await api.get('/bots');
            setBots(res.data.data || []);
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

    const handleDelete = (botId, botName) => {
        Alert.alert(
            'Delete Bot',
            `Are you sure you want to delete "${botName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/bots/${botId}`);
                            setBots((prev) => prev.filter((b) => b._id !== botId && b.id !== botId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete bot.');
                        }
                    },
                },
            ]
        );
    };

    const renderBot = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <BotAvatar name={item.name} color={item.avatarColor} size={46} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.botName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.botPrompt} numberOfLines={1}>
                            {item.personality_prompt || 'No prompt set'}
                        </Text>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('CreateBot', { bot: item })}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.editText}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item._id || item.id, item.name)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const EmptyState = () => (
        <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤖</Text>
            <Text style={styles.emptyTitle}>No bots yet</Text>
            <Text style={styles.emptySubtitle}>
                Create your first AI bot to get started
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
                    keyExtractor={(item) => String(item.id)}
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

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateBot')}
                activeOpacity={0.8}
            >
                <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
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
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    botName: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
        marginBottom: 2,
    },
    botPrompt: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.sm,
    },
    editText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.error + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.sm,
    },
    deleteText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: '600',
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
    fab: {
        position: 'absolute',
        right: SPACING.lg,
        bottom: SPACING.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.glow,
    },
    fabText: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '300',
        marginTop: -2,
    },
});
