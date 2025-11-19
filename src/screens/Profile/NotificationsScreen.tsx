import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, MailOpen } from 'lucide-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import MainLayout from '~/layouts/MainLayout';
import {
  enableAllNotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '~/api/notifications';
import type {
  NotificationPreferenceResponse,
  NotificationPreferenceUpdate,
  NotificationType,
} from '~/interfaces/Notifications';
import { NOTIFICATION_TYPES } from '~/interfaces/Notifications';
import {
  loadNotificationPreferencesFromCache,
  saveNotificationPreferencesToCache,
} from '~/services/notificationPreferencesCache';
import { useTranslation } from '~/localization';

type PreferenceState = Record<NotificationType, NotificationPreferenceResponse>;

const NOTIFICATION_QUERY_KEY = ['notifications', 'preferences'] as const;

const createEmptyPreferenceState = (): PreferenceState => {
  return NOTIFICATION_TYPES.reduce((acc, type) => {
    acc[type] = { type, enabled: false, updatedAt: null };
    return acc;
  }, {} as PreferenceState);
};

const clonePreferenceState = (state: PreferenceState): PreferenceState => {
  return NOTIFICATION_TYPES.reduce((acc, type) => {
    const current = state[type];
    acc[type] = {
      type,
      enabled: current?.enabled ?? false,
      updatedAt: current?.updatedAt ?? null,
    };
    return acc;
  }, {} as PreferenceState);
};

const normalisePreferencesList = (
  preferences: NotificationPreferenceResponse[],
): PreferenceState => {
  const base = createEmptyPreferenceState();

  preferences.forEach((preference) => {
    if (preference && base[preference.type]) {
      base[preference.type] = {
        type: preference.type,
        enabled: Boolean(preference.enabled),
        updatedAt: preference.updatedAt ?? null,
      };
    }
  });

  return base;
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<PreferenceState>(() => createEmptyPreferenceState());
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const preferencesRef = useRef(preferences);
  const hasFocusedRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const syncPreferences = useCallback((list: NotificationPreferenceResponse[]) => {
    const normalised = normalisePreferencesList(list);
    setPreferences(normalised);
    void saveNotificationPreferencesToCache(list);
  }, []);

  useEffect(() => {
    let isActive = true;

    (async () => {
      const cached = await loadNotificationPreferencesFromCache();

      if (!isActive) {
        return;
      }

      if (cached) {
        setPreferences(normalisePreferencesList(cached));
        queryClient.setQueryData(NOTIFICATION_QUERY_KEY, cached);
      }

      setCacheLoaded(true);
    })();

    return () => {
      isActive = false;
    };
  }, [queryClient]);

  const { refetch } = useQuery<NotificationPreferenceResponse[]>({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: getNotificationPreferences,
    enabled: cacheLoaded,
    onSuccess: syncPreferences,
    staleTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        void refetch();
      } else {
        hasFocusedRef.current = true;
      }

      return () => {};
    }, [refetch]),
  );

  const handleServerSuccess = useCallback(
    (nextPreferences: NotificationPreferenceResponse[]) => {
      syncPreferences(nextPreferences);
      queryClient.setQueryData(NOTIFICATION_QUERY_KEY, nextPreferences);
    },
    [queryClient, syncPreferences],
  );

  const updateMutation = useMutation<
    NotificationPreferenceResponse[],
    unknown,
    NotificationPreferenceUpdate[],
    PreferenceState
  >({
    mutationFn: updateNotificationPreferences,
    onMutate: async (updates) => {
      const previous = clonePreferenceState(preferencesRef.current);
      const optimisticTimestamp = new Date().toISOString();

      setPreferences((current) => {
        const next = clonePreferenceState(current);

        updates.forEach(({ type, enabled }) => {
          next[type] = {
            ...next[type],
            enabled,
            updatedAt: optimisticTimestamp,
          };
        });

        return next;
      });

      return previous;
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setPreferences(context);
      }

      Alert.alert(
        t('profile.notifications.alerts.updateFailureTitle'),
        t('profile.notifications.alerts.updateFailureMessage'),
      );
    },
    onSuccess: handleServerSuccess,
  });

  const enableAllMutation = useMutation<
    NotificationPreferenceResponse[],
    unknown,
    void,
    PreferenceState
  >({
    mutationFn: enableAllNotificationPreferences,
    onMutate: async () => {
      const previous = clonePreferenceState(preferencesRef.current);
      const optimisticTimestamp = new Date().toISOString();

      setPreferences((current) => {
        const next = clonePreferenceState(current);

        NOTIFICATION_TYPES.forEach((type) => {
          next[type] = {
            ...next[type],
            enabled: true,
            updatedAt: optimisticTimestamp,
          };
        });

        return next;
      });

      return previous;
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setPreferences(context);
      }

      Alert.alert(
        t('profile.notifications.alerts.enableAllFailureTitle'),
        t('profile.notifications.alerts.enableAllFailureMessage'),
      );
    },
    onSuccess: handleServerSuccess,
  });

  const isMutating = updateMutation.isPending || enableAllMutation.isPending;
  const orderStatusEnabled = preferences.ORDER_UPDATES?.enabled ?? false;
  const offersPushEnabled = preferences.MARKETING_PUSH?.enabled ?? false;
  const offersEmailEnabled = preferences.MARKETING_EMAIL?.enabled ?? false;
  const allEnabled = NOTIFICATION_TYPES.every((type) => preferences[type]?.enabled);
  const controlsDisabled = isMutating;

  const handleToggleChange = useCallback(
    (type: NotificationType, enabled: boolean) => {
      if (controlsDisabled) {
        return;
      }

      updateMutation.mutate([{ type, enabled }]);
    },
    [controlsDisabled, updateMutation],
  );

  const handleEnableAll = useCallback(() => {
    if (controlsDisabled || allEnabled) {
      return;
    }

    enableAllMutation.mutate();
  }, [allEnabled, controlsDisabled, enableAllMutation]);

  const showLoadingOverlay = isMutating;

  const customHeader = (
    <View style={styles.header}>
      <HeaderWithBackButton title={t('profile.notifications.title')}  />
    </View>
  );

  const mainContent = (
    <ScrollView style={styles.container}>
      {showLoadingOverlay && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#CA251B" size="large" />
        </View>
      )}

      <View style={styles.headerBox}>
        <Text allowFontScaling={false} style={styles.headerTitle}>
          {t('profile.notifications.hero.title')}
        </Text>
        <Text allowFontScaling={false} style={styles.headerText}>
          {t('profile.notifications.hero.description')}
        </Text>

        <TouchableOpacity
          style={[
            styles.enableButton,
            (controlsDisabled || allEnabled) && styles.enableButtonDisabled,
          ]}
          onPress={handleEnableAll}
          disabled={controlsDisabled || allEnabled}
          activeOpacity={0.88}
        >
          <Text allowFontScaling={false} style={styles.enableButtonText}>
            {t('profile.notifications.hero.enableAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.titleRow}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>
            {t('profile.notifications.orderStatus.title')}
          </Text>
          <View style={styles.recommendedContainer}>
            <Text allowFontScaling={false} style={styles.recommendedText}>
              {t('profile.notifications.orderStatus.recommended')}
            </Text>
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.sectionDesc}>
          {t('profile.notifications.orderStatus.description')}
        </Text>

        <View style={styles.switchRow}>
          <View style={styles.labelRow}>
            <Bell size={24} color="#CA251B" style={styles.icon} />
            <Text allowFontScaling={false} style={styles.switchLabel}>
              {t('profile.notifications.labels.push')}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#ccc', true: '#CA251B' }}
            thumbColor="#fff"
            value={orderStatusEnabled}
            onValueChange={(value) => handleToggleChange('ORDER_UPDATES', value)}
            disabled={controlsDisabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text allowFontScaling={false} style={styles.sectionTitle}>
          {t('profile.notifications.marketing.title')}
        </Text>
        <Text allowFontScaling={false} style={styles.sectionDesc}>
          {t('profile.notifications.marketing.description')}
        </Text>

        <View style={styles.switchRow}>
          <View style={styles.labelRow}>
            <Bell size={24} color="#CA251B" style={styles.icon} />
            <Text allowFontScaling={false} style={styles.switchLabel}>
              {t('profile.notifications.labels.push')}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#ccc', true: '#CA251B' }}
            thumbColor="#fff"
            value={offersPushEnabled}
            onValueChange={(value) => handleToggleChange('MARKETING_PUSH', value)}
            disabled={controlsDisabled}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.labelRow}>
            <MailOpen size={24} color="#CA251B" style={styles.icon} />
            <Text allowFontScaling={false} style={styles.switchLabel}>
              {t('profile.notifications.labels.email')}
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#ccc', true: '#CA251B' }}
            thumbColor="#fff"
            value={offersEmailEnabled}
            onValueChange={(value) => handleToggleChange('MARKETING_EMAIL', value)}
            disabled={controlsDisabled}
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <MainLayout
      showHeader={true}
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
}

const styles = ScaledSheet.create({
  header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '16@s',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: '12@ms',
    padding: '16@s',
    fontStyle: 'Roboto',
    marginTop: '10@s',
  },
  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#17213A',
    marginBottom: '6@vs',
  },
  headerText: {
    fontSize: '13@ms',
    color: '#444',
  },
  enableButton: {
    backgroundColor: '#CA251B',
    paddingVertical: '8@vs',
    paddingHorizontal: '26@s',
    borderRadius: '12@ms',
    marginTop: '14@vs',
    alignSelf: 'center',
  },
  enableButtonDisabled: {
    opacity: 0.6,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    fontWeight: '400',
    textAlign: 'center',
  },
  section: {
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: '14@vs',
    fontStyle: 'Roboto',
  },
  sectionTitle: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: '#17213A',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(6),
    gap: s(6),
  },
  recommendedContainer: {
    backgroundColor: '#CA251B',
    borderRadius: 8,
    paddingHorizontal: s(10),
    paddingVertical: vs(2),
    justifyContent: 'center',
    alignItems: 'center',
    height: vs(20),
  },
  recommendedText: {
    color: '#FFF',
    fontSize: '11@ms',
    fontWeight: '600',
  },
  sectionDesc: {
    fontSize: '13@ms',
    color: '#555',
    marginVertical: '8@vs',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '6@vs',
  },
  switchLabel: {
    fontSize: '14@ms',
    color: '#17213A',
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: s(6),
    marginTop: 1,
  },
});
