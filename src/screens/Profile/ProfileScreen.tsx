import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  InteractionManager,
  PixelRatio,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import {
  Heart,
  CreditCard,
  History,
  Gift,
  Bell,
  MessageCircleQuestion,
  ShieldCheck,
  Trash2,
  UserRound,
  Medal,
} from 'lucide-react-native';
import { ScaledSheet, moderateScale, s, verticalScale, vs } from 'react-native-size-matters';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '~/layouts/MainLayout';
import useAuth from '~/hooks/useAuth';
import LetteredAvatar from '~/components/ProfilSettings/LetteredAvatar';
import { useTranslation } from '~/localization';
import { getLoyaltyBalance } from '~/api/loyalty';
import { useOnboarding } from '~/context/OnboardingContext';
import { useElementMeasurement } from '~/hooks/useElementMeasurement';
import OnboardingOverlay from '~/components/OnboardingOverlay';
const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  neutral: '#4B5563',
};
let textsize = 28;


type ProfileItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  route?: string;
  extra?: React.ReactNode;
};

type ProfileSection = {
  title: string;
  items: ProfileItem[];
};

const useProfileSections = (
  t: (key: string, options?: Record<string, unknown>) => string,
  loyaltySummary?: string | null,
): ProfileSection[] =>
  useMemo(
    () => [
      {
        title: t('profile.home.sections.favorites.title'),
        items: [
          {
            label: t('profile.home.sections.favorites.items.overview'),
            icon: Heart,
            route: 'Favorites',
          },
        ],
      },
      {
        title: t('profile.home.sections.payment.title'),
        items: [
  
          { label: t('profile.home.sections.payment.items.history'), icon: History, route: 'OrderHistory' },
          {
            label: t('profile.home.sections.payment.items.loyalty'),
            icon: Medal,
            route: 'LoyaltyRewards',
            extra: loyaltySummary ? (
              <View
                style={{
                  backgroundColor: 'rgba(202, 37, 27, 0.08)',
                  borderRadius: moderateScale(14),
                  paddingHorizontal: moderateScale(10),
                  paddingVertical: vs(4),
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: palette.accent,
                    fontSize: moderateScale(11),
                    fontWeight: '600',
                  }}
                >
                  {loyaltySummary}
                </Text>
              </View>
            ) : undefined,
          },
          { label: t('profile.home.sections.payment.items.coupons'), icon: Gift, route: 'CouponCodes' },
        ],
      },
      {
        title: t('profile.home.sections.profile.title'),
        items: [
          {
            label: t('profile.home.sections.profile.items.settings'),
            icon: UserRound,
            route: 'ProfilSettings',
          },
        ],
      },
      {
        title: t('profile.home.sections.other.title'),
        items: [
          { label: t('profile.home.sections.other.items.notifications'), icon: Bell, route: 'Notifications' },
          { label: t('profile.home.sections.other.items.faq'), icon: MessageCircleQuestion, route: 'FAQ' },
          { label: t('profile.home.sections.other.items.privacy'), icon: ShieldCheck, route: 'Privacy' },
          { label: t('profile.home.sections.other.items.deleteAccount'), icon: Trash2, route: 'DeleteAccount' },
        ],
      },
    ],
    [t, loyaltySummary],
  );

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { t } = useTranslation();
  const { isOnboardingActive, currentStep, nextStep, skipOnboarding, completeOnboarding } = useOnboarding();
  const { elementRef: pointsRef, measurement: pointsMeasurement, measureElement: measurePoints } = useElementMeasurement();
  const { elementRef: loyaltyRef, measurement: loyaltyMeasurement, measureElement: measureLoyalty } = useElementMeasurement();
  const { elementRef: favoritesRef, measurement: favoritesMeasurement, measureElement: measureFavorites } = useElementMeasurement();
  const { elementRef: settingsRef, measurement: settingsMeasurement, measureElement: measureSettings } = useElementMeasurement();
  
  const { data: loyaltyBalance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['loyalty', 'balance'],
    queryFn: getLoyaltyBalance,
    staleTime: 60_000,
  });

  const normalizedPoints = (() => {
    const value = loyaltyBalance?.balance ?? 0;
    return Number.isFinite(value) ? value : 0;
  })();

  const fractionDigits = normalizedPoints % 1 === 0 ? 0 : 2;
  const pointsFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: 2,
      }),
    [fractionDigits],
  );

  const pointsLabel = useMemo(() => {
    if (isBalanceLoading && !loyaltyBalance) {
      return t('profile.home.pointsLoading');
    }

    const formatted = pointsFormatter.format(normalizedPoints);
    return t('profile.home.pointsLabel', { values: { points: formatted } });
  }, [isBalanceLoading, loyaltyBalance, normalizedPoints, pointsFormatter, t]);

  const handleLogout = useCallback(async () => {
    if (isSigningOut) {
      return;
    }
    setIsSigningOut(true);
    try {
      await logout();
      InteractionManager.runAfterInteractions(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Guest' }],
          }),
        );
      });
    } catch (error) {
      console.warn('Failed to log out', error);
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, logout, navigation]);

  const handleNavigate = (route: string) => {
    if (!route) return;
    switch (route) {
      case 'OrderHistory':
        navigation.navigate('OrderHistory' as never);
        break;
      case 'AccountSettings':
        navigation.navigate('AccountSettings' as never);
        break;
      case 'Notifications':
        navigation.navigate('Notifications' as never);
        break;
      case 'DeleteAccount':
        navigation.navigate('DeleteAccount' as never);
        break;
      case 'FAQ':
        navigation.navigate('FAQ' as never);
        break;
      case 'Privacy':
        navigation.navigate('ManagePrivacy' as never);
        break;
      case 'ProfilSettings':
        navigation.navigate('ProfilSettings' as never);
        break;
      case 'CouponCodes':
        navigation.navigate('CouponCodes' as never);
        break;
      case 'LoyaltyRewards':
        navigation.navigate('LoyaltyRewards' as never);
        break;
      case 'Favorites':
        navigation.navigate('Favorites' as never);
        break;
      case 'Logout':
        handleLogout();
        break;
      default:
        console.log('Navigate to:', route);
    }
  };

  const displayName = user?.name ?? 'Guest User';

  const loyaltySummary = useMemo(
    () => (isBalanceLoading && !loyaltyBalance ? null : pointsLabel),
    [isBalanceLoading, loyaltyBalance, pointsLabel],
  );

  const sections = useProfileSections(t, loyaltySummary);

  // Measure elements for onboarding
  React.useEffect(() => {
    if (!isOnboardingActive) {
      return;
    }
    
    if (currentStep === 'profile_points') {
      const timer = setTimeout(measurePoints, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 'profile_loyalty') {
      const timer = setTimeout(measureLoyalty, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 'profile_favorites') {
      const timer = setTimeout(measureFavorites, 500);
      return () => clearTimeout(timer);
    } else if (currentStep === 'profile_settings') {
      const timer = setTimeout(measureSettings, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOnboardingActive, measurePoints, measureLoyalty, measureFavorites, measureSettings]);

  const heroHeader = (
    <View style={styles.headerContent}>
      <View style={styles.topRow}>
        <Text allowFontScaling={false} style={styles.greetingLabel}>
          {t('profile.home.greeting', { values: { name: displayName.split(' ')[0] } })}
        </Text>
        <View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButtonHeader}
          onPress={handleLogout}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text allowFontScaling={false} style={styles.logoutLabelHeader}>
              {t('profile.home.actions.logout')}
            </Text>
          )}
      </TouchableOpacity>
      </View>
    </View>

    <View style={styles.greetingRow}>
      <View style={styles.leftProfile}>
          <View >
            <LetteredAvatar name={displayName} size={56} />
          </View>


          <View style={styles.nameBlock}>
            <Text allowFontScaling={false} style={styles.nameText}>
              {displayName}
            </Text>
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <View 
            ref={pointsRef}
            collapsable={false}
            style={styles.pointsBadge}>
            <Text allowFontScaling={false} style={styles.pointsValue}>
              {pointsLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );


  const collapsedHeader = (
    <View style={styles.collapsedHeader}>
      <View style={styles.collapsedLeft}>
        <View style={styles.collapsedAvatar}>
          <LetteredAvatar name={displayName} size={38} borderWidth={1.5} borderColor="rgba(255,255,255,0.5)" />
        </View>

      <View style={styles.collapsedText}>
        <Text allowFontScaling={false} style={styles.collapsedGreeting}>
          {t('profile.home.collapsedGreeting', { values: { name: displayName.split(' ')[0] } })}
        </Text>
          <Text allowFontScaling={false} style={styles.collapsedHint}>
            {t('profile.home.collapsedHint')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.collapsedLogoutButton}
        onPress={handleLogout}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text allowFontScaling={false} style={styles.collapsedLogoutLabel}>
            {t('profile.home.actions.logout')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <MainLayout
      showHeader
      showFooter
      activeTab="Profile"
      headerMaxHeight={vs(120)}
      headerBackgroundImage={require('../../../assets/background.png')}
      customHeader={heroHeader}
      collapsedHeader={collapsedHeader}
      mainContent={
        <View style={styles.sectionList}>
          {sections.map((section) => (
            <View key={section.title} style={styles.sectionBlock}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>
                {section.title}
              </Text>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isLoyaltyItem = item.route === 'LoyaltyRewards';
                const isFavoritesItem = item.route === 'Favorites';
                const isSettingsItem = item.route === 'ProfilSettings';
                
                return (
                  <View
                    key={item.label}
                    ref={isLoyaltyItem ? loyaltyRef : isFavoritesItem ? favoritesRef : isSettingsItem ? settingsRef : null}
                    collapsable={false}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.row}
                      onPress={() => {
                        if (isLoyaltyItem && currentStep === 'profile_loyalty') {
                          nextStep();
                        } else if (isFavoritesItem && currentStep === 'profile_favorites') {
                          nextStep();
                        } else if (isSettingsItem && currentStep === 'profile_settings') {
                          completeOnboarding();
                        }
                        item.route && handleNavigate(item.route);
                      }}
                    >
                      <View style={styles.rowLeft}>
                        <View style={styles.iconShell}>
                          <Icon size={s(18)} color={palette.accent} />
                        </View>
                        <Text allowFontScaling={false} style={styles.rowLabel}>
                        {item.label}
                      </Text>
                    </View>
                    {item.extra ?? (
                      <Text allowFontScaling={false} style={styles.rowAction}>
                        {item.route ? t('profile.home.rowIndicator') : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                );
              })}
            </View>
          ))}
        </View>
      }
    >
      {/* Onboarding Overlays */}
      {isOnboardingActive && currentStep === 'profile_points' && pointsMeasurement && (
        <OnboardingOverlay
          step="profile_points"
          title={t('onboarding.profilePoints.title')}
          description={t('onboarding.profilePoints.description')}
          onNext={nextStep}
          onSkip={skipOnboarding}
          highlightArea={pointsMeasurement}
        />
      )}
      
      {isOnboardingActive && currentStep === 'profile_loyalty' && loyaltyMeasurement && (
        <OnboardingOverlay
          step="profile_loyalty"
          title={t('onboarding.profileLoyalty.title')}
          description={t('onboarding.profileLoyalty.description')}
          onNext={nextStep}
          onSkip={skipOnboarding}
          highlightArea={loyaltyMeasurement}
        />
      )}
      
      {isOnboardingActive && currentStep === 'profile_favorites' && favoritesMeasurement && (
        <OnboardingOverlay
          step="profile_favorites"
          title={t('onboarding.profileFavorites.title')}
          description={t('onboarding.profileFavorites.description')}
          onNext={nextStep}
          onSkip={skipOnboarding}
          highlightArea={favoritesMeasurement}
        />
      )}
      
      {isOnboardingActive && currentStep === 'profile_settings' && settingsMeasurement && (
        <OnboardingOverlay
          step="profile_settings"
          title={t('onboarding.profileSettings.title')}
          description={t('onboarding.profileSettings.description')}
          onNext={completeOnboarding}
          onSkip={skipOnboarding}
          highlightArea={settingsMeasurement}
        />
      )}
    </MainLayout>
  );
};

const styles = ScaledSheet.create({
  headerContent: {
    paddingHorizontal: '20@s',
    paddingTop: vs(24),
    paddingBottom: vs(16),
  },
  greetingLabel: {
    fontSize: textsize,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: vs(8),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
    gap:'5@ms'
  },

  logoutButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: '8@s',
    paddingVertical: '8@vs',
    borderRadius: '16@ms',
    borderColor: 'white',
    borderWidth: 2,

  },

  logoutLabelHeader: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    fontWeight: '600',
  },

  greetingRow: {
    marginTop:verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameBlock: {
    marginLeft: '10@s',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: '16@ms',
    fontWeight: '700',
    maxWidth:moderateScale(150)
  },
  superstarText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '12@ms',
    marginTop: vs(2),
  },
  pointsContainer: {
    alignItems: 'flex-end',

  },
  pointsBadge: {
    backgroundColor: '#17213A',
    borderRadius: '20@ms',
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',

  },
  pointsValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: '20@ms',
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '11@ms',
    marginTop: vs(2),
  },
  collapsedLogoutButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: '16@s',
    paddingVertical: '6@vs',
    borderRadius: '16@ms',
    borderColor: 'white',
    borderWidth: 2,
  },
  collapsedLogoutLabel: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    fontWeight: '600',
    paddingHorizontal: '18@s',
    paddingVertical: '8@vs',
  },

  collapsedHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@s',
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedAvatar: {
    marginRight: '10@s',
  },
  collapsedAvatarImage: {
    width: '100%',
    height: '100%',
  },
  collapsedText: {
    justifyContent: 'center',
  },
  collapsedGreeting: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  collapsedHint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '11@ms',
    maxWidth:moderateScale(100),
  },
  collapsedPoints: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '16@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
  },
  collapsedPointsValue: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    fontWeight: '700',
  },
  sectionList: {
    paddingHorizontal: '18@s',
    paddingTop: '18@vs',
    paddingBottom: '24@vs',
    gap: '18@vs',
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    paddingHorizontal: '18@s',
    paddingVertical: '14@vs',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: '12@ms',
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  sectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.accentDark,
    marginBottom: '12@vs',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '12@vs',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(23,33,58,0.1)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconShell: {
    width: '32@s',
    height: '32@s',
    borderRadius: '16@s',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@s',
  },
  rowLabel: {
    fontSize: '14@ms',
    color: palette.accentDark,
  },
  rowAction: {
    fontSize: '16@ms',
    color: palette.accent,
    fontWeight: '600',
  },
  inlineAction: {
    fontSize: '12@ms',
    color: palette.accent,
    fontWeight: '600',
  },
  logoutContainer: {
    marginTop: '18@vs',
    alignItems: 'center',
    gap: '8@vs',

  },
  logoutButton: {
    backgroundColor: palette.accent,
    paddingHorizontal: '48@s',
    paddingVertical: '12@vs',
    borderRadius: '999@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  logoutHint: {
    fontSize: '11@ms',
    color: '#6B7280',
    textAlign: 'center',
  },

});

export default ProfileScreen;
