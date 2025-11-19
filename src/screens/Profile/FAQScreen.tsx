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
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import MainLayout from '~/layouts/MainLayout';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import { ChevronDown } from 'lucide-react-native';
import { useLocalization, useTranslation } from '~/localization';
import { getFaqSections } from '~/api/faq';
import type { FaqSection as FaqSectionResponse } from '~/interfaces/Faq';

const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  lightgray:'#F9FAFB',
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NormalizedFaqSection = {
  id: string;
  title: string;
  items: {
    id: string;
    question: string;
    answer: string;
  }[];
};

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
  const { locale } = useLocalization();

  const { data, isLoading, isError, refetch } = useQuery<FaqSectionResponse[]>({
    queryKey: ['faq', locale],
    queryFn: () => getFaqSections(locale),
  });

  useEffect(() => {
    setExpanded(null);
  }, [locale]);

  const sections = useMemo<NormalizedFaqSection[]>(() => {
    const source = Array.isArray(data) ? data : [];

    return source
      .map((section, sectionIndex) => {
        const title = typeof section.name === 'string' ? section.name.trim() : '';
        const sectionId = String(
          typeof section.id === 'number'
            ? section.id
            : typeof section.position === 'number'
              ? section.position
              : sectionIndex,
        );

        const items = Array.isArray(section.items)
          ? section.items
              .map((item, itemIndex) => {
                const question = typeof item.question === 'string' ? item.question.trim() : '';
                const answer = typeof item.answer === 'string' ? item.answer.trim() : '';
                const itemId =
                  typeof item.id === 'number' ? String(item.id) : `${sectionId}-${itemIndex}`;

                return {
                  id: itemId,
                  question,
                  answer,
                };
              })
              .filter((item) => item.question.length > 0 && item.answer.length > 0)
          : [];

        return {
          id: sectionId,
          title,
          items,
        };
      })
      .filter((section) => section.title.length > 0 && section.items.length > 0);
  }, [data]);

  const handleToggle = (questionId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === questionId ? null : questionId));
  };

  const customHeader = (
    <View style={styles.header}>
      <HeaderWithBackButton title={t('profile.faq.title')} />
    </View>
  );

  const renderStateView = (
    title: string,
    subtitle?: string,
    options: { showRetry?: boolean } = {},
  ) => (
    <View style={styles.stateWrapper}>
      <Text allowFontScaling={false} style={styles.stateTitle}>
        {title}
      </Text>
      {subtitle ? (
        <Text allowFontScaling={false} style={styles.stateSubtitle}>
          {subtitle}
        </Text>
      ) : null}
      {options.showRetry ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.stateButton}
          onPress={() => refetch()}
        >
          <Text allowFontScaling={false} style={styles.stateButtonLabel}>
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  let mainContent: React.ReactNode;

  if (isLoading) {
    mainContent = (
      <View style={styles.container}>
        <View style={styles.stateWrapper}>
          <ActivityIndicator size="large" color={palette.accent} style={styles.stateSpinner} />
          <Text allowFontScaling={false} style={styles.stateTitle}>
            {t('profile.faq.states.loadingTitle')}
          </Text>
        </View>
      </View>
    );
  } else if (isError) {
    mainContent = (
      <View style={styles.container}>
        {renderStateView(
          t('profile.faq.states.errorTitle'),
          t('profile.faq.states.errorSubtitle'),
          { showRetry: true },
        )}
      </View>
    );
  } else if (sections.length === 0) {
    mainContent = (
      <View style={styles.container}>
        {renderStateView(
          t('profile.faq.states.emptyTitle'),
          t('profile.faq.states.emptySubtitle'),
          { showRetry: true },
        )}
      </View>
    );
  } else {
    mainContent = (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>
                {section.title}
              </Text>

              {section.items.map((item) => {
                const questionKey = `${section.id}-${item.id}`;
                const isExpanded = expanded === questionKey;

                return (
                  <View key={questionKey}>
                    <TouchableOpacity
                      style={styles.questionRow}
                      activeOpacity={0.7}
                      onPress={() => handleToggle(questionKey)}
                    >
                      <Text allowFontScaling={false} style={styles.questionText}>
                        {item.question}
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

                    <AnimatedAnswer isVisible={isExpanded} text={item.answer} />
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

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
  header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '4@s',
  },
  scrollContent: {
    paddingHorizontal: '16@s',
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
  stateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '24@s',
    gap: '12@vs',
  },
  stateTitle: {
    color: palette.accentDark,
    fontSize: '16@ms',
    fontWeight: '600',
    textAlign: 'center',
  },
  stateSubtitle: {
    color: '#6B7280',
    fontSize: '14@ms',
    textAlign: 'center',
  },
  stateButton: {
    marginTop: '6@vs',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    borderRadius: '18@ms',
    borderWidth: 1,
    borderColor: palette.accent,
  },
  stateButtonLabel: {
    color: palette.accent,
    fontSize: '14@ms',
    fontWeight: '600',
  },
  stateSpinner: {
    marginBottom: '12@vs',
  },
});

export default FAQScreen;
