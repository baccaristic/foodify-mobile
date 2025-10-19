import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, type NavigationProp, type ParamListBase, type RouteProp } from '@react-navigation/native';
import { ArrowLeft, Headset, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '~/localization';

const palette = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  accent: '#D83A2E',
  accentDark: '#B12D22',
  secondaryText: '#6B7280',
  primaryText: '#0F172A',
  border: '#E5E7EB',
  bubbleAgent: '#FFFFFF',
  bubbleCustomer: '#D83A2E',
  bubbleSystem: '#F1F5F9',
};

type MessageSender = 'agent' | 'customer' | 'system';

type Message = {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
};

type LiveChatRouteParams = {
  orderId?: string | number | null;
  topic?: string | null;
  from?: string | null;
};

const LiveChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, LiveChatRouteParams>, string>>();
  const params = route.params ?? {};
  const { orderId, topic } = params;
  const { t } = useTranslation();

  const agentName = t('liveChat.agent.name');
  const agentRole = t('liveChat.agent.role');
  const agentBrand = t('liveChat.agent.brand');

  const formatTimestamp = useCallback(
    (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;
      const ampm = hours >= 12 ? t('liveChat.timestamp.pm') : t('liveChat.timestamp.am');
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    },
    [t],
  );

  const cannedAgentResponses = useMemo(
    () => [
      t('liveChat.cannedResponses.first'),
      t('liveChat.cannedResponses.second'),
      t('liveChat.cannedResponses.third'),
    ],
    [t],
  );

  const initialMessages = useMemo(
    () => [
      {
        id: 'system-1',
        sender: 'system' as const,
        content: t('liveChat.initialMessages.system', { values: { agentName, brand: agentBrand } }),
        timestamp: '09:41',
      },
      {
        id: 'agent-1',
        sender: 'agent' as const,
        content: t('liveChat.initialMessages.agentGreeting'),
        timestamp: '09:42',
      },
      {
        id: 'customer-1',
        sender: 'customer' as const,
        content: t('liveChat.initialMessages.customerQuestion', { values: { agentName } }),
        timestamp: '09:42',
      },
      {
        id: 'agent-2',
        sender: 'agent' as const,
        content: t('liveChat.initialMessages.agentFollowUp'),
        timestamp: '09:43',
      },
    ],
    [agentBrand, agentName, t],
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const agentTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cannedResponseIndex = useRef(0);
  const chatListRef = useRef<FlatList<Message>>(null);
  const typingOpacity = useRef(new Animated.Value(0)).current;

  const orderLabel = useMemo(() => {
    if (!orderId) {
      return null;
    }

    return typeof orderId === 'string' ? orderId : `#${orderId}`;
  }, [orderId]);
  const topicLabel = topic ?? t('liveChat.topicFallback');

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      chatListRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (agentTypingTimeout.current) {
        clearTimeout(agentTypingTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAgentTyping) {
      Animated.timing(typingOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(typingOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [isAgentTyping, typingOpacity]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const scheduleAgentResponse = useCallback(() => {
    setIsAgentTyping(true);

    if (agentTypingTimeout.current) {
      clearTimeout(agentTypingTimeout.current);
    }

    agentTypingTimeout.current = setTimeout(() => {
      const messageIndex = cannedResponseIndex.current % cannedAgentResponses.length;
      cannedResponseIndex.current += 1;

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        content: cannedAgentResponses[messageIndex],
        timestamp: formatTimestamp(new Date()),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsAgentTyping(false);
    }, 900);
  }, [cannedAgentResponses, formatTimestamp]);

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const newMessage: Message = {
      id: `customer-${Date.now()}`,
      sender: 'customer',
      content: trimmed,
      timestamp: formatTimestamp(new Date()),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    scheduleAgentResponse();
  }, [formatTimestamp, inputValue, scheduleAgentResponse]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isCustomer = item.sender === 'customer';
    const isAgent = item.sender === 'agent';
    const isSystem = item.sender === 'system';

    const containerStyle = [
      styles.messageRow,
      isCustomer && styles.messageRowCustomer,
      isAgent && styles.messageRowAgent,
      isSystem && styles.messageRowSystem,
    ];

    const bubbleStyle = [
      styles.messageBubble,
      isCustomer && styles.messageBubbleCustomer,
      isAgent && styles.messageBubbleAgent,
      isSystem && styles.messageBubbleSystem,
    ];

    const textStyle = [
      styles.messageText,
      isCustomer && styles.messageTextCustomer,
      isSystem && styles.messageTextSystem,
    ];

    return (
      <View style={containerStyle}>
        {!isCustomer && !isSystem ? (
          <View style={styles.agentAvatar}>
            <Headset size={16} color={palette.accent} />
          </View>
        ) : null}
        <View style={bubbleStyle}>
          <Text style={textStyle}>{item.content}</Text>
          <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  }, []);

  const typingLabel = t('liveChat.typingIndicator', { values: { agentName } });
  const typingIndicator = (
    <Animated.View style={[styles.typingIndicator, { opacity: typingOpacity }]}>
      <View style={styles.typingDot} />
      <View style={[styles.typingDot, styles.typingDotDelayed]} />
      <View style={[styles.typingDot, styles.typingDotExtraDelayed]} />
      <Text style={styles.typingLabel}>{typingLabel}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}> 
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={22} color={palette.primaryText} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t('liveChat.header.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('liveChat.header.subtitle', { values: { agentName, agentRole } })}
            </Text>
          </View>
        </View>

        <View style={styles.ticketSummary}>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>{t('liveChat.ticket.statusActive')}</Text>
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryTitle}>{topicLabel}</Text>
            {orderLabel ? (
              <Text style={styles.summarySubtitle}>
                {t('liveChat.ticket.orderLabel', { values: { order: orderLabel } })}
              </Text>
            ) : (
              <Text style={styles.summarySubtitle}>{t('liveChat.ticket.fallbackSubtitle')}</Text>
            )}
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.chatWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 16, android: 0 })}
        >
          <FlatList
            ref={chatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          />
          {isAgentTyping ? typingIndicator : null}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('liveChat.input.placeholder')}
              placeholderTextColor={palette.secondaryText}
              value={inputValue}
              onChangeText={setInputValue}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              activeOpacity={0.85}
              disabled={!inputValue.trim()}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default LiveChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.primaryText,
  },
  headerSubtitle: {
    fontSize: 13,
    color: palette.secondaryText,
    marginTop: 2,
  },
  ticketSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  summaryBadge: {
    backgroundColor: 'rgba(216, 58, 46, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryBadgeText: {
    color: palette.accent,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  summaryTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  summaryTitle: {
    color: palette.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  summarySubtitle: {
    color: palette.secondaryText,
    fontSize: 13,
    marginTop: 4,
  },
  chatWrapper: {
    flex: 1,
    marginTop: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  messageRow: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageRowCustomer: {
    alignSelf: 'flex-end',
  },
  messageRowAgent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowSystem: {
    alignSelf: 'center',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(216, 58, 46, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  messageBubbleCustomer: {
    backgroundColor: palette.bubbleCustomer,
    borderBottomRightRadius: 6,
  },
  messageBubbleAgent: {
    backgroundColor: palette.bubbleAgent,
    borderBottomLeftRadius: 6,
  },
  messageBubbleSystem: {
    backgroundColor: palette.bubbleSystem,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOpacity: 0,
    elevation: 0,
  },
  messageText: {
    color: palette.primaryText,
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextCustomer: {
    color: '#FFFFFF',
  },
  messageTextSystem: {
    color: palette.secondaryText,
    textAlign: 'center',
  },
  messageTimestamp: {
    fontSize: 11,
    color: palette.secondaryText,
    marginTop: 6,
    alignSelf: 'flex-end',
    opacity: 0.75,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
    marginRight: 4,
    opacity: 0.6,
  },
  typingDotDelayed: {
    opacity: 0.4,
  },
  typingDotExtraDelayed: {
    opacity: 0.2,
  },
  typingLabel: {
    marginLeft: 6,
    color: palette.secondaryText,
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    fontSize: 15,
    color: palette.primaryText,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
