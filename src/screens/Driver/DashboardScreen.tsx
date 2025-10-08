import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, s } from 'react-native-size-matters';
import { AlertCircle, Calendar, CheckCircle2, Clock } from 'lucide-react-native';

import useDriverShift from '~/hooks/useDriverShift';
import { DriverShiftStatus } from '~/interfaces/Driver/Shift';

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const segments = [hours, minutes, seconds]
    .map((segment) => segment.toString().padStart(2, '0'))
    .join(':');

  return segments;
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

const DashboardScreen = () => {
  const { shift, isLoading, error, refresh, isDriver } = useDriverShift();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startedAtDate = useMemo(
    () => (shift?.startedAt ? new Date(shift.startedAt) : null),
    [shift?.startedAt],
  );

  useEffect(() => {
    if (!startedAtDate || shift?.status !== DriverShiftStatus.ACTIVE) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      const diffMs = Date.now() - startedAtDate.getTime();
      setElapsedSeconds(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [startedAtDate, shift?.status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const elapsedLabel = useMemo(() => formatDuration(elapsedSeconds), [elapsedSeconds]);
  const startedAtLabel = useMemo(() => formatDateTime(shift?.startedAt ?? null), [shift?.startedAt]);
  const finishableAtLabel = useMemo(
    () => formatDateTime(shift?.finishableAt ?? null),
    [shift?.finishableAt],
  );
  const endedAtLabel = useMemo(() => formatDateTime(shift?.endedAt ?? null), [shift?.endedAt]);

  const showInitialLoading = isLoading && !isRefreshing && !shift && !error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Text allowFontScaling={false} style={styles.title}>
          Dashboard
        </Text>

        {!isDriver ? (
          <View style={styles.card}>
            <AlertCircle size={s(24)} color="#B91C1C" style={styles.cardIcon} />
            <Text allowFontScaling={false} style={styles.cardTitle}>
              Driver access required
            </Text>
            <Text allowFontScaling={false} style={styles.cardBodyText}>
              This dashboard is only available for driver accounts. Please sign in
              with a driver profile to manage your shift.
            </Text>
          </View>
        ) : showInitialLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#CA251B" />
            <Text allowFontScaling={false} style={styles.loadingLabel}>
              Loading your shift information…
            </Text>
          </View>
        ) : (
          <>
            {error && (
              <View style={[styles.card, styles.errorCard]}>
                <AlertCircle size={s(24)} color="#B91C1C" style={styles.cardIcon} />
                <Text allowFontScaling={false} style={styles.cardTitle}>
                  Couldn&apos;t update shift status
                </Text>
                <Text allowFontScaling={false} style={styles.cardBodyText}>
                  Pull down to refresh or try again later.
                </Text>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text allowFontScaling={false} style={styles.sectionTitle}>
                  Current shift
                </Text>
                {shift?.status === DriverShiftStatus.ACTIVE && (
                  <View style={styles.timerChip}>
                    <Clock size={s(16)} color="#065F46" />
                    <Text allowFontScaling={false} style={styles.timerLabel}>
                      {elapsedLabel}
                    </Text>
                  </View>
                )}
              </View>

              {shift == null ? (
                <View style={styles.messageRow}>
                  <CheckCircle2 size={s(20)} color="#16A34A" style={styles.messageIcon} />
                  <Text allowFontScaling={false} style={styles.cardBodyText}>
                    You are currently off shift. Start your shift when you&apos;re
                    ready.
                  </Text>
                </View>
              ) : shift.status === DriverShiftStatus.ACTIVE ? (
                <>
                  <Text allowFontScaling={false} style={styles.cardBodyText}>
                    You&apos;re on an active shift. Keep up the great work!
                  </Text>
                  {startedAtLabel && (
                    <View style={styles.detailRow}>
                      <Calendar size={s(18)} color="#1E3A8A" style={styles.detailIcon} />
                      <Text allowFontScaling={false} style={styles.detailLabel}>
                        Started at {startedAtLabel}
                      </Text>
                    </View>
                  )}
                  {finishableAtLabel && (
                    <View style={styles.detailRow}>
                      <Clock size={s(18)} color="#1E3A8A" style={styles.detailIcon} />
                      <Text allowFontScaling={false} style={styles.detailLabel}>
                        Finishable at {finishableAtLabel}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text allowFontScaling={false} style={styles.cardBodyText}>
                    Your last shift has ended.
                  </Text>
                  {endedAtLabel && (
                    <View style={styles.detailRow}>
                      <Clock size={s(18)} color="#1E3A8A" style={styles.detailIcon} />
                      <Text allowFontScaling={false} style={styles.detailLabel}>
                        Ended at {endedAtLabel}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: '16@s',
    paddingTop: '24@vs',
    paddingBottom: '32@vs',
  },
  title: {
    fontSize: '24@ms',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '16@vs',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@s',
    paddingVertical: '18@vs',
    paddingHorizontal: '18@s',
    marginBottom: '20@vs',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12@vs',
  },
  sectionTitle: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#1F2937',
  },
  cardTitle: {
    fontSize: '18@ms',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '8@vs',
  },
  cardBodyText: {
    fontSize: '14@ms',
    lineHeight: '20@vs',
    color: '#4B5563',
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: '4@vs',
    paddingHorizontal: '10@s',
    borderRadius: '999@s',
  },
  timerLabel: {
    marginLeft: '6@s',
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#065F46',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginRight: '8@s',
    marginTop: '2@vs',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '12@vs',
  },
  detailIcon: {
    marginRight: '8@s',
  },
  detailLabel: {
    fontSize: '14@ms',
    color: '#1F2937',
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
  },
  loadingLabel: {
    marginTop: '12@vs',
    fontSize: '14@ms',
    color: '#4B5563',
  },
  cardIcon: {
    marginBottom: '12@vs',
  },
  errorCard: {
    borderColor: '#FECACA',
    borderWidth: 1,
  },
});

export default DashboardScreen;
