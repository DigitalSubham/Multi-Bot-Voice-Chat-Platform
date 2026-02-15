import React, { useState, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useAudioRecorder,
    useAudioRecorderState,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
} from 'expo-audio';
import api from '../../api/axiosInstance';
import BotAvatar from '../../components/BotAvatar';
import MessageBubble from '../../components/MessageBubble';
import TypingIndicator from '../../components/TypingIndicator';
import SpeakingAnimation from '../../components/SpeakingAnimation';
import ListeningAnimation from '../../components/ListeningAnimation';
import ThinkingAnimation from '../../components/ThinkingAnimation';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme';

export default function ChatScreen({ route }) {
    const bot = route.params?.bot || {};
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [recordingLoading, setRecordingLoading] = useState(false);
    const [voiceMode, setVoiceMode] = useState('none'); // 'none', 'listening', 'thinking', 'speaking'
    const [currentVoiceText, setCurrentVoiceText] = useState('');

    // ─── expo-audio recorder hook ─────────────────────
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    // Request audio permissions on mount
    useEffect(() => {
        (async () => {
            try {
                const status = await AudioModule.requestRecordingPermissionsAsync();
                if (!status.granted) {
                    Alert.alert(
                        'Permission Required',
                        'Microphone access is needed for voice recording.'
                    );
                }
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    allowsRecording: true,
                });
            } catch (err) {
                console.warn('Audio permission error:', err);
            }
        })();
    }, []);

    const getTimestamp = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const mins = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
    };

    // ─── Text Chat ───────────────────────────────────

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isSending) return;

        const userMsg = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            time: getTimestamp(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setIsSending(true);

        try {
            const res = await api.post('/chat', {
                botId: bot._id || bot.id,
                message: text,
            });

            const botReply = {
                id: (Date.now() + 1).toString(),
                text: res.data?.data?.response || 'No response',
                sender: 'bot',
                time: getTimestamp(),
            };

            setMessages((prev) => [...prev, botReply]);

            // If the response includes audio, play it
            // if (res.data?.audioUrl) {
            //     playAudio(res.data.audioUrl);
            // }
        } catch (error) {
            const errMsg = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, something went wrong. Please try again.',
                sender: 'bot',
                time: getTimestamp(),
            };
            setMessages((prev) => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
            setIsSending(false);
        }
    };

    // ─── Voice Recording (expo-audio) ────────────────

    const startRecording = async () => {
        try {
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
            setVoiceMode('listening');
            setCurrentVoiceText('Listening...');
        } catch (err) {
            console.error('Start recording error:', err);
            Alert.alert('Error', 'Failed to start recording.');
        }
    };

    const stopRecording = async () => {
        setRecordingLoading(true);
        setVoiceMode('thinking');
        setCurrentVoiceText('Thinking...');

        try {
            await audioRecorder.stop();
            const uri = audioRecorder.uri;

            if (!uri) {
                Alert.alert('Error', 'No recording captured.');
                return;
            }

            const formData = new FormData();
            formData.append('audio', {
                uri,
                type: 'audio/m4a',
                name: 'voice.m4a',
            });
            formData.append('botId', bot._id || bot.id);

            const res = await api.post('/voice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const transcript = res.data?.data?.transcript;
            const responseText = res.data?.data?.response;

            // 1️⃣ Show user voice message (converted text)
            if (transcript) {
                const userMsg = {
                    id: Date.now().toString(),
                    text: transcript,
                    sender: 'user',
                    time: getTimestamp(),
                };
                setMessages(prev => [...prev, userMsg]);
                setCurrentVoiceText(transcript);
            }

            // 2️⃣ Show bot reply
            if (responseText) {
                const botReply = {
                    id: (Date.now() + 1).toString(),
                    text: responseText,
                    sender: 'bot',
                    time: getTimestamp(),
                };
                setMessages(prev => [...prev, botReply]);
                setCurrentVoiceText(responseText);

                // 3️⃣ Speak the response
                speakResponse(responseText);
            }

        } catch (error) {
            console.error('Voice send error:', error);
            Alert.alert('Error', 'Failed to process voice message.');
        } finally {
            setRecordingLoading(false);
        }
    };

    const speakResponse = (text) => {
        Speech.speak(text, {
            language: 'en-US', // or dynamic if using Hindi
            pitch: 1.0,
            rate: 1.0,
            onStart: () => {
                setIsSpeaking(true);
                setVoiceMode('speaking');
            },
            onDone: () => {
                setIsSpeaking(false);
                setVoiceMode('none');
            },
            onStopped: () => {
                setIsSpeaking(false);
                setVoiceMode('none');
            },
            onError: () => {
                setIsSpeaking(false);
                setVoiceMode('none');
            },
        });
    };



    const toggleRecording = () => {
        if (recorderState.isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // ─── Audio Playback (imperative, for dynamic URLs) ──

    const playAudio = async (url) => {
        try {
            setIsSpeaking(true);
            // Use the imperative Audio API for dynamic URLs
            const { createAudioPlayer } = await import('expo-audio');
            const player = createAudioPlayer({ uri: url });
            player.play();

            // Poll for completion (simple approach)
            const interval = setInterval(() => {
                if (!player.playing) {
                    setIsSpeaking(false);
                    player.remove();
                    clearInterval(interval);
                }
            }, 300);
        } catch (err) {
            console.warn('Audio playback error:', err);
            setIsSpeaking(false);
        }
    };

    const loadChatHistory = async () => {
        try {
            const res = await api.get(`/chat/${bot._id || bot.id}/history`);
            const formatted = res.data?.data?.history?.map(item => ({
                id: item.id,
                text: item.message,
                sender: item.role === 'assistant' ? 'bot' : 'user',
                time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }));

            setMessages(formatted || []);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);

        } catch (err) {
            console.warn("Failed to load history:", err);
        }
    };

    useEffect(() => {
        loadChatHistory();
    }, []);



    // ─── Render ──────────────────────────────────────

    const renderMessage = ({ item }) => <MessageBubble message={item} />;

    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
                keyboardVerticalOffset={90}
            >
                {/* Bot Header */}
                <View style={styles.botHeader}>
                    <View style={styles.avatarWrapper}>
                        <BotAvatar
                            name={bot.name}
                            color={bot.avatarColor}
                            size={46}
                        />
                        <SpeakingAnimation
                            color={bot.avatarColor || COLORS.primary}
                            size={46}
                            active={isSpeaking}
                        />
                        <ListeningAnimation
                            size={46}
                            active={recorderState.isRecording}
                        />
                    </View>
                    <View style={styles.botHeaderInfo}>
                        <Text style={styles.botHeaderName}>{bot.name || 'AI Bot'}</Text>
                        <Text style={styles.botHeaderStatus}>
                            {isSpeaking
                                ? '🔊 Speaking...'
                                : recorderState.isRecording
                                    ? '🟢 Listening...'
                                    : isTyping
                                        ? 'Typing...'
                                        : 'Online'}
                        </Text>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    onLayout={() =>
                        flatListRef.current?.scrollToEnd({ animated: false })
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Text style={styles.emptyChatEmoji}>👋</Text>
                            <Text style={styles.emptyChatText}>
                                Say hello to {bot.name || 'the bot'}!
                            </Text>
                        </View>
                    }
                />

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type a message..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        maxLength={2000}
                    />

                    {/* Voice Button */}
                    <TouchableOpacity
                        style={[
                            styles.voiceButton,
                            recorderState.isRecording && styles.voiceButtonActive,
                        ]}
                        onPress={toggleRecording}
                        disabled={recordingLoading}
                        activeOpacity={0.7}
                    >
                        {recordingLoading ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Text style={styles.voiceIcon}>
                                {recorderState.isRecording ? '⏹' : '🎤'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Send Button */}
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!input.trim() || isSending) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!input.trim() || isSending}
                        activeOpacity={0.7}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Text style={styles.sendIcon}>↑</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Full-Screen Voice Overlay */}
                <Modal
                    visible={voiceMode !== 'none'}
                    animationType="fade"
                    transparent={true}
                >
                    <View style={styles.overlayContainer}>
                        <SafeAreaView style={styles.overlayContent}>
                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.closeOverlay}
                                onPress={() => {
                                    setVoiceMode('none');
                                    Speech.stop();
                                    if (recorderState.isRecording) audioRecorder.stop();
                                }}
                            >
                                <Text style={styles.closeIcon}>✕</Text>
                            </TouchableOpacity>

                            <View style={styles.overlayCenter}>
                                {/* Large Avatar and Pulse */}
                                <View style={styles.largeAvatarWrapper}>
                                    <BotAvatar
                                        name={bot.name}
                                        color={bot.avatarColor}
                                        size={120}
                                    />
                                    <ListeningAnimation
                                        size={120}
                                        active={voiceMode === 'listening'}
                                    />
                                    <SpeakingAnimation
                                        color={bot.avatarColor || COLORS.primary}
                                        size={120}
                                        active={voiceMode === 'speaking'}
                                    />
                                    {voiceMode === 'thinking' && (
                                        <View style={styles.thinkingWrapper}>
                                            <ThinkingAnimation size={120} active={true} />
                                        </View>
                                    )}
                                </View>

                                {/* Status & Text */}
                                <Text style={styles.overlayStatus}>
                                    {voiceMode === 'listening' ? 'Listening...' :
                                        voiceMode === 'thinking' ? 'Thinking...' :
                                            voiceMode === 'speaking' ? bot.name : ''}
                                </Text>

                                {/* <View style={styles.voiceTextContainer}>
                                    <Text style={styles.voiceText}>
                                        {currentVoiceText}
                                    </Text>
                                </View> */}
                            </View>

                            {/* Listening Controls */}
                            {voiceMode === 'listening' && (
                                <TouchableOpacity
                                    style={styles.stopRecordingButton}
                                    onPress={stopRecording}
                                >
                                    <View style={styles.stopIcon} />
                                    <Text style={styles.stopText}>Tap to Stop</Text>
                                </TouchableOpacity>
                            )}
                        </SafeAreaView>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: { flex: 1 },

    // Bot Header
    botHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    botHeaderInfo: {
        marginLeft: SPACING.md,
    },
    botHeaderName: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    botHeaderStatus: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 1,
    },

    // Messages
    messageList: {
        paddingVertical: SPACING.sm,
        flexGrow: 1,
    },
    emptyChat: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyChatEmoji: {
        fontSize: 48,
        marginBottom: SPACING.sm,
    },
    emptyChatText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    // Input Bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 6,
    },
    textInput: {
        flex: 1,
        backgroundColor: COLORS.inputBg,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: 10,
        paddingTop: 10,
        color: COLORS.text,
        fontSize: 15,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    voiceButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    voiceButtonActive: {
        backgroundColor: COLORS.error,
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    voiceIcon: {
        fontSize: 18,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.surfaceLight,
    },
    sendIcon: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700',
    },

    // Voice Overlay Styles
    overlayContainer: {
        flex: 1,
        backgroundColor: 'rgba(15, 15, 26, 0.98)',
    },
    overlayContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    closeOverlay: {
        position: 'absolute',
        top: 60,
        right: 30,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        color: COLORS.white,
        fontSize: 18,
    },
    overlayCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    largeAvatarWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    thinkingWrapper: {
        position: 'absolute',
        bottom: -40,
    },
    overlayStatus: {
        fontSize: 18,
        color: COLORS.primaryLight,
        fontWeight: '600',
        marginBottom: 20,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    voiceTextContainer: {
        minHeight: 100,
        alignItems: 'center',
    },
    voiceText: {
        fontSize: 24,
        color: COLORS.white,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 34,
    },
    stopRecordingButton: {
        alignItems: 'center',
        marginBottom: 40,
    },
    stopIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.error,
        marginBottom: 12,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    stopText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});
