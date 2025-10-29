import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, X } from 'lucide-react-native';

import { getDeliveryRating, submitDeliveryRating } from '~/api/deliveryRatings';
import { useDeliveryRatingOverlay } from '~/context/DeliveryRatingOverlayContext';
import { useRestaurantRatingOverlay } from '~/context/RestaurantRatingOverlayContext';
import { useOngoingOrderContext } from '~/context/OngoingOrderContext';
import type { DeliveryRatingSummary } from '~/interfaces/DeliveryRating';
import { useTranslation } from '~/localization';
import { Image } from 'expo-image';

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
  const { open: openRestaurantRating } = useRestaurantRatingOverlay();
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
  const [comments, setComments] = useState('');
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
      setComments('');
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
      setComments(mergedRating.comments ?? '');
    } else {
      setRatingValues({ timing: 0, foodCondition: 0, professionalism: 0, overall: 0 });
      setComments('');
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

      const trimmedComments = comments.trim();

      const payload = {
        timing: ratingValues.timing,
        foodCondition: ratingValues.foodCondition,
        professionalism: ratingValues.professionalism,
        overall: ratingValues.overall,
        comments: trimmedComments.length > 0 ? trimmedComments : null,
      };

      return submitDeliveryRating(orderId, payload);
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      setRating(response);
      setComments(response.comments ?? '');
      updateOrder({ orderId: response.orderId, rating: response });
      queryClient.invalidateQueries({ queryKey: ['client', 'my-orders'] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['orders', 'ongoing'] }).catch(() => undefined);
      close();
      openRestaurantRating({
        orderId: response.orderId,
        restaurantName: state.metadata?.restaurantName ?? null,
      });
    },
    onError: () => {
      setErrorMessage(t('deliveryRating.errors.submit'));
    },
  });

  const isBusy = mutation.isPending || ratingQuery.isFetching;

  const handleClose = () => {
    Keyboard.dismiss();
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={() => {
                Keyboard.dismiss();
                handleClose();
              }}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={insets.top + 24}
              style={styles.keyboardAvoider}
            >
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleClose();
                  }}
                >
                  <X size={22} color={headingColor} />
                </TouchableOpacity>
                <View style={styles.headerIconWrapper}>
                  <Image
                    source={require('../../assets/biker.png')}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="fill"
                  />
                </View>
                <Text allowFontScaling={false} style={styles.title}>
                  {t('deliveryRating.title')}
                </Text>
                <Text allowFontScaling={false} style={styles.subtitle}>
                  {t('deliveryRating.subtitle')}
                </Text>
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
                        <Text allowFontScaling={false} style={styles.ratingLabel}>
                          {t(field.translationKey)}
                        </Text>
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
                                activeOpacity={0.85}
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
                <View style={styles.commentSection}>
                  <Text allowFontScaling={false} style={styles.commentLabel}>
                    {t('deliveryRating.commentPrompt')}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    style={styles.commentInput}
                    placeholder={t('deliveryRating.commentPlaceholder')}
                    placeholderTextColor="#94A3B8"
                    multiline
                    maxLength={1024}
                    value={comments}
                    editable={!isBusy}
                    onChangeText={setComments}
                    textAlignVertical="top"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
                {errorMessage ? (
                  <Text allowFontScaling={false} style={styles.errorText}>
                    {errorMessage}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.submitButton, !isFormValid || isBusy ? styles.submitButtonDisabled : null]}
                  activeOpacity={0.85}
                  onPress={() => mutation.mutate()}
                  disabled={!isFormValid || isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text allowFontScaling={false} style={styles.submitLabel}>
                      {submitLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor,
  },
  overlay: {
    flex: 1,
    backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  keyboardAvoider: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    backgroundColor: cardColor,
    borderRadius: 32,
    paddingTop: 32,
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
  commentSection: {
    width: '100%',
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: headingColor,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  commentInput: {
    width: '100%',
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: headingColor,
    backgroundColor: '#F8FAFC',
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
