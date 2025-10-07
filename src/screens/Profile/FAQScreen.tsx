import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import MainLayout from '~/layouts/MainLayout';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { ChevronDown } from 'lucide-react-native';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const qaData = [
  {
    title: 'Ordering & Payments',
    items: [
      { q: 'How do I apply a promo code?', a: 'You can apply your promo code at checkout in the “Promo Code” field before placing your order.' },
      { q: 'Can I split payment between two cards?', a: 'Currently, split payments are not supported. You can only use one payment method per order.' },
      { q: 'What payment methods do you accept?', a: 'We accept major debit/credit cards, mobile wallets, and gift cards.' },
      { q: 'Will I be charged if I cancel my order?', a: 'You will not be charged if the order is canceled before processing. Refunds may take up to 3–5 business days.' },
      { q: 'Why was my payment declined?', a: 'This can occur if your card has insufficient funds or if your bank declined the transaction for security reasons.' },
    ],
  },
  {
    title: 'Delivery & Timing',
    items: [
      { q: 'Can I track my rider in real time?', a: 'Yes, once your order is confirmed, you can track your delivery in real time from the “Orders” section.' },
      { q: 'Can I schedule a delivery for later?', a: 'Yes! You can select a preferred delivery time during checkout.' },
      { q: 'How long does grocery delivery usually take?', a: 'Typical delivery time ranges from 30 to 60 minutes depending on your location and order size.' },
    ],
  },
  {
    title: 'Issues & Refund',
    items: [
      { q: 'What if my order is missing items?', a: 'Please contact our support team through the “Help” section, and we’ll resolve it quickly.' },
      { q: 'My food arrived cold—what can I do?', a: 'We’re sorry! Reach out to support to report the issue and request compensation or refund.' },
      { q: 'Can I get a refund if my order is late?', a: 'Refunds may apply depending on the delay. Contact customer service for more details.' },
    ],
  },
  {
    title: 'Account & Safety',
    items: [
      { q: 'Is my payment data secure?', a: 'Yes, we use encrypted payment systems to ensure your information is safe and protected.' },
      { q: 'Can I delete my account permanently?', a: 'Yes, go to “Account Settings” → “Delete Account & Data” to permanently remove your account.' },
    ],
  },
];

const AnimatedAnswer = ({ isVisible, text }: { isVisible: boolean; text: string }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setShouldRender(false);
      });
    }
  }, [isVisible,opacityAnim,slideAnim]);

  if (!shouldRender) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0], // subtle smooth slide
  });

  return (
    <Animated.View
      style={[
        styles.answerContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text allowFontScaling={false} style={styles.answerText}>
        {text}
      </Text>
    </Animated.View>
  );
};

const FAQScreen = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleToggle = (question: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === question ? null : question));
  };

  const customHeader = (
    <View>
      <HeaderWithBackButton title="FAQ" titleMarginLeft={s(100)} />
    </View>
  );

  const mainContent = (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {qaData.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              {section.title}
            </Text>

            {section.items.map(({ q, a }) => {
              const isExpanded = expanded === q;

              return (
                <View key={q}>
                  <TouchableOpacity
                    style={styles.questionRow}
                    activeOpacity={0.7}
                    onPress={() => handleToggle(q)}
                  >
                    <Text allowFontScaling={false} style={styles.questionText}>
                      {q}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                      }}
                    >
                      <ChevronDown
                        size={s(18)}
                        color={isExpanded ? palette.accent : palette.accentDark}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  <AnimatedAnswer isVisible={isExpanded} text={a} />
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <MainLayout
      showHeader
      showFooter
      collapsedHeader={false}
      enableHeaderCollapse={false}
      headerMaxHeight={vs(70)}
      headerMinHeight={vs(30)}
      activeTab="Profile"
      enforceResponsiveHeaderSize={false}
      customHeader={customHeader}
      mainContent={mainContent}
    />
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '4@s',
  },
  scrollContent: {
    paddingHorizontal: '16@s',
    paddingVertical: '10@vs',
  },
  section: {
    marginBottom: '20@vs',
  },
  sectionTitle: {
    color: palette.accent,
    fontSize: '18@ms',
    fontWeight: '700',
    marginBottom: '10@vs',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '10@vs',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'black',
  },
  questionText: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.accentDark,
    flexShrink: 1,
    marginRight: '8@s',
  },
  answerContainer: {
    backgroundColor: 'rgba(202,37,27,0.05)',
    borderRadius: '8@ms',
    marginBottom: '8@vs',
    marginTop: '4@vs',
    paddingVertical: '8@vs',
    paddingHorizontal: '12@s',
  },
  answerText: {
    color: palette.accentDark,
    fontSize: '14@ms',
    lineHeight: '20@ms',
  },
});

export default FAQScreen;
