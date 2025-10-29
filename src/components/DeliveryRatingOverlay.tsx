import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bike, Star, X } from 'lucide-react-native';

import { getDeliveryRating, submitDeliveryRating } from '~/api/deliveryRatings';
import { useDeliveryRatingOverlay } from '~/context/DeliveryRatingOverlayContext';
import { useOngoingOrderContext } from '~/context/OngoingOrderContext';
import type { DeliveryRatingSummary } from '~/interfaces/DeliveryRating';
import { useTranslation } from '~/localization';

const accentColor = '#CA251B';
const backgroundColor = 'rgba(15, 23, 42, 0.65)';
const cardColor = '#FFFFFF';
const headingColor = '#17213A';
const bodyColor = '#4B5563';
const starInactive = '#E5E7EB';

type RatingFieldKey = 'timing' | 'foodCondition' | 'professionalism' | 'overall';

const ratingFields: { key: RatingFieldKey; translationKey: string }[] = [
  { key: 'timing', translationKey: 'deliveryRating.fields.timing' },
  { key: 'foodCondition', translationKey: 'deliveryRating.fields.foodCondition' },
  { key: 'professionalism', translationKey: 'deliveryRating.fields.professionalism' },
  { key: 'overall', translationKey: 'deliveryRating.fields.overall' },
];

const MAX_RATING = 5;

const DeliveryRatingOverlay = () => {
  const { state, close, setRating } = useDeliveryRatingOverlay();
  const { orderId, rating: initialRating, isVisible } = state;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { updateOrder } = useOngoingOrderContext();

  const [ratingValues, setRatingValues] = useState<Record<RatingFieldKey, number>>({
    timing: 0,
    foodCondition: 0,
    professionalism: 0,
    overall: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasInitialRating = useMemo(() => {
    const source = initialRating;
    if (!source) return false;
    return (
      [source.timing, source.foodCondition, source.professionalism, source.overall].filter(
        (value) => Number(value) > 0,
      ).length === 4
    );
  }, [initialRating]);

  const enabled = isVisible && Number.isFinite(orderId ?? NaN) && (orderId ?? 0) > 0;

  const ratingQuery = useQuery({
    queryKey: ['delivery', 'ratings', orderId],
    queryFn: async () => {
      if (!orderId) {
        return null;
      }
      const response = await getDeliveryRating(orderId);
      return response;
    },
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const mergedRating = useMemo<DeliveryRatingSummary | null>(() => {
    if (ratingQuery.data) {
      return ratingQuery.data;
    }
    return initialRating ?? null;
  }, [initialRating, ratingQuery.data]);

  useEffect(() => {
    if (!isVisible) {
      setRatingValues({ timing: 0, foodCondition: 0, professionalism: 0, overall: 0 });
      setErrorMessage(null);
      return;
    }

    if (mergedRating) {
      setRatingValues({
        timing: mergedRating.timing ?? 0,
        foodCondition: mergedRating.foodCondition ?? 0,
        professionalism: mergedRating.professionalism ?? 0,
        overall: mergedRating.overall ?? 0,
      });
    } else {
      setRatingValues({ timing: 0, foodCondition: 0, professionalism: 0, overall: 0 });
    }
  }, [isVisible, mergedRating]);

  useEffect(() => {
    if (ratingQuery.isSuccess) {
      setRating(ratingQuery.data ?? null);
    }
  }, [ratingQuery.data, ratingQuery.isSuccess, setRating]);

  useEffect(() => {
    if (ratingQuery.isError) {
      setErrorMessage(t('deliveryRating.errors.load'));
    }
  }, [ratingQuery.isError, t]);

  useEffect(() => {
    if (ratingQuery.isFetching) {
      setErrorMessage(null);
    }
  }, [ratingQuery.isFetching]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!orderId) {
        throw new Error('Missing order id');
      }

      const payload = {
        timing: ratingValues.timing,
        foodCondition: ratingValues.foodCondition,
        professionalism: ratingValues.professionalism,
        overall: ratingValues.overall,
        comments: mergedRating?.comments ?? null,
      };

      return submitDeliveryRating(orderId, payload);
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      setRating(response);
      updateOrder({ orderId: response.orderId, rating: response });
      queryClient.invalidateQueries({ queryKey: ['client', 'my-orders'] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['orders', 'ongoing'] }).catch(() => undefined);
      close();
    },
    onError: () => {
      setErrorMessage(t('deliveryRating.errors.submit'));
    },
  });

  const isBusy = mutation.isPending || ratingQuery.isFetching;

  const handleClose = () => {
    if (mutation.isPending) {
      return;
    }
    close();
  };

  const handleSelect = (field: RatingFieldKey, value: number) => {
    setRatingValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const isFormValid = useMemo(() => {
    return (
      ratingValues.timing > 0 &&
      ratingValues.foodCondition > 0 &&
      ratingValues.professionalism > 0 &&
      ratingValues.overall > 0
    );
  }, [ratingValues]);

  const submitLabel =
    hasInitialRating || mergedRating
      ? t('deliveryRating.actions.update')
      : t('deliveryRating.actions.submit');

  if (!isVisible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={[styles.card, { paddingTop: insets.top + 32 }]}> 
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={22} color={headingColor} />
          </TouchableOpacity>
          <View style={styles.headerIconWrapper}>
            <Bike size={48} color={accentColor} />
          </View>
          <Text style={styles.title}>{t('deliveryRating.title')}</Text>
          <Text style={styles.subtitle}>{t('deliveryRating.subtitle')}</Text>
          {ratingQuery.isFetching && !mergedRating ? (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={accentColor} />
            </View>
          ) : null}
          <View style={styles.ratingList}>
            {ratingFields.map((field) => {
              const value = ratingValues[field.key] ?? 0;
              return (
                <View key={field.key} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{t(field.translationKey)}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: MAX_RATING }, (_, index) => {
                      const starValue = index + 1;
                      const filled = value >= starValue;
                      return (
                        <TouchableOpacity
                          key={starValue}
                          style={styles.starButton}
                          onPress={() => handleSelect(field.key, starValue)}
                          disabled={isBusy}
                        >
                          <Star
                            size={28}
                            strokeWidth={1.2}
                            color={filled ? accentColor : starInactive}
                            fill={filled ? accentColor : 'transparent'}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid || isBusy ? styles.submitButtonDisabled : null]}
            activeOpacity={0.85}
            onPress={() => mutation.mutate()}
            disabled={!isFormValid || isBusy}
          >
            {isBusy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitLabel}>{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    backgroundColor: cardColor,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    left: 24,
    top: 24,
    padding: 8,
  },
  headerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDE8E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: headingColor,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: bodyColor,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  ratingList: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  ratingRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: headingColor,
    marginRight: 12,
  },
  starsRow: {
    flexDirection: 'row',
  },
  starButton: {
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: accentColor,
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  submitButton: {
    width: '100%',
    backgroundColor: accentColor,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeliveryRatingOverlay;
