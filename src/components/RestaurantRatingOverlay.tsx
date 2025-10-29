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
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThumbsDown, ThumbsUp, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ms } from 'react-native-size-matters';

import { getRestaurantRating, submitRestaurantRating } from '~/api/restaurantRatings';
import { useRestaurantRatingOverlay } from '~/context/RestaurantRatingOverlayContext';
import { useOngoingOrderContext } from '~/context/OngoingOrderContext';
import { useTranslation } from '~/localization';

const accentColor = '#CA251B';
const positiveColor = '#111827';
const backgroundColor = 'rgba(15, 23, 42, 0.65)';
const cardColor = '#FFFFFF';
const headingColor = '#17213A';
const bodyColor = '#4B5563';
const borderColor = '#E5E7EB';
const placeholderColor = '#94A3B8';

const RestaurantRatingOverlay = () => {
  const { state, close, setRating } = useRestaurantRatingOverlay();
  const { orderId, rating: initialRating, isVisible, metadata } = state;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateOrder } = useOngoingOrderContext();

  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const enabled = isVisible && Number.isFinite(orderId ?? NaN) && (orderId ?? 0) > 0;

  const ratingQuery = useQuery({
    queryKey: ['restaurant', 'ratings', orderId],
    queryFn: async () => {
      if (!orderId) {
        return null;
      }
      return getRestaurantRating(orderId);
    },
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  const mergedRating = useMemo(() => {
    if (ratingQuery.data) {
      return ratingQuery.data;
    }
    return initialRating ?? null;
  }, [initialRating, ratingQuery.data]);

  const restaurantName = useMemo(() => {
    const name = metadata?.restaurantName;
    if (!name) {
      return null;
    }
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [metadata?.restaurantName]);

  useEffect(() => {
    if (!isVisible) {
      setThumbsUp(null);
      setComments('');
      setErrorMessage(null);
      return;
    }

    if (mergedRating) {
      setThumbsUp(mergedRating.thumbsUp);
      setComments(mergedRating.comments ?? '');
    } else {
      setThumbsUp(null);
      setComments('');
    }
    setErrorMessage(null);
  }, [isVisible, mergedRating]);

  useEffect(() => {
    if (ratingQuery.isSuccess) {
      setRating(ratingQuery.data ?? null);
    }
  }, [ratingQuery.data, ratingQuery.isSuccess, setRating]);

  useEffect(() => {
    if (ratingQuery.isError) {
      setErrorMessage(t('restaurantRating.errors.load'));
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

      if (thumbsUp == null) {
        throw new Error('Missing selection');
      }

      const trimmedComments = comments.trim();

      return submitRestaurantRating(orderId, {
        thumbsUp,
        comments: trimmedComments.length > 0 ? trimmedComments : null,
      });
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      setRating(response);
      updateOrder({ orderId: response.orderId, restaurantRating: response });
      queryClient.invalidateQueries({ queryKey: ['client', 'my-orders'] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['orders', 'ongoing'] }).catch(() => undefined);
      close();
    },
    onError: () => {
      setErrorMessage((previous) => previous ?? t('restaurantRating.errors.submit'));
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

  const handleSelect = (value: boolean) => {
    setThumbsUp(value);
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (thumbsUp == null) {
      setErrorMessage(t('restaurantRating.errors.selection'));
      return;
    }

    mutation.mutate();
  };

  if (!isVisible) {
    return null;
  }

  const hasExistingRating = mergedRating != null;
  const submitLabel = hasExistingRating
    ? t('restaurantRating.actions.update')
    : t('restaurantRating.actions.submit');

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
              keyboardVerticalOffset={insets.top + ms(24)}
              style={styles.keyboardAvoider}
            >
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                showsVerticalScrollIndicator={false}
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
                <View style={styles.headerIllustrationWrapper}>
                  <Image
                    source={require('../../assets/rate-restaurant.png')}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                  />
                </View>
                <Text allowFontScaling={false} style={styles.headline}>
                  {t('restaurantRating.headline')}
                </Text>
                <Text allowFontScaling={false} style={styles.question}>
                  {t('restaurantRating.question')}
                </Text>
                {restaurantName ? (
                  <Text allowFontScaling={false} style={styles.restaurantName}>
                    {restaurantName}
                  </Text>
                ) : null}
                {ratingQuery.isFetching && !mergedRating ? (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color={accentColor} />
                  </View>
                ) : null}
                <View style={styles.choiceRow}>
                  <View style={styles.choiceColumn}>
                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        thumbsUp === true ? styles.choiceButtonPositiveActive : null,
                      ]}
                      onPress={() => handleSelect(true)}
                      disabled={isBusy}
                      activeOpacity={0.85}
                    >
                      <ThumbsUp
                        size={36}
                        color={positiveColor}
                        strokeWidth={1.6}
                        fill={thumbsUp === true ? positiveColor : 'none'}
                      />
                    </TouchableOpacity>
                    <Text
                      allowFontScaling={false}
                      style={[styles.choiceLabel, styles.choiceLabelPositive]}
                    >
                      {t('restaurantRating.options.thumbsUp')}
                    </Text>
                  </View>
                  <View style={styles.choiceColumn}>
                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        thumbsUp === false ? styles.choiceButtonNegativeActive : null,
                      ]}
                      onPress={() => handleSelect(false)}
                      disabled={isBusy}
                      activeOpacity={0.85}
                    >
                      <ThumbsDown
                        size={36}
                        color={accentColor}
                        strokeWidth={1.6}
                        fill={thumbsUp === false ? accentColor : 'none'}
                      />
                    </TouchableOpacity>
                    <Text
                      allowFontScaling={false}
                      style={[styles.choiceLabel, styles.choiceLabelNegative]}
                    >
                      {t('restaurantRating.options.thumbsDown')}
                    </Text>
                  </View>
                </View>
                <Text allowFontScaling={false} style={styles.orLabel}>
                  {t('restaurantRating.options.or')}
                </Text>
                <View style={styles.commentSection}>
                  <Text allowFontScaling={false} style={styles.commentLabel}>
                    {t('restaurantRating.commentPrompt')}
                  </Text>
                  <TextInput
                    allowFontScaling={false}
                    style={styles.commentInput}
                    placeholder={t('restaurantRating.commentPlaceholder')}
                    placeholderTextColor={placeholderColor}
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
                    style={[styles.submitButton, isBusy ? styles.submitButtonDisabled : null]}
                    activeOpacity={0.85}
                    onPress={handleSubmit}
                    disabled={isBusy}
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
              </ScrollView>
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
    paddingHorizontal: ms(24),
  },
  keyboardAvoider: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: ms(24),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    backgroundColor: cardColor,
    borderRadius: ms(32),
    paddingTop: ms(32),
    paddingHorizontal: ms(28),
    paddingBottom: ms(32),
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: ms(12) },
    shadowRadius: ms(24),
    elevation: ms(12),
  },
  closeButton: {
    position: 'absolute',
    left: ms(24),
    top: ms(24),
    padding: ms(8),
  },
  headerIllustrationWrapper: {
    width: ms(160),
    height: ms(110),
    marginBottom: ms(16),
  },
  headline: {
    fontSize: ms(24),
    fontWeight: '700',
    color: headingColor,
    textAlign: 'center',
  },
  question: {
    marginTop: ms(8),
    fontSize: ms(18),
    color: bodyColor,
    textAlign: 'center',
  },
  restaurantName: {
    marginTop: ms(4),
    fontSize: ms(16),
    fontWeight: '600',
    color: accentColor,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: ms(16),
    marginBottom: ms(8),
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: ms(24),
    gap: ms(16),
    width: '100%',
  },
  choiceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  choiceButton: {
    borderWidth: ms(2),
    borderColor: borderColor,
    width: ms(96),
    height: ms(96),
    borderRadius: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  choiceButtonPositiveActive: {
    borderColor: positiveColor,
    backgroundColor: 'rgba(17, 24, 39, 0.08)',
  },
  choiceButtonNegativeActive: {
    borderColor: accentColor,
    backgroundColor: 'rgba(202, 37, 27, 0.08)',
  },
  choiceLabel: {
    fontSize: ms(16),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: ms(12),
  },
  choiceLabelPositive: {
    color: positiveColor,
  },
  choiceLabelNegative: {
    color: accentColor,
  },
  orLabel: {
    fontSize: ms(15),
    color: bodyColor,
    fontWeight: '500',
    marginTop: ms(12),
    marginBottom: ms(20),
    textAlign: 'center',
  },
  commentSection: {
    width: '100%',
  },
  commentLabel: {
    fontSize: ms(16),
    fontWeight: '600',
    color: headingColor,
    marginBottom: ms(12),
    alignSelf: 'flex-start',
  },
  commentInput: {
    width: '100%',
    minHeight: ms(120),
    borderWidth: ms(1),
    borderColor,
    borderRadius: ms(16),
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
    fontSize: ms(15),
    color: headingColor,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: ms(14),
    color: accentColor,
    marginTop: ms(12),
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: accentColor,
    borderRadius: ms(28),
    paddingVertical: ms(14),
    alignItems: 'center',
    marginTop: ms(24),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default RestaurantRatingOverlay;
