import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, StyleSheet, InteractionManager } from 'react-native';
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
} from 'lucide-react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';

import MainLayout from '~/layouts/MainLayout';
import useAuth from '~/hooks/useAuth';
import LetteredAvatar from '~/components/ProfilSettings/LetteredAvatar';
const palette = {
  accent: '#CA251B',
  accentDark: '#17213A',
  neutral: '#4B5563',
};

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
  onNavigate: (route: string) => void,
): ProfileSection[] =>
  useMemo(
    () => [
      {
        title: 'Favorites',
        items: [
          {
            label: 'See my favorites',
            icon: Heart,
            route: 'Favorites',
          },
        ],
      },
      {
        title: 'Payment',
        items: [
          { label: 'Payment methods', icon: CreditCard, route: 'PaymentMethods' },
          { label: 'Order history', icon: History, route: 'OrderHistory' },
          { label: 'Coupon codes', icon: Gift, route: 'CouponCodes' },
        ],
      },
      {
        title: 'Profile',
        items: [
          {
            label: 'Profile Settings',
            icon: UserRound,
            route: 'ProfilSettings'
          },


        ],
      },
      {
        title: 'Other',
        items: [
          { label: 'Notifications', icon: Bell, route: 'Notifications' },
          { label: 'FAQ', icon: MessageCircleQuestion, route: 'FAQ' },
          { label: 'Manage Privacy', icon: ShieldCheck, route: 'Privacy' },
          { label: 'Delete account & Data', icon: Trash2, route: 'DeleteAccount' },
        ],
      },
    ],
    [onNavigate],
  );

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
      case 'Logout':
        handleLogout();
        break;
      default:
        console.log('Navigate to:', route);
    }
  };

  const displayName = user?.name ?? 'Guest User';


  const sections = useProfileSections(handleNavigate);

  const heroHeader = (
    <View style={styles.headerContent}>
      <View style={styles.topRow}>
        <Text allowFontScaling={false} style={styles.greetingLabel}>
          Hello, {displayName.split(' ')[0]}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButtonHeader}
          onPress={handleLogout}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text allowFontScaling={false} style={styles.logoutLabelHeader}>Logout</Text>
          )}
        </TouchableOpacity>
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
            <Text allowFontScaling={false} style={styles.superstarText}>
              Superstar
            </Text>
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <View style={styles.pointsBadge}>
            <Text allowFontScaling={false} style={styles.pointsValue}>246 PTS</Text>
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
            {displayName.split(' ')[0]}
          </Text>
          <Text allowFontScaling={false} style={styles.collapsedHint}>
            Tap options below
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
          <Text allowFontScaling={false} style={styles.collapsedLogoutLabel}>Log out</Text>
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
                return (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.85}
                    style={styles.row}
                    onPress={() => item.route && handleNavigate(item.route)}
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
                        {item.route ? '>' : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      }
    />
  );
};

const styles = ScaledSheet.create({
  headerContent: {
    paddingHorizontal: '20@s',
    paddingTop: vs(24),
    paddingBottom: vs(16),
  },
  greetingLabel: {
    fontSize: '32@ms',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: vs(8),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },



  logoutButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: '18@s',
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
