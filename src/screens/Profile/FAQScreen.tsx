import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useTranslation } from '~/localization';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  lightgray:'#F9FAFB',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqSection = {
  key: string;
  items: { key: string }[];
};

const sectionsDefinition: FaqSection[] = [
  {
    key: 'orderingPayments',
    items: [
      { key: 'applyPromo' },
      { key: 'splitPayment' },
      { key: 'paymentMethods' },
      { key: 'cancelCharge' },
      { key: 'declinedPayment' },
    ],
  },
  {
    key: 'deliveryTiming',
    items: [
      { key: 'trackRider' },
      { key: 'scheduleDelivery' },
      { key: 'deliveryTime' },
    ],
  },
  {
    key: 'issuesRefund',
    items: [
      { key: 'missingItems' },
      { key: 'coldFood' },
      { key: 'lateOrder' },
    ],
  },
  {
    key: 'accountSafety',
    items: [
      { key: 'paymentSecurity' },
      { key: 'deleteAccount' },
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
  }, [isVisible, opacityAnim, slideAnim]);

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
  const { t } = useTranslation();

  const qaData = useMemo(
    () =>
      sectionsDefinition.map((section) => ({
        title: t(`profile.faq.sections.${section.key}.title`),
        items: section.items.map((item) => ({
          q: t(`profile.faq.sections.${section.key}.questions.${item.key}.question`),
          a: t(`profile.faq.sections.${section.key}.questions.${item.key}.answer`),
        })),
      })),
    [t],
  );

  const handleToggle = (question: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === question ? null : question));
  };

  const customHeader = (
    <View>
      <HeaderWithBackButton title={t('profile.faq.title')} titleMarginLeft={s(100)} />
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
      headerMaxHeight={vs(60)}
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
    borderTopColor: palette.lightgray,
    borderColor: palette.lightgray,
    borderTopWidth: 2,
    borderBottomWidth: 0,
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
